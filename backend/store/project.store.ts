import { create } from "zustand";

// ── Types ────────────────────────────────────────────────────────

export type ZoneType = "FORGE" | "FOUNDRY" | "ENGINE" | "BAZAAR" | "LOGIC";
export type ProjectStatus =
  | "IN_PROGRESS"
  | "DEPLOYED"
  | "ARCHIVED"
  | "QUARANTINED";

export interface DNAGenome {
  zone_type: ZoneType;
  blocks: Record<string, unknown>[];
  logic_nodes: Record<string, unknown>[];
  theme: Record<string, unknown>;
  integrations: Record<string, unknown>;
  meta: Record<string, unknown>;
}

export interface DNAString {
  project_id: string;
  version: number;
  genome: DNAGenome;
  updated_at: string;
}

export interface DNAMutation {
  mutation_id: string;
  project_id: string;
  diff: Partial<DNAGenome>;
  applied_at: string;
  label?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  zone_type: ZoneType;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  deployed_url?: string;
}

export interface ProjectState {
  projects: Project[];
  active_project: Project | null;
  active_dna: DNAString | null;
  version_history: DNAMutation[];
  is_saving: boolean;
  last_saved_at: string | null;
  unsaved_mutations: DNAMutation[];

  fetchProjects: () => Promise<void>;
  setActiveProject: (id: string) => Promise<void>;
  fetchDNA: (project_id: string) => Promise<void>;
  mutateDNA: (mutation: Partial<DNAGenome>) => Promise<void>;
  saveDNA: () => Promise<void>;
  rollback: (version: DNAMutation) => Promise<void>;
  createProject: (zone_type: ZoneType) => Promise<Project>;
  archiveProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

// ── Store — NO persistence ────────────────────────────────────────

export const useProjectStore = create<ProjectState>()((set, get) => ({
  projects: [],
  active_project: null,
  active_dna: null,
  version_history: [],
  is_saving: false,
  last_saved_at: null,
  unsaved_mutations: [],

  fetchProjects: async () => {
    const res = await fetch("/api/projects");
    if (!res.ok) return;
    const { projects } = await res.json();
    set({ projects: projects ?? [] });
  },

  setActiveProject: async (id: string) => {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) return;
    const project = await res.json();
    set({ active_project: project });
    await get().fetchDNA(id);
  },

  fetchDNA: async (project_id: string) => {
    const res = await fetch(`/api/projects/${project_id}/dna`);
    if (!res.ok) return;
    const { dna_string, version } = await res.json();
    set({
      active_dna: {
        project_id,
        version,
        genome: dna_string?.genome ?? dna_string ?? {},
        updated_at: new Date().toISOString(),
      },
      unsaved_mutations: [],
    });
  },

  mutateDNA: async (mutation: Partial<DNAGenome>) => {
    const { active_project, active_dna } = get();
    if (!active_project || !active_dna) return;

    const newMutation: DNAMutation = {
      mutation_id: crypto.randomUUID(),
      project_id: active_project.id,
      diff: mutation,
      applied_at: new Date().toISOString(),
    };

    // Optimistic local update
    set((state) => ({
      active_dna: state.active_dna
        ? {
            ...state.active_dna,
            genome: { ...state.active_dna.genome, ...mutation },
          }
        : null,
      unsaved_mutations: [...state.unsaved_mutations, newMutation],
    }));

    // Push to Upstash Redis edge cache
    await fetch(`/api/projects/${active_project.id}/dna`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patch: mutation,
        mutation_input: {
          changed_blocks: [],
          author: "USER" as const,
        },
      }),
    });
  },

  saveDNA: async () => {
    const { active_project } = get();
    if (!active_project) return;
    set({ is_saving: true });
    try {
      await fetch(`/api/projects/${active_project.id}/dna/save`, {
        method: "POST",
      });
      set({
        unsaved_mutations: [],
        last_saved_at: new Date().toISOString(),
      });
    } finally {
      set({ is_saving: false });
    }
  },

  rollback: async (version: DNAMutation) => {
    const { active_project } = get();
    if (!active_project) return;
    const res = await fetch(`/api/projects/${active_project.id}/rollback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_version: version.mutation_id,
        mode: "RESTORE",
      }),
    });
    if (!res.ok) return;
    const { dna_string } = await res.json();
    set({
      active_dna: {
        project_id: active_project.id,
        version: dna_string?.version ?? 1,
        genome: dna_string?.genome ?? dna_string ?? {},
        updated_at: new Date().toISOString(),
      },
      unsaved_mutations: [],
    });
  },

  createProject: async (zone_type: ZoneType) => {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zone_type, slug: `project-${Date.now()}` }),
    });
    const project = await res.json();
    set((state) => ({ projects: [project, ...state.projects] }));
    return project;
  },

  archiveProject: async (id: string) => {
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ARCHIVED" }),
    });
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, status: "ARCHIVED" as const } : p
      ),
    }));
  },

  deleteProject: async (id: string) => {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      active_project:
        state.active_project?.id === id ? null : state.active_project,
      active_dna: state.active_project?.id === id ? null : state.active_dna,
    }));
  },
}));

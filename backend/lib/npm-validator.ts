import "server-only";
// ═══════════════════════════════════════════════════════════════
// SVARNEX — npm Package Validator
// Gap Fix 7: Validates imports in Agent Beta–generated code.
//   1. Parse import/require statements from code string.
//   2. Filter out Node built-ins, relative paths, and allowlist.
//   3. Check remaining against the npm registry.
//   4. If any unknown → reject; don't store block.
// ═══════════════════════════════════════════════════════════════

// ─── Node built-in modules (core list) ───────────────────────
const NODE_BUILTINS = new Set([
  "assert",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "dns",
  "domain",
  "events",
  "fs",
  "http",
  "http2",
  "https",
  "module",
  "net",
  "os",
  "path",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "readline",
  "repl",
  "stream",
  "string_decoder",
  "sys",
  "timers",
  "tls",
  "tty",
  "url",
  "util",
  "v8",
  "vm",
  "wasi",
  "worker_threads",
  "zlib",
]);

// ─── Allowlisted packages (known safe for Svarnex blocks) ────
const ALLOWLIST = new Set([
  "react",
  "react-dom",
  "next",
  "next/image",
  "next/link",
  "next/navigation",
  "next/font",
  "next/server",
  "tailwindcss",
  "framer-motion",
  "lucide-react",
  "zod",
  "clsx",
  "class-variance-authority",
  "tailwind-merge",
  "@radix-ui",
  "three",
  "@react-three/fiber",
  "@react-three/drei",
]);

// ─── Types ───────────────────────────────────────────────────

export interface NpmValidationResult {
  valid: boolean;
  unknownPackages: string[];
  checkedPackages: string[];
}

// ─── Import parser ───────────────────────────────────────────

const IMPORT_RE =
  /(?:import\s+.*?\s+from\s+['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\)|import\s*\(\s*['"]([^'"]+)['"]\s*\))/g;

/**
 * Extracts unique top-level package names from code.
 * Handles: `import x from "pkg"`, `require("pkg")`, `import("pkg")`
 * Converts scoped paths like `@org/pkg/deep` → `@org/pkg`.
 */
export function extractImports(code: string): string[] {
  const found = new Set<string>();
  let match: RegExpExecArray | null;

  const regex = new RegExp(IMPORT_RE.source, IMPORT_RE.flags);
  while ((match = regex.exec(code)) !== null) {
    const raw = match[1] ?? match[2] ?? match[3];
    if (!raw) continue;

    // Skip relative imports
    if (raw.startsWith(".") || raw.startsWith("/")) continue;
    // Skip node: protocol prefix
    const specifier = raw.startsWith("node:") ? raw.slice(5) : raw;

    // Extract top-level package name
    const pkg = getTopLevelPackage(specifier);
    if (pkg) found.add(pkg);
  }

  return [...found];
}

function getTopLevelPackage(specifier: string): string | null {
  // Scoped: @org/pkg/deep → @org/pkg
  if (specifier.startsWith("@")) {
    const parts = specifier.split("/");
    if (parts.length < 2) return null;
    return `${parts[0]}/${parts[1]}`;
  }
  // Unscoped: pkg/deep → pkg
  return specifier.split("/")[0] ?? null;
}

// ─── Registry check ──────────────────────────────────────────

async function packageExistsOnNpm(pkg: string): Promise<boolean> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    // Network error → assume valid to avoid false positives
    return true;
  }
}

// ─── Main validator ──────────────────────────────────────────

/**
 * Validates all imports in a code string.
 *
 * 1. Parse imports from code.
 * 2. Skip Node built-ins and allowlisted packages.
 * 3. Check remainder against npm registry.
 * 4. Return { valid, unknownPackages }.
 */
export async function validateImports(
  code: string,
): Promise<NpmValidationResult> {
  const imports = extractImports(code);
  const toCheck: string[] = [];

  for (const pkg of imports) {
    // Skip built-ins
    if (NODE_BUILTINS.has(pkg)) continue;
    // Skip allowlisted (exact or prefix match for scoped)
    if (
      ALLOWLIST.has(pkg) ||
      [...ALLOWLIST].some((a) => pkg.startsWith(a + "/") || pkg === a)
    ) {
      continue;
    }
    toCheck.push(pkg);
  }

  if (toCheck.length === 0) {
    return { valid: true, unknownPackages: [], checkedPackages: imports };
  }

  // Check npm registry in parallel (max 5 concurrent)
  const unknown: string[] = [];

  // Process in batches of 5
  for (let i = 0; i < toCheck.length; i += 5) {
    const batch = toCheck.slice(i, i + 5);
    const results = await Promise.all(
      batch.map(async (pkg) => ({
        pkg,
        exists: await packageExistsOnNpm(pkg),
      })),
    );
    for (const r of results) {
      if (!r.exists) unknown.push(r.pkg);
    }
  }

  return {
    valid: unknown.length === 0,
    unknownPackages: unknown,
    checkedPackages: imports,
  };
}

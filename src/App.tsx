import { useMemo, useState } from "react";
import { Alert, AppBar, Box, Chip, Container, Divider, Grid2 as Grid, IconButton, LinearProgress, MenuItem, Paper, Select, Tab, Tabs, TextField, Toolbar, Typography } from "@mui/material";
import { Blocks, Bot, CreditCard, Database, GitBranch, Globe, Rocket, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/api";
import { ThreeBackground } from "@/three-background";

type ZoneType = "FORGE" | "FOUNDRY" | "ENGINE" | "BAZAAR" | "LOGIC";

interface Project {
  id: string;
  slug: string;
  status: string;
  zone_type: ZoneType;
  deployed_url?: string | null;
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [projectId, setProjectId] = useState("");
  const [zone, setZone] = useState<ZoneType>("FORGE");
  const [projects, setProjects] = useState<Project[]>([]);
  const [oracleInput, setOracleInput] = useState("Generate a premium landing hero");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const activeIcon = useMemo(
    () => [<Blocks size={16} />, <Bot size={16} />, <Rocket size={16} />, <CreditCard size={16} />, <ShieldCheck size={16} />, <GitBranch size={16} />][tab],
    [tab]
  );

  const run = async (label: string, fn: () => Promise<void>) => {
    setLoading(true);
    try {
      await fn();
      setLogs((s) => [`✅ ${label}`, ...s]);
    } catch (e) {
      setLogs((s) => [`❌ ${label}: ${(e as Error).message}`, ...s]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          <Globe size={20} />
          <Typography variant="h6">SVARNEX Frontend Console</Typography>
          <Chip label="Three.js + MUI + shadcn + Lucide" size="small" />
          <Box sx={{ ml: "auto" }}>{activeIcon}</Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 2 }}>
        <ThreeBackground />
        <Paper sx={{ mt: 2, p: 1 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
            <Tab label="Projects" />
            <Tab label="Oracle" />
            <Tab label="Materialize/Deploy" />
            <Tab label="Billing & Chips" />
            <Tab label="Devices & Security" />
            <Tab label="Admin & Analytics" />
          </Tabs>
        </Paper>

        {loading && <LinearProgress sx={{ mt: 1 }} />}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              {tab === 0 && (
                <Box sx={{ display: "grid", gap: 1 }}>
                  <Typography variant="h6">Project lifecycle</Typography>
                  <Select value={zone} onChange={(e) => setZone(e.target.value as ZoneType)} size="small">
                    {["FORGE", "FOUNDRY", "ENGINE", "BAZAAR", "LOGIC"].map((z) => (
                      <MenuItem key={z} value={z}>{z}</MenuItem>
                    ))}
                  </Select>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button onClick={() => run("Fetch Projects", async () => {
                      const data = await apiRequest<{ projects: Project[] }>("/api/projects");
                      setProjects(data.projects ?? []);
                    })}>Fetch Projects</Button>
                    <Button variant="outline" onClick={() => run("Create Project", async () => {
                      const data = await apiRequest<Project>("/api/projects", { method: "POST", body: JSON.stringify({ zone_type: zone, slug: `web-${Date.now()}` }) });
                      setProjectId(data.id);
                      setProjects((p) => [data, ...p]);
                    })}>Create Project</Button>
                    <Button variant="secondary" onClick={() => run("Archive Project", async () => {
                      await apiRequest(`/api/projects/${projectId}`, { method: "PATCH", body: JSON.stringify({ status: "ARCHIVED" }) });
                    })}>Archive</Button>
                    <Button variant="outline" onClick={() => run("Delete Project", async () => {
                      await apiRequest(`/api/projects/${projectId}`, { method: "DELETE" });
                    })}>Delete</Button>
                  </Box>
                  <TextField label="Project ID" size="small" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
                  {projects.map((p) => (
                    <Paper key={p.id} variant="outlined" sx={{ p: 1 }}>
                      <b>{p.slug}</b> · {p.zone_type} · {p.status}
                    </Paper>
                  ))}
                </Box>
              )}

              {tab === 1 && (
                <Box sx={{ display: "grid", gap: 1 }}>
                  <Typography variant="h6">Oracle chat + history</Typography>
                  <TextField size="small" label="Project ID" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
                  <TextField multiline minRows={3} value={oracleInput} onChange={(e) => setOracleInput(e.target.value)} />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button onClick={() => run("Oracle Chat", async () => {
                      await apiRequest("/api/oracle/chat", { method: "POST", body: JSON.stringify({ project_id: projectId, message: oracleInput, stream: false }) });
                    })}>Send</Button>
                    <Button variant="outline" onClick={() => run("Oracle History", async () => {
                      await apiRequest(`/api/oracle/history/${projectId}`);
                    })}>History</Button>
                    <Button variant="secondary" onClick={() => run("SEO Generate", async () => {
                      await apiRequest("/api/seo/generate", { method: "POST", body: JSON.stringify({ project_id: projectId, trigger: "MANUAL" }) });
                    })}>Generate SEO</Button>
                  </Box>
                </Box>
              )}

              {tab === 2 && (
                <Box sx={{ display: "grid", gap: 1 }}>
                  <Typography variant="h6">Materialisation + Deploy + Export + DNA</Typography>
                  <TextField size="small" label="Project ID" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button onClick={() => run("Materialize", async () => { await apiRequest(`/api/projects/${projectId}/materialize`, { method: "POST", body: "{}" }); })}>Materialize</Button>
                    <Button variant="outline" onClick={() => run("Deploy", async () => { await apiRequest(`/api/projects/${projectId}/deploy`, { method: "POST", body: JSON.stringify({ target: "VERCEL" }) }); })}>Deploy</Button>
                    <Button variant="outline" onClick={() => run("Export", async () => { await apiRequest(`/api/projects/${projectId}/export`, { method: "POST", body: JSON.stringify({ format: "NEXTJS" }) }); })}>Export</Button>
                    <Button variant="secondary" onClick={() => run("Fetch DNA", async () => { await apiRequest(`/api/projects/${projectId}/dna`); })}>DNA GET</Button>
                    <Button variant="secondary" onClick={() => run("Patch DNA", async () => { await apiRequest(`/api/projects/${projectId}/dna`, { method: "PATCH", body: JSON.stringify({ patch: { meta: { from_ui: true } }, mutation_input: { changed_blocks: [], author: "USER" } }) }); })}>DNA PATCH</Button>
                    <Button variant="outline" onClick={() => run("Versions", async () => { await apiRequest(`/api/projects/${projectId}/versions`); })}>Versions</Button>
                    <Button variant="outline" onClick={() => run("Rollback", async () => { await apiRequest(`/api/projects/${projectId}/rollback`, { method: "POST", body: JSON.stringify({ target_version: "v1.0", mode: "RESTORE" }) }); })}>Rollback</Button>
                  </Box>
                </Box>
              )}

              {tab === 3 && (
                <Box sx={{ display: "grid", gap: 1 }}>
                  <Typography variant="h6">Chips + subscriptions</Typography>
                  <Button onClick={() => run("Balance", async () => { await apiRequest("/api/chips/balance"); })}>Check Balance</Button>
                  <Button variant="outline" onClick={() => run("Top Up", async () => {
                    await apiRequest("/api/chips/topup", { method: "POST", body: JSON.stringify({ package: "PACK_500", payment_method: "RAZORPAY" }) });
                  })}>Topup</Button>
                </Box>
              )}

              {tab === 4 && (
                <Box sx={{ display: "grid", gap: 1 }}>
                  <Typography variant="h6">Devices + integration callbacks</Typography>
                  <Button onClick={() => run("Register Device", async () => { await apiRequest("/api/devices/register", { method: "POST", body: JSON.stringify({ device_label: "Frontend Browser", hw_hash: "dev-hash" }) }); })}>Register Device</Button>
                  <Button variant="outline" onClick={() => run("Verify OTP", async () => { await apiRequest("/api/devices/verify-otp", { method: "POST", body: JSON.stringify({ challenge_id: "challenge", otp_code: "123456" }) }); })}>Verify OTP</Button>
                  <Button variant="outline" onClick={() => run("List Devices", async () => { await apiRequest("/api/devices/list"); })}>List Devices</Button>
                  <Button variant="secondary" onClick={() => run("Remove Device", async () => { await apiRequest("/api/devices/remove", { method: "DELETE", body: JSON.stringify({ trust_id: "trust-id" }) }); })}>Remove Device</Button>
                  <Divider />
                  <Button variant="outline" onClick={() => run("Razorpay Connect", async () => { await apiRequest("/api/integrations/razorpay/connect?project_id=" + projectId); })}>Razorpay Connect</Button>
                  <Button variant="outline" onClick={() => run("WhatsApp Connect", async () => { await apiRequest("/api/integrations/whatsapp/connect?project_id=" + projectId); })}>WhatsApp Connect</Button>
                </Box>
              )}

              {tab === 5 && (
                <Box sx={{ display: "grid", gap: 1 }}>
                  <Typography variant="h6">Analytics + Admin + Webhooks</Typography>
                  <Button onClick={() => run("Auth Session", async () => { await apiRequest("/api/auth/session"); })}>Session</Button>
                  <Button variant="outline" onClick={() => run("Pixel Event", async () => { await apiRequest("/api/analytics/pixel", { method: "POST", body: JSON.stringify({ events: [{ event_type: "PAGEVIEW", project_id: projectId, visitor_hash: "hash", url: window.location.href, timestamp: new Date().toISOString() }] }) }); })}>Send Pixel</Button>
                  <Button variant="outline" onClick={() => run("Domain Verify", async () => { await apiRequest("/api/domains/verify", { method: "POST", body: JSON.stringify({ project_id: projectId, domain: "example.com", action: "CHECK" }) }); })}>Verify Domain</Button>
                  <Button variant="secondary" onClick={() => run("Factory Admin", async () => { await apiRequest("/api/admin/factory"); })}>Factory</Button>
                  <Alert severity="info" icon={<Database size={16} />}>Frontend only calls APIs. No database schema/data changed.</Alert>
                </Box>
              )}
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <Typography variant="h6">Request Log</Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ maxHeight: 540, overflow: "auto", display: "grid", gap: 0.75 }}>
                {logs.length === 0 && <Typography color="text.secondary">No actions yet.</Typography>}
                {logs.map((line, i) => (
                  <Typography key={i} variant="body2">{line}</Typography>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

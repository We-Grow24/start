import "server-only";

/**
 * Calls the Vercel Deploy Hook API to trigger a new deployment.
 * Requires VERCEL_DEPLOY_HOOK_URL env var to be set.
 *
 * @param projectId — Svarnex project ID, passed as metadata
 * @returns deployId and deployUrl from the Vercel response
 */
export async function initiateVercelDeploy(
  projectId: string
): Promise<{ deployId: string; deployUrl: string }> {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;

  if (!hookUrl) {
    throw new Error(
      "VERCEL_DEPLOY_HOOK_URL is not configured in environment variables"
    );
  }

  const res = await fetch(hookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      meta: { svarnex_project_id: projectId },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Vercel Deploy Hook failed: ${res.status} — ${body}`
    );
  }

  const data = (await res.json()) as {
    job: { id: string; createdAt: number };
  };

  return {
    deployId: data.job.id,
    deployUrl: `https://vercel.com/deployments/${data.job.id}`,
  };
}

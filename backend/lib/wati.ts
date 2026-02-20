// ═══════════════════════════════════════════════════════════════
// SVARNEX — lib/wati.ts
// S6-M-01: Wati (WhatsApp Business) API client
// ═══════════════════════════════════════════════════════════════

const WATI_API_BASE = process.env.WATI_API_BASE ?? "https://live-server-108011.wati.io/api/v1";
const WATI_API_TOKEN = process.env.WATI_API_TOKEN ?? "";

interface WatiSendMessageParams {
  phone: string;
  template_name: string;
  parameters: Array<{ name: string; value: string }>;
}

interface WatiResponse {
  result: boolean;
  info?: string;
}

/**
 * Send a template-based WhatsApp message via Wati API.
 */
export async function sendWatiTemplateMessage(
  params: WatiSendMessageParams
): Promise<WatiResponse> {
  const res = await fetch(`${WATI_API_BASE}/sendTemplateMessage`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WATI_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      broadcast_name: "svarnex_transactional",
      template_name: params.template_name,
      parameters: params.parameters,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Wati API error: ${res.status} ${text}`);
  }

  return res.json() as Promise<WatiResponse>;
}

/**
 * Send a session (free-form) WhatsApp message via Wati API.
 */
export async function sendWatiSessionMessage(
  phone: string,
  message: string
): Promise<WatiResponse> {
  const res = await fetch(`${WATI_API_BASE}/sendSessionMessage/${encodeURIComponent(phone)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WATI_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messageText: message }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Wati session message error: ${res.status} ${text}`);
  }

  return res.json() as Promise<WatiResponse>;
}

/**
 * Fetch Wati contact by phone number.
 */
export async function getWatiContact(phone: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${WATI_API_BASE}/getContacts?search=${encodeURIComponent(phone)}`, {
    headers: {
      Authorization: `Bearer ${WATI_API_TOKEN}`,
    },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { contact_list?: Array<Record<string, unknown>> };
  return data.contact_list?.[0] ?? null;
}

/**
 * Generate Wati OAuth connect URL.
 */
export function getWatiOAuthUrl(callbackUrl: string): string {
  return `${WATI_API_BASE}/oauth/authorize?callback_url=${encodeURIComponent(callbackUrl)}`;
}

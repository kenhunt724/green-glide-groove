/**
 * Mirror every new energy lead into the Google Sheet the team works from.
 * Server-only: uses the Lovable connector gateway with the linked Google
 * Sheets connection. Failures here never block a lead from being saved.
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";

export const LEADS_SPREADSHEET_ID = "1_3S6lvzVAaQXKEuQHRvVVYAeJPiCkBpGDxFTehMOAvE";
const TAB = "Sheet1";

const HEADERS = [
  "Logged at",
  "Name",
  "Phone",
  "Email",
  "ZIP",
  "Interested in",
  "Site type",
  "Monthly bill",
  "Preferred time",
  "Booked slot",
  "Channel",
  "Channel detail",
  "Campaign",
  "Entry mode",
  "Notes",
];

export type LeadRow = {
  created_at?: string;
  full_name: string;
  phone: string;
  email?: string | null;
  zip_code: string;
  solution_interest?: string | null;
  property_type?: string | null;
  monthly_bill_range?: string | null;
  preferred_time?: string | null;
  booked_slot?: string | null;
  source_channel?: string | null;
  source_detail?: string | null;
  utm_campaign?: string | null;
  entry_mode?: string | null;
  notes?: string | null;
};

function authHeaders() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["GOOGLE_SHEETS_API_KEY"];
  if (!lovableKey || !connectionKey) return null;
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": connectionKey,
    "Content-Type": "application/json",
  };
}

async function ensureHeaderRow(headers: Record<string, string>) {
  const res = await fetch(
    `${GATEWAY_URL}/spreadsheets/${LEADS_SPREADSHEET_ID}/values/${TAB}!A1:O1`,
    { headers },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sheets header read failed [${res.status}]: ${body}`);
  }
  const json = (await res.json()) as { values?: string[][] };
  if (json.values?.[0]?.length) return;

  const put = await fetch(
    `${GATEWAY_URL}/spreadsheets/${LEADS_SPREADSHEET_ID}/values/${TAB}!A1:O1?valueInputOption=RAW`,
    { method: "PUT", headers, body: JSON.stringify({ values: [HEADERS] }) },
  );
  if (!put.ok) {
    const body = await put.text();
    throw new Error(`Sheets header write failed [${put.status}]: ${body}`);
  }
}

/** Append one lead. Returns true when the row landed in the sheet. */
export async function appendLeadToSheet(lead: LeadRow): Promise<boolean> {
  const headers = authHeaders();
  if (!headers) {
    console.warn("Google Sheets mirror skipped: connector env vars missing");
    return false;
  }

  try {
    await ensureHeaderRow(headers);

    const row = [
      lead.created_at ?? new Date().toISOString(),
      lead.full_name,
      lead.phone,
      lead.email ?? "",
      lead.zip_code,
      lead.solution_interest ?? "",
      lead.property_type ?? "",
      lead.monthly_bill_range ?? "",
      lead.preferred_time ?? "",
      lead.booked_slot ?? "",
      lead.source_channel ?? "Unattributed",
      lead.source_detail ?? "",
      lead.utm_campaign ?? "",
      lead.entry_mode ?? "",
      lead.notes ?? "",
    ];

    const res = await fetch(
      `${GATEWAY_URL}/spreadsheets/${LEADS_SPREADSHEET_ID}/values/${TAB}!A1:O1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      { method: "POST", headers, body: JSON.stringify({ values: [row] }) },
    );
    if (!res.ok) {
      const body = await res.text();
      console.error(`Sheets append failed [${res.status}]: ${body}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Sheets mirror error", e);
    return false;
  }
}

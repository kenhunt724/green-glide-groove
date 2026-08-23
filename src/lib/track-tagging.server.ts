/** Server-only helpers for machine-generated track metadata. */

export type TrackTagResult = {
  tags: string[];
  genre: string | null;
  mood: string | null;
  instruments: string[];
  bpm: number | null;
  musical_key: string | null;
  summary: string | null;
};

type TagInput = {
  kind: "audio" | "video" | "art";
  title: string;
  description?: string | null;
  license_terms?: string | null;
  master_format?: string | null;
  filename?: string | null | undefined;
};

const MODEL = "google/gemini-3.7-flash";

function clampList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim().toLowerCase())
    .filter((v) => v.length > 0 && v.length <= 40)
    .slice(0, max);
}

function clampText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export async function generateTrackTags(input: TagInput): Promise<TrackTagResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

  const prompt = [
    `Work type: ${input.kind}`,
    `Title: ${input.title}`,
    input.filename ? `File name: ${input.filename}` : null,
    input.master_format ? `Master format: ${input.master_format}` : null,
    input.description ? `Creator notes: ${input.description}` : null,
    input.license_terms ? `License terms: ${input.license_terms}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a music and media librarian for an independent record label. From the metadata you are given, infer catalogue tags for the work. Return strict JSON only. Use at most 8 short lowercase tags (1-3 words each). Estimate bpm only when the material clearly implies a tempo, otherwise use null. Keep the summary under 200 characters. Never invent facts you cannot reasonably infer; use null or an empty list instead.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`AI tagging failed (${res.status}): ${body.slice(0, 300)}`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }

  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = json.choices?.[0]?.message?.content ?? "{}";
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]) as Record<string, unknown>;
  }

  const bpmRaw = Number(parsed["bpm"]);
  return {
    tags: clampList(parsed["tags"], 8),
    genre: clampText(parsed["genre"], 60),
    mood: clampText(parsed["mood"], 60),
    instruments: clampList(parsed["instruments"], 8),
    bpm: Number.isFinite(bpmRaw) && bpmRaw > 20 && bpmRaw < 300 ? Math.round(bpmRaw) : null,
    musical_key: clampText(parsed["key"] ?? parsed["musical_key"], 20),
    summary: clampText(parsed["summary"], 240),
  };
}

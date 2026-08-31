export async function transcribeWav(base64: string): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Voice input is not configured.");

  const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  if (binary.byteLength < 2048) {
    throw new Error("That recording was empty — please try again.");
  }
  if (binary.byteLength > 20 * 1024 * 1024) {
    throw new Error("That recording is too long. Keep it under a minute.");
  }

  const form = new FormData();
  form.append("model", "openai/gpt-4o-transcribe");
  form.append("file", new Blob([binary], { type: "audio/wav" }), "recording.wav");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (response.status === 429) throw new Error("Voice input is busy — try again in a moment.");
    if (response.status === 402) throw new Error("Voice credits are exhausted for this workspace.");
    throw new Error(`Transcription failed (${response.status}). ${body.slice(0, 200)}`);
  }

  const json = (await response.json()) as { text?: string };
  return (json.text ?? "").trim();
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  audio: z.string().min(100).max(28_000_000),
});

export const transcribeAudio = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { transcribeWav } = await import("./transcribe.server");
    const text = await transcribeWav(data.audio);
    return { text };
  });

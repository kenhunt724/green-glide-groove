import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callGateway } from "./assistant.server";

const schema = z.object({
  mode: z.enum(["support", "interview"]),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
});

export type AssistantRequest = z.infer<typeof schema>;

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const reply = await callGateway(data.mode, data.messages);
    return { reply };
  });

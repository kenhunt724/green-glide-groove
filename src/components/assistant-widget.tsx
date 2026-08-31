import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Loader2, MessageSquare, Mic, Phone, Send, Square, X } from "lucide-react";

import { askAssistant } from "@/lib/assistant.functions";
import { transcribeAudio } from "@/lib/transcribe.functions";
import { useVoiceInput } from "@/lib/use-voice-input";
import { cn } from "@/lib/utils";

type Mode = "support" | "interview";
type Msg = { role: "user" | "assistant"; content: string };

const GREETINGS: Record<Mode, string> = {
  support:
    "Hi — I'm the Earth Protection Society assistant. Ask me about power harvesters, site evaluations, pricing or ownership. For a same-day evaluation you can also call 404-454-0602.",
  interview:
    "Welcome to the Energy Corps screening. I'll ask a few quick questions about your background. First — which role are you interested in, and what city are you in?",
};

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("support");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: GREETINGS.support },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ask = useServerFn(askAssistant);
  const transcribe = useServerFn(transcribeAudio);

  const appendTranscript = useCallback((text: string) => {
    setInput((prev) => (prev ? `${prev.trim()} ${text}` : text));
  }, []);
  const { recording, transcribing, voiceError, toggle } = useVoiceInput(appendTranscript);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending, open]);

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    setError(null);
    setMessages([{ role: "assistant", content: GREETINGS[next] }]);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending) return;

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setError(null);
    setPending(true);

    try {
      const result = await ask({
        data: { mode, messages: next.slice(-20).map((m) => ({ role: m.role, content: m.content })) },
      });
      setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please call 404-454-0602.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-lg transition-colors hover:bg-muted md:bottom-6 md:right-6"
          aria-label="Open the Earth Protection Society assistant"
        >
          <MessageSquare className="size-4" aria-hidden="true" />
          Ask EPS
        </button>
      )}

      {open && (
        <div className="fixed inset-x-3 bottom-3 z-50 flex max-h-[80vh] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl md:inset-x-auto md:right-6 md:bottom-6 md:h-[560px] md:w-[400px]">
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-energy" aria-hidden="true" />
              <p className="text-sm font-semibold">EPS Assistant</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close assistant"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-px border-b border-border bg-border">
            {(["support", "interview"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  "bg-background px-3 py-2 text-xs font-medium uppercase tracking-wide transition-colors",
                  mode === m ? "text-energy" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "support" ? "Customer service" : "Job interview"}
              </button>
            ))}
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "ml-auto bg-energy/15 text-foreground"
                    : "bg-surface text-muted-foreground",
                )}
              >
                {m.content}
              </div>
            ))}
            {pending && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                Thinking…
              </div>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
            {voiceError && <p className="text-xs text-destructive">{voiceError}</p>}
            {recording && (
              <p className="text-xs text-energy">Listening… tap the stop button when you're done.</p>
            )}
            {transcribing && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                Transcribing…
              </div>
            )}
          </div>

          <form onSubmit={send} className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(e as unknown as React.FormEvent);
                  }
                }}
                rows={2}
                placeholder={
                  mode === "support" ? "Ask about power harvesters…" : "Type your answer…"
                }
                className="min-h-[44px] flex-1 resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-energy"
              />
              <button
                type="submit"
                disabled={pending || !input.trim()}
                className="inline-flex size-10 items-center justify-center rounded-md bg-energy text-background transition-opacity disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="size-4" aria-hidden="true" />
              </button>
            </div>
            <a
              href="tel:+14044540602"
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Phone className="size-3" aria-hidden="true" />
              Prefer a human? Call 404-454-0602
            </a>
          </form>
        </div>
      )}
    </>
  );
}

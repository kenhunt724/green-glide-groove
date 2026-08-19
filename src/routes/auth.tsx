import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Operations Sign In | Earth Protection Society" },
      {
        name: "description",
        content:
          "Staff sign-in for the Earth Protection Society capacity and delivery operations console.",
      },
      { property: "og:title", content: "Operations Sign In | Earth Protection Society" },
      {
        property: "og:description",
        content: "Staff sign-in for the EPS capacity and delivery operations console.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/ops/capacity` },
      });
      setBusy(false);
      if (err) setError(err.message);
      else setMessage("Check your email to confirm the account, then sign in.");
      return;
    }

    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (err) setError(err.message);
    else navigate({ to: "/ops/capacity" });
  }

  return (
    <main id="main" className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-6 py-16">
      <p className="label-mono text-energy">Earth Protection Society</p>
      <h1 className="mt-3 font-display text-3xl font-semibold">Operations console</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Staff access only. Capacity planning, lead readiness scoring, and throughput forecasting.
      </p>

      <form onSubmit={onSubmit} className="surface-panel mt-8 space-y-5 p-6">
        <div className="space-y-2">
          <Label htmlFor="ops-email">Email</Label>
          <Input
            id="ops-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ops-password">Password</Label>
          <Input
            id="ops-password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p role="alert" className="border border-destructive/60 bg-destructive/10 p-3 text-sm">
            {error}
          </p>
        )}
        {message && (
          <p className="border border-emerald/60 bg-emerald/10 p-3 text-sm">{message}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="label-mono inline-flex min-h-11 w-full items-center justify-center gap-2 bg-energy px-6 font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {mode === "signin" ? "Sign in" : "Create staff account"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setMessage(null);
          }}
          className="label-mono w-full text-muted-foreground hover:text-energy"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </form>
    </main>
  );
}

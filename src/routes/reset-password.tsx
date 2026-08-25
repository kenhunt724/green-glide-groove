import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Reset Password | Earth Protection Society" },
      {
        name: "description",
        content: "Set a new password for your Earth Protection Society staff account.",
      },
      { property: "og:title", content: "Reset Password | Earth Protection Society" },
      {
        property: "og:description",
        content: "Set a new password for your EPS staff account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the recovery link is opened.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    // Some flows hydrate the session before the listener attaches.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate({ to: "/ops/capacity" }), 1500);
  }

  return (
    <main id="main" className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-6 py-16">
      <p className="label-mono text-energy">Earth Protection Society</p>
      <h1 className="mt-3 font-display text-3xl font-semibold">Reset your password</h1>

      {!ready && !done && (
        <div className="surface-panel mt-8 p-6">
          <p className="text-sm text-muted-foreground">
            This page must be opened from the reset link in your email. If you landed here directly,
            request a new link.
          </p>
          <Link
            to="/auth"
            className="label-mono mt-4 inline-flex min-h-11 items-center justify-center bg-energy px-6 font-semibold text-background transition-opacity hover:opacity-90"
          >
            Back to sign in
          </Link>
        </div>
      )}

      {done && (
        <div className="surface-panel mt-8 p-6">
          <p className="border border-emerald/60 bg-emerald/10 p-3 text-sm">
            Password updated. Taking you to the operations console…
          </p>
        </div>
      )}

      {ready && !done && (
        <form onSubmit={onSubmit} className="surface-panel mt-8 space-y-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="border border-destructive/60 bg-destructive/10 p-3 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="label-mono inline-flex min-h-11 w-full items-center justify-center gap-2 bg-energy px-6 font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Set new password
          </button>
        </form>
      )}
    </main>
  );
}

import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  listClientStores,
  createClientStore,
  updateClientStore,
  deleteClientStore,
  sendClientAccessLink,
  type AdminStore,
} from "@/lib/store-admin.functions";

export const Route = createFileRoute("/_authenticated/ops/stores")({
  component: ClientStoresConsole,
  head: () => ({
    meta: [
      { title: "Client Stores Console | Earth Protection Society Operations" },
      {
        name: "description",
        content:
          "Internal console to open, edit, publish and hand over Ultra-Streaming client storefronts on behalf of creators.",
      },
      { property: "og:title", content: "Client Stores Console | Earth Protection Society" },
      { property: "og:description", content: "Open and manage Ultra-Streaming client storefronts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ClientStoresConsole() {
  const listFn = useServerFn(listClientStores);
  const createFn = useServerFn(createClientStore);
  const updateFn = useServerFn(updateClientStore);
  const deleteFn = useServerFn(deleteClientStore);
  const linkFn = useServerFn(sendClientAccessLink);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-client-stores"],
    queryFn: () => listFn(),
    retry: false,
  });

  const [form, setForm] = useState({
    handle: "",
    display_name: "",
    city: "Atlanta, GA",
    tagline: "",
    owner_email: "",
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-client-stores"] });

  const create = useMutation({
    mutationFn: () => createFn({ data: form }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error ?? "Could not open that store.");
        return;
      }
      toast.success(
        res.accountCreated
          ? `Store opened at /c/${res.handle} and an account was created for the client.`
          : `Store opened at /c/${res.handle}.`,
      );
      setForm({ handle: "", display_name: "", city: "Atlanta, GA", tagline: "", owner_email: "" });
      invalidate();
    },
    onError: () => toast.error("Could not open that store."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error ?? "Could not remove that store.");
        return;
      }
      toast.success("Store removed.");
      invalidate();
    },
  });

  const accessLink = useMutation({
    mutationFn: (email: string) =>
      linkFn({ data: { email, redirect_to: `${window.location.origin}/creator/dashboard` } }),
    onSuccess: async (res) => {
      if (!res.ok || !res.link) {
        toast.error(res.error ?? "Could not generate a link.");
        return;
      }
      await navigator.clipboard.writeText(res.link).catch(() => undefined);
      toast.success("Sign-in link copied — paste it to your client.");
    },
  });

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-6 py-16">
      <p className="label-mono text-energy">Operations</p>
      <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Client stores</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Open an Ultra-Streaming storefront for a client, edit it on their behalf, publish it, and hand them a
        sign-in link when they are ready to run it themselves.
      </p>
      <p className="mt-4 text-sm">
        <Link to="/ops/capacity" className="text-energy underline">
          Capacity console
        </Link>
      </p>

      <section className="surface-panel mt-10 space-y-5 p-6">
        <h2 className="font-display text-xl font-semibold">Open a new store</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="display_name">Client / artist name</Label>
            <Input
              id="display_name"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              placeholder="Nightshift Choir"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="handle">Store address</Label>
            <Input
              id="handle"
              value={form.handle}
              onChange={(e) => setForm({ ...form, handle: e.target.value.toLowerCase() })}
              placeholder="nightshift-choir"
            />
            <p className="text-xs text-muted-foreground">Becomes /c/{form.handle || "your-handle"}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner_email">Client email</Label>
            <Input
              id="owner_email"
              type="email"
              value={form.owner_email}
              onChange={(e) => setForm({ ...form, owner_email: e.target.value })}
              placeholder="client@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="Uncompressed 432Hz masters, owned outright."
            />
          </div>
        </div>
        <Button
          onClick={() => create.mutate()}
          disabled={create.isPending || !form.handle || !form.display_name || !form.owner_email}
        >
          {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Open store
        </Button>
      </section>

      <section className="mt-12 space-y-6">
        <h2 className="font-display text-xl font-semibold">Existing stores</h2>
        {isLoading && <p className="text-muted-foreground">Loading stores…</p>}
        {error && (
          <p className="text-destructive">
            You need an admin role on your account to manage client stores.
          </p>
        )}
        {data?.length === 0 && <p className="text-muted-foreground">No client stores yet.</p>}
        {data?.map((store) => (
          <StoreRow
            key={store.id}
            store={store}
            onSave={async (patch) => {
              const res = await updateFn({ data: { id: store.id, ...patch } });
              if (!res.ok) toast.error(res.error ?? "Could not save.");
              else {
                toast.success("Saved.");
                invalidate();
              }
            }}
            onDelete={() => remove.mutate(store.id)}
            onAccessLink={() => store.owner_email && accessLink.mutate(store.owner_email)}
          />
        ))}
      </section>
    </main>
  );
}

function StoreRow({
  store,
  onSave,
  onDelete,
  onAccessLink,
}: {
  store: AdminStore;
  onSave: (patch: { display_name: string; city: string; tagline: string; published: boolean }) => Promise<void>;
  onDelete: () => void;
  onAccessLink: () => void;
}) {
  const [draft, setDraft] = useState({
    display_name: store.display_name,
    city: store.city,
    tagline: store.tagline,
    published: store.published,
  });
  const [saving, setSaving] = useState(false);

  return (
    <article className="surface-panel space-y-4 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-mono text-xs text-energy">/c/{store.handle}</p>
          <p className="mt-1 font-display text-lg font-semibold">{store.display_name}</p>
          <p className="text-sm text-muted-foreground">
            {store.owner_email ?? "no account email"} · {store.item_count} work
            {store.item_count === 1 ? "" : "s"}
          </p>
        </div>
        <Badge variant={store.published ? "default" : "secondary"}>
          {store.published ? "Live" : "Draft"}
        </Badge>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={draft.display_name}
            onChange={(e) => setDraft({ ...draft, display_name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Tagline</Label>
          <Input value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id={`pub-${store.id}`}
            checked={draft.published}
            onCheckedChange={(v) => setDraft({ ...draft, published: v })}
          />
          <Label htmlFor={`pub-${store.id}`}>Published</Label>
        </div>
        <Button
          size="sm"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onSave(draft);
            setSaving(false);
          }}
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
        <Button size="sm" variant="secondary" onClick={onAccessLink} disabled={!store.owner_email}>
          <Copy className="mr-2 h-4 w-4" /> Copy client sign-in link
        </Button>
        <Link
          to="/c/$handle"
          params={{ handle: store.handle }}
          className="inline-flex items-center gap-2 text-sm text-energy underline"
        >
          <ExternalLink className="h-4 w-4" /> View store
        </Link>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive"
          onClick={() => {
            if (confirm(`Remove ${store.display_name}'s store? This deletes their works too.`)) onDelete();
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Remove
        </Button>
      </div>
    </article>
  );
}

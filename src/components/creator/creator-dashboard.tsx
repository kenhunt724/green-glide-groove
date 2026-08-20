import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  CREATOR_KINDS,
  DEFAULT_MAX_MASTER_BYTES,
  formatBytes,
  normalizeHandle,
  validateMasterFile,
  validatePreviewFile,
  type CreatorKind,
} from "@/lib/creator-formats";
import {
  claimCreatorInvite,
  deleteCreatorItem,
  exportCreatorArchive,
  getMyCreatorPage,
  saveCreatorItem,
  saveCreatorPage,
  takedownCreatorPage,
} from "@/lib/creator.functions";

const btn =
  "label-mono inline-flex min-h-11 items-center justify-center gap-2 bg-energy px-5 font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-40";
const ghostBtn =
  "label-mono inline-flex min-h-11 items-center justify-center gap-2 border border-border px-5 transition-colors hover:border-energy hover:text-energy disabled:opacity-40";

export function CreatorDashboard() {
  const queryClient = useQueryClient();
  const load = useServerFn(getMyCreatorPage);
  const { data, isLoading } = useQuery({ queryKey: ["creator", "me"], queryFn: () => load() });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-energy" aria-label="Loading your page" />
      </div>
    );
  }

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["creator", "me"] });

  if (!data?.page) {
    return <ClaimForm remaining={data?.status.remaining ?? 0} onDone={refresh} />;
  }

  return (
    <div className="space-y-12">
      <PageEditor page={data.page} onDone={refresh} />
      <WorksEditor
        items={data.items}
        maxMasterBytes={data.status?.maxMasterBytes ?? DEFAULT_MAX_MASTER_BYTES}
        onDone={refresh}
      />
      <OwnershipPanel handle={data.page.handle} onDone={refresh} />
    </div>
  );
}

function ClaimForm({ remaining, onDone }: { remaining: number; onDone: () => void }) {
  const claim = useServerFn(claimCreatorInvite);
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await claim({
        data: { code, display_name: displayName, handle: normalizeHandle(handle || displayName) },
      });
      if (!res.ok) toast.error(res.error ?? "Could not claim that invite.");
      else {
        toast.success("Your page is claimed. Start uploading.");
        onDone();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface-panel space-y-5 p-6">
      <div>
        <p className="label-mono text-energy">Invite only</p>
        <h2 className="mt-2 font-display text-2xl font-semibold">Claim your creator page</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {remaining > 0
            ? `${remaining} creator ${remaining === 1 ? "slot" : "slots"} left in this cohort.`
            : "All slots in this cohort are filled. Your invite will apply to the next opening."}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="invite-code">Invite code</Label>
        <Input
          id="invite-code"
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="EPS-XXXX-XXXX"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="display-name">Display name</Label>
        <Input id="display-name" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="handle">Page address</Label>
        <Input
          id="handle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder={normalizeHandle(displayName) || "your-name"}
        />
        <p className="text-xs text-muted-foreground">
          earthresonancehub.com/c/{normalizeHandle(handle || displayName) || "your-name"}
        </p>
      </div>
      <button type="submit" disabled={busy} className={btn}>
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />} Claim page
      </button>
    </form>
  );
}

function PageEditor({
  page,
  onDone,
}: {
  page: { display_name: string; city: string; tagline: string; bio: string; contact_email: string | null; published: boolean; handle: string };
  onDone: () => void;
}) {
  const save = useServerFn(saveCreatorPage);
  const [form, setForm] = useState({
    display_name: page.display_name,
    city: page.city,
    tagline: page.tagline,
    bio: page.bio,
    contact_email: page.contact_email ?? "",
    published: page.published,
  });
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await save({ data: form });
      if (!res.ok) toast.error(res.error ?? "Could not save.");
      else {
        toast.success("Page saved.");
        onDone();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface-panel space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold">Your page</h2>
        <a href={`/c/${page.handle}`} className="label-mono text-muted-foreground hover:text-energy">
          /c/{page.handle}
        </a>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="p-name">Display name</Label>
          <Input id="p-name" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-city">City</Label>
          <Input id="p-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="p-tagline">Tagline</Label>
        <Input id="p-tagline" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="p-bio">Bio</Label>
        <Textarea id="p-bio" rows={5} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="p-email">Contact email</Label>
        <Input id="p-email" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
      </div>
      <div className="flex items-center gap-3">
        <Switch id="p-published" checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
        <Label htmlFor="p-published">Page is live to the public</Label>
      </div>
      <button type="submit" disabled={busy} className={btn}>
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />} Save page
      </button>
    </form>
  );
}

type ItemRow = {
  id: string;
  kind: CreatorKind;
  title: string;
  master_format: string | null;
  master_bytes: number | null;
  published: boolean;
};

function WorksEditor({
  items,
  maxMasterBytes,
  onDone,
}: {
  items: ItemRow[];
  maxMasterBytes: number;
  onDone: () => void;
}) {
  const save = useServerFn(saveCreatorItem);
  const remove = useServerFn(deleteCreatorItem);
  const [kind, setKind] = useState<CreatorKind>("audio");
  const [title, setTitle] = useState("");
  const [license, setLicense] = useState("");
  const [master, setMaster] = useState<File | null>(null);
  const [preview, setPreview] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function upload(bucket: string, file: File) {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) throw new Error("Signed out");
    const path = `${uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
    if (error) throw error;
    return path;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!master) {
      toast.error("Attach an uncompressed master file.");
      return;
    }
    const check = validateMasterFile(kind, master, maxMasterBytes);
    if (!check.ok) {
      toast.error(check.error);
      return;
    }
    if (preview) {
      const pv = validatePreviewFile(kind, preview);
      if (!pv.ok) {
        toast.error(pv.error);
        return;
      }
    }

    setBusy(true);
    try {
      const masterPath = await upload("creator-masters", master);
      const previewPath = preview ? await upload("creator-previews", preview) : null;
      const res = await save({
        data: {
          kind,
          title,
          license_terms: license,
          master_path: masterPath,
          master_format: check.ext ?? null,
          master_bytes: master.size,
          preview_path: previewPath,
          published: false,
          description: "",
        },
      });
      if (!res.ok) toast.error(res.error ?? "Could not save that work.");
      else {
        toast.success("Master uploaded. It stays private until you publish it.");
        setTitle("");
        setLicense("");
        setMaster(null);
        setPreview(null);
        onDone();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  const active = CREATOR_KINDS.find((k) => k.value === kind);

  return (
    <section className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">Your works</h2>

      <form onSubmit={onSubmit} className="surface-panel space-y-5 p-6">
        <div className="flex flex-wrap gap-2">
          {CREATOR_KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => setKind(k.value)}
              className={`label-mono min-h-11 border px-4 transition-colors ${
                kind === k.value ? "border-energy text-energy" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{active?.blurb}</p>

        <div className="space-y-2">
          <Label htmlFor="w-title">Title</Label>
          <Input id="w-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="w-license">License terms you set</Label>
          <Textarea id="w-license" rows={3} value={license} onChange={(e) => setLicense(e.target.value)} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="w-master">Uncompressed master (private)</Label>
            <Input id="w-master" type="file" onChange={(e) => setMaster(e.target.files?.[0] ?? null)} />
            {master && <p className="text-xs text-muted-foreground">{formatBytes(master.size)}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="w-preview">Compressed preview (optional, public)</Label>
            <Input id="w-preview" type="file" onChange={(e) => setPreview(e.target.files?.[0] ?? null)} />
          </div>
        </div>

        <button type="submit" disabled={busy} className={btn}>
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Upload className="size-4" aria-hidden="true" />}
          Upload work
        </button>
      </form>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="surface-panel flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="label-mono text-xs text-muted-foreground">
                {item.kind} · {item.master_format ?? "—"} ·{" "}
                {item.master_bytes ? formatBytes(Number(item.master_bytes)) : "—"} ·{" "}
                {item.published ? "published" : "draft"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className={ghostBtn}
                onClick={async () => {
                  const res = await save({
                    data: {
                      id: item.id,
                      kind: item.kind,
                      title: item.title,
                      published: !item.published,
                      description: "",
                      license_terms: "",
                    },
                  });
                  if (res.ok) onDone();
                  else toast.error(res.error ?? "Could not update.");
                }}
              >
                {item.published ? "Unpublish" : "Publish"}
              </button>
              <button
                type="button"
                aria-label={`Delete ${item.title}`}
                className={ghostBtn}
                onClick={async () => {
                  const res = await remove({ data: { id: item.id } });
                  if (res.ok) onDone();
                  else toast.error(res.error ?? "Could not delete.");
                }}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-muted-foreground">No works uploaded yet.</li>}
      </ul>
    </section>
  );
}

function OwnershipPanel({ handle, onDone }: { handle: string; onDone: () => void }) {
  const exportFn = useServerFn(exportCreatorArchive);
  const takedown = useServerFn(takedownCreatorPage);
  const [busy, setBusy] = useState(false);

  return (
    <section className="surface-panel space-y-4 p-6">
      <h2 className="font-display text-2xl font-semibold">Ownership</h2>
      <p className="text-sm text-muted-foreground">
        You own every file you upload. Earth Protection Society holds a revocable, non-exclusive distribution
        license only. Export or remove your work at any time, without asking anyone.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          className={ghostBtn}
          onClick={async () => {
            setBusy(true);
            try {
              const res = await exportFn({ data: undefined });
              if (!res.ok || !res.manifest) {
                toast.error(res.error ?? "Export failed.");
                return;
              }
              const blob = new Blob([JSON.stringify(res.manifest, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${handle}-manifest.json`;
              a.click();
              URL.revokeObjectURL(url);
            } finally {
              setBusy(false);
            }
          }}
        >
          Export my work
        </button>
        <button
          type="button"
          disabled={busy}
          className={ghostBtn}
          onClick={async () => {
            if (!window.confirm("Remove your page and delete every uploaded file? This cannot be undone.")) return;
            setBusy(true);
            try {
              const res = await takedown({ data: undefined });
              if (res.ok) {
                toast.success("Your page and files were removed.");
                onDone();
              } else toast.error(res.error ?? "Could not remove.");
            } finally {
              setBusy(false);
            }
          }}
        >
          Take everything down
        </button>
      </div>
    </section>
  );
}

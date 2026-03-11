"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

interface DiscountCode {
  id: string;
  code: string;
  description: string;
  value: number;
  minGroupSize: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  _count: { orders: number };
}

interface Props {
  initialCodes: DiscountCode[];
}

const empty = {
  code: "",
  description: "",
  value: "10",
  minGroupSize: "1",
  maxUses: "",
  expiresAt: "",
  isActive: true,
};

export default function DiscountCodesManager({ initialCodes }: Props) {
  const [codes, setCodes] = useState<DiscountCode[]>(initialCodes);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingCode, setViewingCode] = useState<DiscountCode | null>(null);

  function setField(key: keyof typeof form, val: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleCreate() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.toUpperCase().slice(0, 4),
          description: form.description,
          value: parseInt(form.value, 10),
          minGroupSize: parseInt(form.minGroupSize, 10) || 1,
          ...(form.maxUses ? { maxUses: parseInt(form.maxUses, 10) } : {}),
          ...(form.expiresAt ? { expiresAt: form.expiresAt } : {}),
          isActive: form.isActive,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        const msg = typeof json.error === "string" ? json.error : JSON.stringify(json.error);
        toast.error(msg || "Failed to create code");
        return;
      }

      setCodes((prev) => [json, ...prev]);
      setForm({ ...empty });
      setCreating(false);
      toast.success(`Code ${json.code} created!`);
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string, current: boolean) {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/discounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (!res.ok) { toast.error("Update failed"); return; }
      const updated = await res.json();
      setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: updated.isActive } : c)));
    } catch {
      toast.error("Network error");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Delete code ${code}?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/discounts/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Delete failed"); return; }
      setCodes((prev) => prev.filter((c) => c.id !== id));
      toast.success(`${code} deleted`);
    } catch {
      toast.error("Network error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
    <div className="bg-white/[0.03] rounded-2xl border border-white/6 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white text-lg">Discount Codes</h2>
          <p className="text-white/40 text-xs mt-0.5">4-character codes — percentage off total.</p>
        </div>
        <Button size="sm" onClick={() => setCreating((v) => !v)}>
          {creating ? "Cancel" : "+ New Code"}
        </Button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-amber-400">New Discount Code</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Code */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-white/50 mb-1">Code (4 chars)</label>
              <Input
                value={form.code}
                maxLength={4}
                onChange={(e) => setField("code", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                placeholder="ABCD"
                className="uppercase tracking-widest font-mono"
              />
            </div>

            {/* Discount % */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Discount %</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={form.value}
                onChange={(e) => setField("value", e.target.value)}
                placeholder="10"
              />
            </div>

            {/* Min group size */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Min qty</label>
              <Input
                type="number"
                min="1"
                value={form.minGroupSize}
                onChange={(e) => setField("minGroupSize", e.target.value)}
                placeholder="1"
              />
            </div>

            {/* Max uses */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Max uses</label>
              <Input
                type="number"
                min="1"
                value={form.maxUses}
                onChange={(e) => setField("maxUses", e.target.value)}
                placeholder="Unlimited"
              />
            </div>

            {/* Description */}
            <div className="col-span-2 sm:col-span-3">
              <label className="block text-xs font-medium text-white/50 mb-1">Description</label>
              <Input
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="e.g. Early-bird group discount"
              />
            </div>

            {/* Expires at */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Expires (optional)</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setField("expiresAt", e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button size="sm" loading={saving} onClick={handleCreate} disabled={!form.code || form.code.length < 3}>
              Create Code
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {codes.length === 0 ? (
        <p className="text-sm text-white/30 text-center py-6">No discount codes yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/30 text-xs border-b border-white/6">
                <th className="text-left pb-2 font-medium">Code</th>
                <th className="text-left pb-2 font-medium">Description</th>
                <th className="text-center pb-2 font-medium">%</th>
                <th className="text-center pb-2 font-medium">Min qty</th>
                <th className="text-center pb-2 font-medium">Uses</th>
                <th className="text-center pb-2 font-medium">Status</th>
                <th className="text-right pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {codes.map((dc) => (
                <tr key={dc.id} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 pr-3">
                    <code className="text-amber-400 font-mono tracking-widest font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                      {dc.code}
                    </code>
                  </td>
                  <td className="py-2.5 pr-3 text-white/60 truncate max-w-[160px]">{dc.description}</td>
                  <td className="py-2.5 text-center text-white font-semibold">{dc.value}%</td>
                  <td className="py-2.5 text-center text-white/50">{dc.minGroupSize}</td>
                  <td className="py-2.5 text-center text-white/50">
                    {dc.usedCount}{dc.maxUses ? `/${dc.maxUses}` : ""}
                  </td>
                  <td className="py-2.5 text-center">
                    <Badge variant={dc.isActive ? "success" : "neutral"}>
                      {dc.isActive ? "Active" : "Off"}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingCode(dc)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleToggle(dc.id, dc.isActive)}
                        disabled={togglingId === dc.id}
                        className="text-xs px-2.5 py-1 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors disabled:opacity-40"
                      >
                        {dc.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleDelete(dc.id, dc.code)}
                        disabled={deletingId === dc.id}
                        className="text-xs px-2.5 py-1 rounded-lg border border-red-500/20 text-red-400/70 hover:text-red-400 hover:border-red-400/40 transition-colors disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* View Details Modal */}
      {viewingCode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setViewingCode(null)}
        >
          <div
            className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Discount Code</p>
                <code className="text-3xl font-black font-mono tracking-[0.2em] text-amber-400 bg-amber-500/10 px-4 py-2 rounded-xl block">
                  {viewingCode.code}
                </code>
              </div>
              <button
                onClick={() => setViewingCode(null)}
                className="text-white/30 hover:text-white transition-colors text-xl leading-none mt-1"
              >
                ✕
              </button>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2">
              <Badge variant={viewingCode.isActive ? "success" : "neutral"}>
                {viewingCode.isActive ? "Active" : "Disabled"}
              </Badge>
              {viewingCode.expiresAt && new Date(viewingCode.expiresAt) < new Date() && (
                <Badge variant="error">Expired</Badge>
              )}
            </div>

            {/* Details grid */}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-white/40 text-xs mb-0.5">Discount</dt>
                <dd className="text-white font-semibold text-lg">{viewingCode.value}% off</dd>
              </div>
              <div>
                <dt className="text-white/40 text-xs mb-0.5">Min quantity</dt>
                <dd className="text-white font-semibold text-lg">{viewingCode.minGroupSize}</dd>
              </div>
              <div>
                <dt className="text-white/40 text-xs mb-0.5">Times used</dt>
                <dd className="text-white font-semibold text-lg">
                  {viewingCode.usedCount}
                  {viewingCode.maxUses ? (
                    <span className="text-white/40 font-normal text-sm"> / {viewingCode.maxUses} max</span>
                  ) : (
                    <span className="text-white/40 font-normal text-sm"> / unlimited</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-white/40 text-xs mb-0.5">Orders applied to</dt>
                <dd className="text-white font-semibold text-lg">{viewingCode._count.orders}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-white/40 text-xs mb-0.5">Description</dt>
                <dd className="text-white/80">{viewingCode.description || <span className="text-white/30 italic">No description</span>}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-white/40 text-xs mb-0.5">Expires</dt>
                <dd className="text-white/80">
                  {viewingCode.expiresAt
                    ? new Date(viewingCode.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                    : <span className="text-white/30 italic">Never</span>}
                </dd>
              </div>
            </dl>

            <button
              onClick={() => setViewingCode(null)}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

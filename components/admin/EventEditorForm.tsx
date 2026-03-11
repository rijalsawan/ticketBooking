"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string; // ISO
  doorsOpen: string | null;
  endTime: string | null;
  venue: string;
  address: string;
  price: number;
  totalTickets: number;
  isActive: boolean;
  showAvailability: boolean;
  highlights: string[];
}

interface Props {
  event: EventData;
}

export default function EventEditorForm({ event: initialEvent }: Props) {
  const [loading, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: initialEvent.title,
    description: initialEvent.description ?? "",
    // date-only (YYYY-MM-DD), treat as UTC midnight
    date: initialEvent.date ? initialEvent.date.slice(0, 10) : "",
    // time-only (HH:mm), from the UTC portion of the stored datetime
    doorsOpen: initialEvent.doorsOpen
      ? new Date(initialEvent.doorsOpen).toISOString().slice(11, 16)
      : "",
    endTime: initialEvent.endTime
      ? new Date(initialEvent.endTime).toISOString().slice(11, 16)
      : "",
    venue: initialEvent.venue,
    address: initialEvent.address,
    price: (initialEvent.price / 100).toFixed(2),
    totalTickets: String(initialEvent.totalTickets),
    isActive: initialEvent.isActive,
    showAvailability: initialEvent.showAvailability,
    highlights: initialEvent.highlights.length ? initialEvent.highlights : [""],
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addHighlight() {
    setForm((prev) => ({ ...prev, highlights: [...prev.highlights, ""] }));
  }

  function updateHighlight(i: number, val: string) {
    setForm((prev) => {
      const h = [...prev.highlights];
      h[i] = val;
      return { ...prev, highlights: h };
    });
  }

  function removeHighlight(i: number) {
    setForm((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, idx) => idx !== i),
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/event", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          // Treat date as UTC midnight — no local timezone offset applied
          date: form.date ? `${form.date}T00:00:00.000Z` : undefined,
          // Combine event date + chosen time, store as UTC
          doorsOpen: form.doorsOpen ? `${form.date}T${form.doorsOpen}:00.000Z` : undefined,
          endTime: form.endTime ? `${form.date}T${form.endTime}:00.000Z` : undefined,
          venue: form.venue,
          address: form.address,
          price: Math.round(parseFloat(form.price) * 100),
          totalTickets: parseInt(form.totalTickets, 10),
          isActive: form.isActive,
          showAvailability: form.showAvailability,
          highlights: form.highlights.filter((h) => h.trim()),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        const msg = typeof err.error === "string" ? err.error : JSON.stringify(err.error);
        toast.error(msg || "Failed to save");
        return;
      }

      toast.success("Event updated!");
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-card rounded-md border border-border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground text-lg">Event Details</h2>
          <p className="text-muted-foreground text-xs mt-0.5">Edit all event information shown to attendees.</p>
        </div>
        <Button onClick={handleSave} loading={loading} size="sm">
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Title */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
          <Input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Event title"
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="Short event description"
            className="w-full rounded-md bg-transparent border border-border px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Event Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className="w-full rounded-md bg-transparent border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring [color-scheme:dark]"
          />
        </div>

        {/* Doors Open */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Doors Open <span className="text-muted-foreground/50 font-normal text-xs">(shown as-entered)</span></label>
          <input
            type="time"
            value={form.doorsOpen}
            onChange={(e) => set("doorsOpen", e.target.value)}
            className="w-full rounded-md bg-transparent border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring [color-scheme:dark]"
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">End Time <span className="text-muted-foreground/50 font-normal text-xs">(shown as-entered)</span></label>
          <input
            type="time"
            value={form.endTime}
            onChange={(e) => set("endTime", e.target.value)}
            className="w-full rounded-md bg-transparent border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring [color-scheme:dark]"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Ticket Price (CAD)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              className="pl-7"
              placeholder="15.00"
            />
          </div>
        </div>

        {/* Venue */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Venue Name</label>
          <Input
            value={form.venue}
            onChange={(e) => set("venue", e.target.value)}
            placeholder="Venue name"
          />
        </div>

        {/* Address */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-1">Address</label>
          <Input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Full address"
          />
        </div>

        {/* Total Tickets */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Total Capacity</label>
          <Input
            type="number"
            min="0"
            value={form.totalTickets}
            onChange={(e) => set("totalTickets", e.target.value)}
          />
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between rounded-md bg-secondary border border-border px-4 py-3">
          <span className="text-sm text-muted-foreground">Event Active</span>
          <button
            type="button"
            role="switch"
            aria-checked={form.isActive}
            onClick={() => set("isActive", !form.isActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.isActive ? "bg-accent" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                form.isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Show Availability toggle */}
        <div className="flex items-center justify-between rounded-md bg-secondary border border-border px-4 py-3">
          <div>
            <span className="text-sm text-muted-foreground">Show Availability</span>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Display remaining tickets on checkout &amp; landing page</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.showAvailability}
            onClick={() => set("showAvailability", !form.showAvailability)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              form.showAvailability ? "bg-accent" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                form.showAvailability ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Highlights */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-muted-foreground">What&apos;s Included / Highlights</label>
          <button
            type="button"
            onClick={addHighlight}
            className="text-xs text-accent hover:text-accent/80 font-medium flex items-center gap-1"
          >
            <span className="text-base leading-none">+</span> Add item
          </button>
        </div>
        <div className="space-y-2">
          {form.highlights.map((h, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                value={h}
                onChange={(e) => updateHighlight(i, e.target.value)}
                placeholder="e.g. 🎵 Live music"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeHighlight(i)}
                className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          ))}
          {form.highlights.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No highlights yet. Click &quot;Add item&quot; to start.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-border">
        <Button onClick={handleSave} loading={loading}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useIntel } from "@/lib/intel-store";
import { estimateNeeds, type SosStatus } from "@/lib/intel";
import { PriorityTag } from "@/components/common/PriorityTag";

export const Route = createFileRoute("/sos")({
  head: () => ({
    meta: [
      { title: "SOS requests — triage and verification" },
      {
        name: "description",
        content:
          "Submit, triage and verify SOS requests with automatic priority scoring and estimated needs.",
      },
      { property: "og:title", content: "SOS — Disaster Intelligence" },
      {
        property: "og:description",
        content: "Priority-scored SOS queue for humanitarian responders.",
      },
    ],
  }),
  component: SosPage,
});

const STATUSES: SosStatus[] = ["NEW", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];

function SosPage() {
  const { sosList, addSos, setSosStatus, scenario } = useIntel();
  const [form, setForm] = useState({
    latitude: String(scenario.center.lat),
    longitude: String(scenario.center.lng),
    people: "4",
    message: "",
    foodNeeded: true,
    waterNeeded: true,
    medicalNeeded: false,
    trapped: false,
    contactAvailable: true,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    const people = Number(form.people);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      toast.error("Latitude must be between -90 and 90");
      return;
    }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      toast.error("Longitude must be between -180 and 180");
      return;
    }
    if (!Number.isFinite(people) || people < 1) {
      toast.error("Number of people must be at least 1");
      return;
    }
    if (form.message.trim().length < 5) {
      toast.error("Please describe the situation (at least 5 characters)");
      return;
    }

    const created = addSos({
      latitude: lat,
      longitude: lng,
      people,
      message: form.message.trim(),
      foodNeeded: form.foodNeeded,
      waterNeeded: form.waterNeeded,
      medicalNeeded: form.medicalNeeded,
      trapped: form.trapped,
      contactAvailable: form.contactAvailable,
    });
    toast.success(`${created.id} logged · priority ${created.priority}`, {
      description: "Logged for responder triage. Emergency services are not auto-dispatched.",
    });
    setForm((f) => ({ ...f, message: "" }));
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
      <section className="panel h-fit p-4">
        <h2 className="text-[13px] font-semibold">Submit SOS</h2>
        <form className="mt-3 space-y-2.5 text-xs" onSubmit={submit}>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Latitude">
              <input
                className={inputCls}
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              />
            </Field>
            <Field label="Longitude">
              <input
                className={inputCls}
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              />
            </Field>
          </div>
          <Field label="People affected">
            <input
              type="number"
              min={1}
              className={inputCls}
              value={form.people}
              onChange={(e) => setForm({ ...form, people: e.target.value })}
            />
          </Field>
          <Field label="Situation">
            <textarea
              rows={3}
              className={inputCls}
              value={form.message}
              placeholder="What is happening and what is needed?"
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                ["foodNeeded", "Food needed"],
                ["waterNeeded", "Water needed"],
                ["medicalNeeded", "Medical needed"],
                ["trapped", "People trapped"],
                ["contactAvailable", "Contact available"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-1.5 text-muted-foreground">
                <input
                  type="checkbox"
                  className="size-3.5 accent-[var(--brand)]"
                  checked={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                />
                {label}
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-brand px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-brand-strong"
          >
            Log SOS request
          </button>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            This logs a request for responder triage only. It does not dispatch emergency services.
          </p>
        </form>
      </section>

      <section className="panel overflow-hidden">
        <h2 className="border-b border-border px-4 py-2.5 text-[13px] font-semibold">
          SOS queue ({sosList.length})
        </h2>
        <ul className="divide-y divide-border">
          {sosList.map((s) => {
            const est = estimateNeeds(s.people, 2, s.medicalNeeded ? 1 : 0);
            return (
              <li key={s.id} className="flex flex-wrap gap-3 px-4 py-3 text-xs">
                <div className="min-w-[190px] flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{s.id}</span>
                    <PriorityTag priority={s.priority} />
                    {s.trapped && (
                      <span className="rounded bg-emergency/10 px-1.5 py-0.5 text-[10px] font-medium text-emergency">
                        TRAPPED
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-muted-foreground">{s.message}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {s.people} people · {s.latitude.toFixed(3)}, {s.longitude.toFixed(3)} ·{" "}
                    {new Date(s.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  <p>Est. {est.meals.toLocaleString()} meals</p>
                  <p>Est. {est.waterLiters.toLocaleString()} L water</p>
                  <p>Est. {est.medicalKits} medical kits</p>
                </div>
                <label className="ml-auto flex items-center gap-1.5">
                  <span className="sr-only">Status for {s.id}</span>
                  <select
                    value={s.status}
                    onChange={(e) => setSosStatus(s.id, e.target.value as SosStatus)}
                    className="rounded-md border border-border bg-card px-2 py-1 text-xs"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-card px-2 py-1.5 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

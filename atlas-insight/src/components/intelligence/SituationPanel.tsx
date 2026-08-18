import { AlertTriangle, CheckCircle2, Satellite } from "lucide-react";
import { useIntel } from "@/lib/intel-store";
import type { EvidenceSource } from "@/lib/intel";

const SOURCE_LABELS: Array<{ key: EvidenceSource; label: string }> = [
  { key: "social", label: "Social" },
  { key: "satellite", label: "Satellite" },
  { key: "weather", label: "Weather" },
  { key: "firms", label: "FIRMS" },
  { key: "usgs", label: "USGS" },
];

export function SituationPanel() {
  const { mode, fusion, gap, evidence, observationRequested, requestObservation } = useIntel();
  const present = new Set(evidence.map((e) => e.source));

  return (
    <section className="panel tilt-3d animate-fade-up p-4">
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-[13px] font-semibold">AI situation intelligence</h2>
        <span className="text-[11px] text-muted-foreground">
          Decision support · not a guarantee
        </span>
      </header>

      <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Situation</p>
          <p className="text-lg font-semibold text-brand-strong">
            {fusion.disasterType === "none"
              ? "No hazard classified"
              : `${fusion.disasterType} detected`}
          </p>
        </div>
        <Metric label="Confidence" value={`${Math.round(fusion.confidence * 100)}%`} />
        <Metric label="Uncertainty" value={`${Math.round(fusion.uncertainty * 100)}%`} />
        <Metric label="Evidence items" value={String(evidence.length)} />
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-700"
          style={{ width: `${Math.round(fusion.confidence * 100)}%` }}
        />
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
        {SOURCE_LABELS.map((s) => (
          <li
            key={s.key}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${
              present.has(s.key)
                ? "border-relief/30 bg-relief-soft text-accent-foreground"
                : "border-border bg-secondary text-muted-foreground"
            }`}
          >
            {present.has(s.key) ? (
              <CheckCircle2 className="size-3" aria-hidden />
            ) : (
              <AlertTriangle className="size-3" aria-hidden />
            )}
            {s.label}
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-md border border-amber/40 bg-amber/8 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-strong">
          Information gap · {gap.priority}
        </p>
        <p className="mt-1 text-[13px] font-medium">{gap.gap}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{gap.reason}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <p className="text-xs">
            <span className="text-muted-foreground">Recommended: </span>
            {gap.recommendedObservation}
          </p>
          {gap.missingEvidence.length > 0 && mode === "demo" && (
            <button
              type="button"
              onClick={requestObservation}
              disabled={observationRequested}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-brand-strong disabled:opacity-60"
            >
              <Satellite className="size-3.5" aria-hidden />
              {observationRequested ? "Observation requested" : "Request observation"}
            </button>
          )}
          {gap.missingEvidence.length > 0 && mode === "live" && (
            <span className="text-[11px] text-muted-foreground">
              Live mode: no synthetic follow-up is generated.
            </span>
          )}
        </div>
      </div>

      {fusion.contradicting.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {fusion.contradicting.length} contradicting evidence item(s) detected — ground
          verification advised.
        </p>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

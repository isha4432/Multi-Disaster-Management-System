import { createFileRoute } from "@tanstack/react-router";
import { Download, Printer } from "lucide-react";
import { useIntel } from "@/lib/intel-store";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Situation report — export and audit trail" },
      {
        name: "description",
        content:
          "AI-generated situation report with evidence, confidence, information gap, SOS and relief allocation, exportable as JSON or PDF.",
      },
      { property: "og:title", content: "Reports — Disaster Intelligence" },
      {
        property: "og:description",
        content: "Exportable situation report with a full evidence audit trail.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { mode, scenario, fusion, gap, evidence, sosList, allocations, totalNeeds, timeline } =
    useIntel();

  const report = {
    generatedAt: new Date().toISOString(),
    mode: mode === "live" ? "LIVE DATA" : "DEMO / SIMULATION",
    situation: { area: scenario.area, ...fusion },
    informationGap: gap,
    evidence,
    sos: sosList,
    estimatedRequirements: totalNeeds,
    allocations,
    timeline,
    disclaimer:
      "AI-generated decision support. Confidence, uncertainty and requirement figures are estimates, not guarantees.",
  };

  function downloadJson() {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `situation-report-${scenario.key}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <section className="panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[13px] font-semibold">Situation report</h2>
            <p className="text-[11px] text-muted-foreground">
              AI-generated · {scenario.area} ·{" "}
              {mode === "live" ? "LIVE external feeds" : "DEMO / SIMULATION data"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={downloadJson}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-brand-strong"
            >
              <Download className="size-3.5" aria-hidden /> Export JSON
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-secondary"
            >
              <Printer className="size-3.5" aria-hidden /> Export PDF
            </button>
          </div>
        </div>

        <dl className="mt-4 grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
          <Line label="Assessment" value={fusion.disasterType} />
          <Line label="Confidence" value={`${Math.round(fusion.confidence * 100)}%`} />
          <Line label="Uncertainty" value={`${Math.round(fusion.uncertainty * 100)}%`} />
          <Line label="Evidence items" value={String(evidence.length)} />
          <Line label="Information gap" value={gap.gap} />
          <Line label="Recommended observation" value={gap.recommendedObservation} />
          <Line
            label="Active SOS"
            value={String(sosList.filter((s) => s.status !== "RESOLVED").length)}
          />
          <Line label="Estimated food" value={`${totalNeeds.meals.toLocaleString()} meals`} />
          <Line label="Estimated water" value={`${totalNeeds.waterLiters.toLocaleString()} L`} />
          <Line label="Estimated medical" value={`${totalNeeds.medicalKits} kits`} />
        </dl>
      </section>

      <section className="panel p-4">
        <h2 className="text-[13px] font-semibold">Audit trail</h2>
        <ol className="mt-2 space-y-1.5 text-xs text-muted-foreground">
          {timeline.map((t, i) => (
            <li key={i}>
              <span className="tabular-nums text-foreground">{t.time}</span> — {t.label}
            </li>
          ))}
        </ol>
      </section>

      <section className="panel p-4">
        <h2 className="text-[13px] font-semibold">Machine-readable payload</h2>
        <pre className="mt-2 max-h-72 overflow-auto rounded-md bg-secondary/60 p-3 text-[11px] leading-relaxed">
          {JSON.stringify(report, null, 2)}
        </pre>
      </section>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border pb-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium capitalize">{value}</dd>
    </div>
  );
}

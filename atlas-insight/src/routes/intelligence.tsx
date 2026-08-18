import { createFileRoute } from "@tanstack/react-router";
import { SituationPanel } from "@/components/intelligence/SituationPanel";
import { LiveSignalsPanel } from "@/components/intelligence/LiveSignalsPanel";
import { EventTimeline } from "@/components/intelligence/EventTimeline";
import { useIntel } from "@/lib/intel-store";
import { freshness } from "@/lib/intel";

export const Route = createFileRoute("/intelligence")({
  head: () => ({
    meta: [
      { title: "AI Intelligence — evidence fusion and information gaps" },
      {
        name: "description",
        content:
          "Multimodal evidence fusion, uncertainty, information-gap detection and next-observation recommendations.",
      },
      { property: "og:title", content: "AI Intelligence — Disaster Intelligence" },
      {
        property: "og:description",
        content: "See every evidence item, its weight, and what observation should come next.",
      },
    ],
  }),
  component: AiIntelligence,
});

function AiIntelligence() {
  const { evidence, fusion } = useIntel();

  return (
    <div className="space-y-3">
      <SituationPanel />
      <LiveSignalsPanel />

      <section className="panel overflow-hidden">
        <h2 className="border-b border-border px-4 py-2.5 text-[13px] font-semibold">
          Evidence ledger ({evidence.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-secondary/70 text-left text-muted-foreground">
              <tr>
                <Th>Source</Th>
                <Th>Prediction</Th>
                <Th>Confidence</Th>
                <Th>Reliability</Th>
                <Th>Freshness</Th>
                <Th>Detail</Th>
              </tr>
            </thead>
            <tbody>
              {evidence.map((e) => (
                <tr key={e.id} className="border-t border-border align-top">
                  <Td className="font-medium uppercase">{e.source}</Td>
                  <Td>
                    <span
                      className={
                        e.prediction === fusion.disasterType ? "text-relief" : "text-emergency"
                      }
                    >
                      {e.prediction}
                    </span>
                  </Td>
                  <Td className="tabular-nums">{Math.round(e.confidence * 100)}%</Td>
                  <Td className="tabular-nums">{Math.round(e.reliability * 100)}%</Td>
                  <Td className="tabular-nums">{Math.round(freshness(e.timestamp) * 100)}%</Td>
                  <Td className="max-w-[420px] text-muted-foreground">{e.details}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          Fusion weights each item by confidence × source reliability × freshness, then rewards
          cross-source agreement. AI-assisted classification — every item keeps its source and
          timestamp.
        </p>
      </section>

      <EventTimeline />
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2 font-medium">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2 ${className}`}>{children}</td>;
}

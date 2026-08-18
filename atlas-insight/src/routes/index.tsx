import { createFileRoute } from "@tanstack/react-router";
import { MapWorkspace } from "@/components/map/MapWorkspace";
import { SituationPanel } from "@/components/intelligence/SituationPanel";
import { ResponsePanel } from "@/components/intelligence/ResponsePanel";
import { EventTimeline } from "@/components/intelligence/EventTimeline";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Disaster Intelligence command center" },
      {
        name: "description",
        content:
          "Map-first overview of active disasters, AI confidence, information gaps and estimated humanitarian requirements.",
      },
      { property: "og:title", content: "Disaster Intelligence — Overview" },
      {
        property: "og:description",
        content: "Live map, AI situation assessment and response priority in one workspace.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  return (
    <div className="space-y-3">
      <MapWorkspace className="h-[58vh] min-h-[420px]" />
      <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <SituationPanel />
        <ResponsePanel />
      </div>
      <EventTimeline />
    </div>
  );
}

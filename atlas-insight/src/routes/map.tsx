import { createFileRoute } from "@tanstack/react-router";
import { MapWorkspace } from "@/components/map/MapWorkspace";
import { EventTimeline } from "@/components/intelligence/EventTimeline";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live Map — Disaster Intelligence" },
      {
        name: "description",
        content:
          "Full-height Google Map workspace with SOS, fire, earthquake, social and relief layers.",
      },
      { property: "og:title", content: "Live Map — Disaster Intelligence" },
      {
        property: "og:description",
        content: "Interactive Google Map with live USGS earthquakes and response layers.",
      },
    ],
  }),
  component: LiveMap,
});

function LiveMap() {
  return (
    <div className="grid gap-3 xl:grid-cols-[1fr_280px]">
      <MapWorkspace className="h-[calc(100vh-140px)] min-h-[480px]" />
      <EventTimeline className="h-fit" />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useIntel } from "@/lib/intel-store";
import { PriorityTag } from "@/components/common/PriorityTag";

export const Route = createFileRoute("/relief")({
  head: () => ({
    meta: [
      { title: "Relief allocation — centers, stock and assignments" },
      {
        name: "description",
        content:
          "Relief-center inventory and recommended allocations based on SOS priority, distance and available resources.",
      },
      { property: "og:title", content: "Relief — Disaster Intelligence" },
      {
        property: "og:description",
        content: "Recommended relief-center assignments with estimated resource requirements.",
      },
    ],
  }),
  component: ReliefPage,
});

function ReliefPage() {
  const { scenario, allocations, sosList } = useIntel();

  return (
    <div className="space-y-3">
      <section className="panel overflow-hidden">
        <h2 className="border-b border-border px-4 py-2.5 text-[13px] font-semibold">
          Relief centers
        </h2>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          {scenario.centers.map((c) => (
            <article key={c.id} className="rounded-md border border-border p-3 text-xs tilt-3d">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[13px] font-semibold">{c.name}</h3>
                <span className="rounded bg-relief-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
                  {c.status.replace("_", " ")}
                </span>
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-1 text-muted-foreground">
                <Row label="Food" value={`${c.foodInventory.toLocaleString()} meals`} />
                <Row label="Water" value={`${c.waterInventory.toLocaleString()} L`} />
                <Row label="Medical" value={`${c.medicalInventory} kits`} />
                <Row label="Capacity" value={`${c.capacity} people`} />
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="panel overflow-hidden">
        <h2 className="border-b border-border px-4 py-2.5 text-[13px] font-semibold">
          Recommended allocation
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-secondary/70 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">SOS</th>
                <th className="px-4 py-2 font-medium">Priority</th>
                <th className="px-4 py-2 font-medium">Center</th>
                <th className="px-4 py-2 font-medium">Distance</th>
                <th className="px-4 py-2 font-medium">Estimated resources</th>
                <th className="px-4 py-2 font-medium">Reason</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((a) => {
                const sos = sosList.find((s) => s.id === a.sosId);
                return (
                  <tr key={a.sosId} className="border-t border-border align-top">
                    <td className="px-4 py-2 font-medium">{a.sosId}</td>
                    <td className="px-4 py-2">
                      <PriorityTag priority={sos?.priority ?? "LOW"} />
                    </td>
                    <td className="px-4 py-2">{a.centerName}</td>
                    <td className="px-4 py-2 tabular-nums">{a.distanceKm} km</td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {a.estimate.meals.toLocaleString()} meals ·{" "}
                      {a.estimate.waterLiters.toLocaleString()} L · {a.estimate.medicalKits} kits
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{a.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          Straight-line distance only. Route accessibility during a disaster is not verified — treat
          travel as estimated, never guaranteed.
        </p>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt>{label}</dt>
      <dd className="font-medium text-foreground tabular-nums">{value}</dd>
    </div>
  );
}

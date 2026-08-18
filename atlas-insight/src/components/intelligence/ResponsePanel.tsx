import { Droplets, HeartPulse, UtensilsCrossed, Users } from "lucide-react";
import { useIntel } from "@/lib/intel-store";

export function ResponsePanel() {
  const { sosList, totalNeeds, scenario } = useIntel();
  const active = sosList.filter((s) => s.status !== "RESOLVED");
  const count = (p: string) => active.filter((s) => s.priority === p).length;
  const people = active.reduce((sum, s) => sum + s.people, 0);

  return (
    <section className="panel tilt-3d animate-fade-up p-4">
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-[13px] font-semibold">Response priority</h2>
        <span className="text-[11px] text-muted-foreground">Estimated requirement</span>
      </header>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4">
        <Stat label="Critical SOS" value={count("CRITICAL")} tone="emergency" />
        <Stat label="High SOS" value={count("HIGH")} tone="brand" />
        <Stat label="Medium SOS" value={count("MEDIUM")} tone="muted" />
        <Stat label="Relief centers" value={scenario.centers.length} tone="relief" />
      </div>

      <dl className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
        <Need
          icon={<Users className="size-3.5" aria-hidden />}
          label="People affected (reported)"
          value={people.toLocaleString()}
        />
        <Need
          icon={<UtensilsCrossed className="size-3.5" aria-hidden />}
          label="Food (2-day estimate)"
          value={`${totalNeeds.meals.toLocaleString()} meals`}
        />
        <Need
          icon={<Droplets className="size-3.5" aria-hidden />}
          label="Water (2-day estimate)"
          value={`${totalNeeds.waterLiters.toLocaleString()} L`}
        />
        <Need
          icon={<HeartPulse className="size-3.5" aria-hidden />}
          label="Medical kits (estimate)"
          value={`${totalNeeds.medicalKits} kits`}
        />
      </dl>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Figures are AI-generated planning estimates derived from reported SOS headcounts, not
        confirmed requirements.
      </p>
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emergency" | "brand" | "relief" | "muted";
}) {
  const color =
    tone === "emergency"
      ? "text-emergency"
      : tone === "brand"
        ? "text-brand-strong"
        : tone === "relief"
          ? "text-relief"
          : "text-foreground";
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-xl font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function Need({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}

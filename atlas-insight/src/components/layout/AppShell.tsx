import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BrainCircuit,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Map as MapIcon,
  PackageCheck,
  Radio,
} from "lucide-react";
import type { ReactNode } from "react";
import { useIntel } from "@/lib/intel-store";
import { SCENARIOS, SCENARIO_KEYS } from "@/lib/scenario";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/map", label: "Live Map", icon: MapIcon },
  { to: "/intelligence", label: "AI Intelligence", icon: BrainCircuit },
  { to: "/sos", label: "SOS", icon: LifeBuoy },
  { to: "/relief", label: "Relief", icon: PackageCheck },
  { to: "/reports", label: "Reports", icon: FileText },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { mode, setMode, sosList, scenarioKey, setScenarioKey, scenario } = useIntel();
  const criticalCount = sosList.filter(
    (s) => s.priority === "CRITICAL" && s.status !== "RESOLVED",
  ).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-warm/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="relative grid size-8 place-items-center rounded-md bg-brand/10">
              <Activity className="size-4 text-brand-strong" aria-hidden />
              <span className="pointer-events-none absolute inset-0 rounded-md border border-brand/30 animate-spin-slow" />
            </span>
            <div className="leading-tight">
              <h1 className="text-sm font-semibold">Disaster Intelligence</h1>
              <p className="text-[11px] text-muted-foreground">
                AI-powered multimodal disaster response
              </p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-relief/30 bg-relief-soft px-2.5 py-1 font-medium text-accent-foreground">
              <span className="relative flex size-1.5">
                <span
                  className={`absolute inline-flex size-full rounded-full ${mode === "live" ? "bg-relief animate-pulse-ring" : "bg-amber"}`}
                />
                <span
                  className={`relative inline-flex size-1.5 rounded-full ${mode === "live" ? "bg-relief" : "bg-amber"}`}
                />
              </span>
              {mode === "live" ? "LIVE" : "DEMO"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground">
              <Radio className="size-3" aria-hidden /> USGS · FIRMS · Sentinel
            </span>
            <span
              className="rounded-full border border-emergency/30 bg-emergency/10 px-2.5 py-1 font-medium text-emergency"
              aria-label={`${criticalCount} critical alerts`}
            >
              {criticalCount} critical alerts
            </span>
            <label className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${mode === "live" ? "bg-relief/15 text-relief" : "bg-amber/15 text-brand-strong"}`}
              >
                {mode === "live" ? "LIVE DATA" : "DEMO"}
              </span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as "live" | "demo")}
                className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label="Data mode"
              >
                <option value="live">Live data</option>
                <option value="demo">Demo simulation</option>
              </select>
            </label>
            {mode === "demo" && (
              <label className="flex items-center gap-1.5 text-muted-foreground">
                <span className="text-[10px] font-semibold tracking-wide">SCENARIO</span>
                <select
                  value={scenarioKey}
                  onChange={(e) => setScenarioKey(e.target.value as typeof scenarioKey)}
                  className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label="Simulation scenario"
                >
                  {SCENARIO_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {SCENARIOS[k].label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <span className="grid size-7 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-muted-foreground">
              OP
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        <nav
          aria-label="Primary"
          className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-[168px] shrink-0 border-r border-border bg-warm px-2 py-3 md:block"
        >
          <ul className="space-y-0.5">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] transition-colors ${
                      active
                        ? "bg-brand/10 font-medium text-brand-strong"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 border-t border-border px-2.5 pt-3 text-[11px] leading-relaxed text-muted-foreground">
            Monitoring
            <br />
            <span className="text-foreground">{scenario.area}</span>
          </p>
        </nav>

        <nav
          aria-label="Primary mobile"
          className="fixed bottom-0 left-0 right-0 z-30 flex justify-between border-t border-border bg-warm px-2 py-1.5 md:hidden"
        >
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-md px-1 py-1 text-[10px] ${
                  active ? "text-brand-strong" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        <main className="min-w-0 flex-1 px-4 pb-20 pt-4 sm:px-6 md:pb-6">{children}</main>
      </div>
    </div>
  );
}

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  allocateRelief,
  detectInformationGap,
  estimateNeeds,
  fuseEvidence,
  scorePriority,
  type Evidence,
  type SosRequest,
  type SosStatus,
} from "./intel";
import { SCENARIOS, type Scenario, type TimelineEntry } from "./scenario";

export type DataMode = "live" | "demo";

export type LayerKey =
  "sos" | "disaster" | "fires" | "earthquakes" | "social" | "relief" | "satellite";

export const LAYERS: Array<{ key: LayerKey; label: string; color: string }> = [
  { key: "sos", label: "SOS requests", color: "var(--emergency)" },
  { key: "disaster", label: "Disaster zone", color: "var(--brand-strong)" },
  { key: "fires", label: "Fire detections", color: "var(--brand)" },
  { key: "earthquakes", label: "Earthquakes (USGS live)", color: "var(--amber)" },
  { key: "social", label: "Social reports", color: "var(--info)" },
  { key: "relief", label: "Relief centers", color: "var(--relief)" },
  { key: "satellite", label: "Satellite observations", color: "var(--muted-foreground)" },
];

export type NewSosInput = Omit<SosRequest, "id" | "priority" | "status" | "timestamp">;

interface IntelContextValue {
  mode: DataMode;
  setMode: (mode: DataMode) => void;
  scenarioKey: Scenario["key"];
  scenario: Scenario;
  setScenarioKey: (key: Scenario["key"]) => void;
  evidence: Evidence[];
  fusion: ReturnType<typeof fuseEvidence>;
  gap: ReturnType<typeof detectInformationGap>;
  sosList: SosRequest[];
  addSos: (input: NewSosInput) => SosRequest;
  setSosStatus: (id: string, status: SosStatus) => void;
  allocations: ReturnType<typeof allocateRelief>;
  totalNeeds: ReturnType<typeof estimateNeeds>;
  timeline: TimelineEntry[];
  observationRequested: boolean;
  requestObservation: () => void;
  setLiveEvidence: (items: Evidence[]) => void;
  addLiveEvidence: (item: Evidence) => void;
  layers: Record<LayerKey, boolean>;
  toggleLayer: (key: LayerKey) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

const IntelContext = createContext<IntelContextValue | null>(null);

const ALL_ON: Record<LayerKey, boolean> = {
  sos: true,
  disaster: true,
  fires: true,
  earthquakes: true,
  social: true,
  relief: true,
  satellite: true,
};

function clockLabel(date = new Date()) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function IntelProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<DataMode>(() => {
    if (typeof window === "undefined") return "live";
    const saved = window.localStorage.getItem("atlas-data-mode") as DataMode | null;
    return saved === "demo" ? "demo" : "live";
  });
  const [scenarioKey, setKey] = useState<Scenario["key"]>("flood");
  const scenario = SCENARIOS[scenarioKey];

  const [extraEvidence, setExtraEvidence] = useState<Evidence[]>([]);
  const [liveEvidence, setLiveEvidenceState] = useState<Evidence[]>([]);
  const [extraSos, setExtraSos] = useState<SosRequest[]>([]);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, SosStatus>>({});
  const [extraTimeline, setExtraTimeline] = useState<TimelineEntry[]>([]);
  const [observationRequested, setObservationRequested] = useState(false);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>(ALL_ON);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const setMode = useCallback((next: DataMode) => {
    setModeState(next);
    if (typeof window !== "undefined") window.localStorage.setItem("atlas-data-mode", next);
    setExtraEvidence([]);
    setExtraSos([]);
    setStatusOverrides({});
    setExtraTimeline([]);
    setObservationRequested(false);
    setSelectedId(null);
  }, []);

  const setScenarioKey = useCallback((key: Scenario["key"]) => {
    setKey(key);
    setExtraEvidence([]);
    setExtraSos([]);
    setStatusOverrides({});
    setExtraTimeline([]);
    setObservationRequested(false);
    setSelectedId(null);
  }, []);

  const evidence = useMemo(
    () => (mode === "demo" ? [...scenario.evidence, ...extraEvidence] : liveEvidence),
    [mode, scenario.evidence, extraEvidence, liveEvidence],
  );

  const fusion = useMemo(() => fuseEvidence(evidence), [evidence]);
  const gap = useMemo(() => detectInformationGap(evidence, fusion), [evidence, fusion]);

  const sosList = useMemo(
    () =>
      [...(mode === "demo" ? scenario.sos : []), ...extraSos].map((s) => {
        const override = statusOverrides[s.id];
        return override ? { ...s, status: override } : s;
      }),
    [scenario.sos, extraSos, statusOverrides],
  );

  const allocations = useMemo(
    () => allocateRelief(sosList, mode === "demo" ? scenario.centers : []),
    [sosList, scenario.centers],
  );

  const totalNeeds = useMemo(() => {
    const active = sosList.filter((s) => s.status !== "RESOLVED");
    const people = active.reduce((sum, s) => sum + s.people, 0);
    const medical = active.filter((s) => s.medicalNeeded).length;
    return estimateNeeds(people, 2, medical);
  }, [sosList]);

  const timeline = useMemo(
    () => [...(mode === "demo" ? scenario.timeline : []), ...extraTimeline],
    [scenario.timeline, extraTimeline],
  );

  const addSos = useCallback((input: NewSosInput) => {
    const base = {
      ...input,
      id: `SOS-${Math.floor(Math.random() * 9000 + 1000)}`,
      status: "NEW" as SosStatus,
      timestamp: new Date().toISOString(),
    };
    const created: SosRequest = { ...base, priority: scorePriority(base) };
    setExtraSos((prev) => [created, ...prev]);
    setExtraTimeline((prev) => [
      ...prev,
      {
        time: clockLabel(),
        label: `${created.priority} SOS received (${created.id}, ${created.people} people)`,
        kind: "response",
      },
    ]);
    return created;
  }, []);

  const setSosStatus = useCallback((id: string, status: SosStatus) => {
    setStatusOverrides((prev) => ({ ...prev, [id]: status }));
    setExtraTimeline((prev) => [
      ...prev,
      { time: clockLabel(), label: `${id} marked ${status}`, kind: "response" },
    ]);
  }, []);

  const requestObservation = useCallback(() => {
    if (mode !== "demo" || observationRequested) return;
    setObservationRequested(true);
    const follow: Evidence = { ...scenario.followUp, timestamp: new Date().toISOString() };
    setExtraTimeline((prev) => [
      ...prev,
      {
        time: clockLabel(),
        label: `Information gap: ${scenario.followUp.source} requested`,
        kind: "gap",
      },
    ]);
    window.setTimeout(() => {
      setExtraEvidence((prev) => [...prev, follow]);
      setExtraTimeline((prev) => [
        ...prev,
        { time: clockLabel(), label: "New observation received", kind: "evidence" },
        { time: clockLabel(), label: "AI reassessment completed", kind: "ai" },
      ]);
    }, 1600);
  }, [mode, observationRequested, scenario.followUp]);

  // Appends without clobbering whatever LiveEvidenceBridge already set from
  // USGS/FIRMS/OpenWeather in the same render pass.
  const addLiveEvidence = useCallback((item: Evidence) => {
    setLiveEvidenceState((prev) => [...prev.filter((e) => e.id !== item.id), item]);
  }, []);

  const toggleLayer = useCallback((key: LayerKey) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const value: IntelContextValue = {
    mode,
    setMode,
    scenarioKey,
    scenario,
    setScenarioKey,
    evidence,
    fusion,
    gap,
    sosList,
    addSos,
    setSosStatus,
    allocations,
    totalNeeds,
    timeline,
    observationRequested,
    requestObservation,
    setLiveEvidence: setLiveEvidenceState,
    addLiveEvidence,
    layers,
    toggleLayer,
    selectedId,
    setSelectedId,
  };

  return <IntelContext.Provider value={value}>{children}</IntelContext.Provider>;
}

export function useIntel() {
  const ctx = useContext(IntelContext);
  if (!ctx) throw new Error("useIntel must be used inside <IntelProvider>");
  return ctx;
}

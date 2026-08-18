// Core domain types + intelligence reasoning (pure, testable functions).

export type EvidenceSource = "social" | "satellite" | "weather" | "firms" | "usgs" | "ground";

export type DisasterType = "flood" | "wildfire" | "earthquake" | "cyclone" | "landslide" | "none";

export interface Evidence {
  id: string;
  source: EvidenceSource;
  prediction: DisasterType;
  confidence: number; // 0..1
  timestamp: string; // ISO
  latitude: number;
  longitude: number;
  reliability: number; // 0..1, source trust
  details: string;
}

export interface FusionResult {
  disasterType: DisasterType;
  confidence: number;
  uncertainty: number;
  supporting: Evidence[];
  contradicting: Evidence[];
}

export interface InformationGap {
  gap: string;
  reason: string;
  missingEvidence: EvidenceSource[];
  recommendedObservation: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

const HOUR = 3600_000;

/** Freshness decays over 24h; never below 0.15. */
export function freshness(timestamp: string, now = Date.now()): number {
  const ageHours = Math.max(0, (now - new Date(timestamp).getTime()) / HOUR);
  return Math.max(0.15, 1 - ageHours / 24);
}

/** Weighted, agreement-aware fusion — never a blind average. */
export function fuseEvidence(evidence: Evidence[], now = Date.now()): FusionResult {
  if (evidence.length === 0) {
    return {
      disasterType: "none",
      confidence: 0,
      uncertainty: 1,
      supporting: [],
      contradicting: [],
    };
  }

  const weightOf = (e: Evidence) => e.confidence * e.reliability * freshness(e.timestamp, now);

  const byType = new Map<DisasterType, number>();
  for (const e of evidence) {
    if (e.prediction === "none") continue;
    byType.set(e.prediction, (byType.get(e.prediction) ?? 0) + weightOf(e));
  }

  const ranked = [...byType.entries()].sort((a, b) => b[1] - a[1]);
  const disasterType = ranked[0]?.[0] ?? "none";
  const topWeight = ranked[0]?.[1] ?? 0;
  const totalWeight = ranked.reduce((sum, [, w]) => sum + w, 0) || 1;

  const supporting = evidence.filter((e) => e.prediction === disasterType);
  const contradicting = evidence.filter(
    (e) => e.prediction !== disasterType && e.prediction !== "none",
  );

  const agreement = topWeight / totalWeight; // 0..1
  const distinctSources = new Set(supporting.map((e) => e.source)).size;
  const corroboration = Math.min(1, distinctSources / 4);
  const avgQuality =
    supporting.reduce((s, e) => s + weightOf(e), 0) / Math.max(1, supporting.length);

  const confidence = clamp01(0.5 * avgQuality + 0.3 * agreement + 0.2 * corroboration);

  return {
    disasterType,
    confidence: round2(confidence),
    uncertainty: round2(1 - confidence),
    supporting,
    contradicting,
  };
}

/** Core innovation: what are we missing, and what should we observe next? */
export function detectInformationGap(
  evidence: Evidence[],
  fusion: FusionResult,
  now = Date.now(),
): InformationGap {
  const has = (s: EvidenceSource) => evidence.some((e) => e.source === s);
  const latest = (s: EvidenceSource) =>
    evidence
      .filter((e) => e.source === s)
      .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))[0];

  const sat = latest("satellite");
  const cloudy = sat?.details.toLowerCase().includes("cloud");

  if (!has("satellite")) {
    return {
      gap: "Recent satellite observation unavailable",
      reason: "No Sentinel acquisition is available for the affected area.",
      missingEvidence: ["satellite"],
      recommendedObservation: "Request Sentinel-1 SAR acquisition",
      priority: "HIGH",
    };
  }

  if (cloudy) {
    return {
      gap: "Optical imagery unreliable",
      reason: "High cloud coverage limits Sentinel-2 optical interpretation.",
      missingEvidence: ["satellite"],
      recommendedObservation: "Request Sentinel-1 SAR (cloud-penetrating)",
      priority: "HIGH",
    };
  }

  if (sat && freshness(sat.timestamp, now) < 0.5) {
    return {
      gap: "Satellite observation is stale",
      reason: "The most recent acquisition is more than 12 hours old.",
      missingEvidence: ["satellite"],
      recommendedObservation: "Request a new Sentinel-1 SAR pass",
      priority: "MEDIUM",
    };
  }

  if (fusion.contradicting.length > 0) {
    return {
      gap: "Sources disagree on disaster type",
      reason: "Social and remote-sensing evidence point to different hazards.",
      missingEvidence: ["ground"],
      recommendedObservation: "Ground report / SOS verification",
      priority: "HIGH",
    };
  }

  if (fusion.disasterType === "wildfire" && !has("firms")) {
    return {
      gap: "Active-fire confirmation missing",
      reason: "Fire is suspected but no FIRMS thermal detection is attached.",
      missingEvidence: ["firms"],
      recommendedObservation: "Query NASA FIRMS active-fire observations",
      priority: "HIGH",
    };
  }

  if (!has("weather")) {
    return {
      gap: "Meteorological context missing",
      reason: "No weather observation supports or challenges the assessment.",
      missingEvidence: ["weather"],
      recommendedObservation: "Fetch current weather observation",
      priority: "MEDIUM",
    };
  }

  if (fusion.uncertainty > 0.25) {
    return {
      gap: "Confidence below operational threshold",
      reason: "Corroborating evidence is thin for a response decision.",
      missingEvidence: ["ground"],
      recommendedObservation: "Collect additional ground-level reports",
      priority: "MEDIUM",
    };
  }

  return {
    gap: "No critical information gap",
    reason: "All primary evidence streams are present, fresh and in agreement.",
    missingEvidence: [],
    recommendedObservation: "Continue routine monitoring",
    priority: "LOW",
  };
}

// ---------------- SOS + humanitarian estimation ----------------

export type SosPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type SosStatus = "NEW" | "VERIFIED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED";

export interface SosRequest {
  id: string;
  latitude: number;
  longitude: number;
  people: number;
  foodNeeded: boolean;
  waterNeeded: boolean;
  medicalNeeded: boolean;
  trapped: boolean;
  message: string;
  contactAvailable: boolean;
  timestamp: string;
  status: SosStatus;
  priority: SosPriority;
}

export interface ReliefCenter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  foodInventory: number;
  waterInventory: number;
  medicalInventory: number;
  capacity: number;
  status: "OPEN" | "NEAR_CAPACITY" | "CLOSED";
}

export function scorePriority(sos: Omit<SosRequest, "priority">): SosPriority {
  let score = 0;
  if (sos.trapped) score += 4;
  if (sos.medicalNeeded) score += 3;
  if (sos.people >= 20) score += 2;
  else if (sos.people >= 5) score += 1;
  if (sos.waterNeeded) score += 1;
  if (!sos.contactAvailable) score += 1;
  if (score >= 6) return "CRITICAL";
  if (score >= 4) return "HIGH";
  if (score >= 2) return "MEDIUM";
  return "LOW";
}

export interface NeedEstimate {
  meals: number;
  waterLiters: number;
  medicalKits: number;
}

/** ESTIMATED requirement — Sphere-style planning figures, never a confirmed need. */
export function estimateNeeds(
  people: number,
  durationDays: number,
  medicalCases: number,
): NeedEstimate {
  const p = Math.max(0, Math.floor(people));
  const d = Math.max(1, Math.floor(durationDays));
  return {
    meals: p * 3 * d,
    waterLiters: p * 15 * d,
    medicalKits: Math.ceil(Math.max(medicalCases, p * 0.05)),
  };
}

export function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return round2(2 * R * Math.asin(Math.sqrt(h)));
}

export interface Allocation {
  sosId: string;
  centerId: string;
  centerName: string;
  distanceKm: number;
  estimate: NeedEstimate;
  reason: string;
}

const PRIORITY_RANK: Record<SosPriority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

/** Greedy allocation by priority, then distance, constrained by inventory. */
export function allocateRelief(
  sosList: SosRequest[],
  centers: ReliefCenter[],
  durationDays = 2,
): Allocation[] {
  const pool = centers.map((c) => ({ ...c }));
  const queue = [...sosList]
    .filter((s) => s.status !== "RESOLVED")
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || b.people - a.people);

  const out: Allocation[] = [];
  for (const sos of queue) {
    const estimate = estimateNeeds(sos.people, durationDays, sos.medicalNeeded ? 1 : 0);
    const candidates = pool
      .filter((c) => c.status !== "CLOSED")
      .map((c) => ({ c, km: haversineKm(sos, c) }))
      .sort((a, b) => {
        const aOk = canServe(a.c, estimate, sos) ? 0 : 1;
        const bOk = canServe(b.c, estimate, sos) ? 0 : 1;
        return aOk - bOk || a.km - b.km;
      });

    const best = candidates[0];
    if (!best) continue;

    const served = canServe(best.c, estimate, sos);
    if (served) {
      best.c.foodInventory -= estimate.meals;
      best.c.waterInventory -= estimate.waterLiters;
      best.c.medicalInventory -= estimate.medicalKits;
      best.c.capacity -= sos.people;
    }

    out.push({
      sosId: sos.id,
      centerId: best.c.id,
      centerName: best.c.name,
      distanceKm: best.km,
      estimate,
      reason: served
        ? `Nearest center (${best.km} km) with sufficient stock for ${sos.priority} case`
        : `Nearest reachable center (${best.km} km); stock is short — resupply required`,
    });
  }
  return out;
}

function canServe(c: ReliefCenter, e: NeedEstimate, sos: SosRequest): boolean {
  return (
    c.foodInventory >= e.meals &&
    c.waterInventory >= e.waterLiters &&
    c.medicalInventory >= e.medicalKits &&
    c.capacity >= sos.people
  );
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

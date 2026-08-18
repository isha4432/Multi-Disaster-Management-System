import { queryOptions } from "@tanstack/react-query";

export interface FirePoint {
  id: string;
  latitude: number;
  longitude: number;
  brightnessKelvin: number;
  confidence: "low" | "nominal" | "high";
  acquiredAt: string;
  satellite: string;
}

const BASE = "https://firms.modaps.eosdis.nasa.gov/api/area/csv";

/** Reads the free MAP_KEY from Vite env. Never hard-coded. */
function getMapKey(): string | undefined {
  return import.meta.env["VITE_NASA_FIRMS_MAP_KEY"] as string | undefined;
}

export function isFirmsConfigured(): boolean {
  return Boolean(getMapKey());
}

interface FirmsQueryArgs {
  /** [west, south, east, north] */
  bbox: [number, number, number, number];
  /** VIIRS_SNPP_NRT | VIIRS_NOAA20_NRT | MODIS_NRT, etc. */
  source?: string;
  dayRange?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

function parseCsv(text: string): FirePoint[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const header = lines[0]!.split(",").map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const iLat = idx("latitude");
  const iLon = idx("longitude");
  const iBright = idx("bright_ti4") >= 0 ? idx("bright_ti4") : idx("brightness");
  const iConf = idx("confidence");
  const iDate = idx("acq_date");
  const iTime = idx("acq_time");
  const iSat = idx("satellite");

  const out: FirePoint[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i]!.split(",");
    if (row.length < header.length || iLat < 0 || iLon < 0) continue;
    const lat = Number(row[iLat]);
    const lon = Number(row[iLon]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const rawConf = (iConf >= 0 ? (row[iConf] ?? "") : "").trim().toLowerCase();
    const confidence: FirePoint["confidence"] =
      rawConf === "h" || rawConf === "high" || Number(rawConf) >= 80
        ? "high"
        : rawConf === "l" ||
            rawConf === "low" ||
            (Number.isFinite(Number(rawConf)) && Number(rawConf) < 50)
          ? "low"
          : "nominal";

    const date = iDate >= 0 ? row[iDate] : undefined;
    const time = iTime >= 0 ? (row[iTime] ?? "0000").padStart(4, "0") : "0000";
    const acquiredAt = date
      ? new Date(`${date}T${time.slice(0, 2)}:${time.slice(2, 4)}:00Z`).toISOString()
      : new Date().toISOString();

    out.push({
      id: `firms-${lat.toFixed(4)}-${lon.toFixed(4)}-${date ?? i}-${i}`,
      latitude: lat,
      longitude: lon,
      brightnessKelvin: iBright >= 0 ? Number(row[iBright]) : NaN,
      confidence,
      acquiredAt,
      satellite: iSat >= 0 ? (row[iSat] ?? "unknown") : "unknown",
    });
  }
  return out;
}

/** Live NASA FIRMS active-fire detections for a bounding box. Requires a free MAP_KEY. */
export async function fetchFires({
  bbox,
  source = "VIIRS_SNPP_NRT",
  dayRange = 1,
}: FirmsQueryArgs): Promise<FirePoint[]> {
  const key = getMapKey();
  if (!key) {
    throw new Error(
      "NASA FIRMS MAP_KEY is not configured. Add VITE_NASA_FIRMS_MAP_KEY to .env (see docs/API_SETUP.md).",
    );
  }
  const [west, south, east, north] = bbox;
  const url = `${BASE}/${key}/${source}/${west},${south},${east},${north}/${dayRange}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NASA FIRMS request failed (${res.status})`);
  const text = await res.text();
  // FIRMS returns a short error message (not CSV) on invalid keys/params.
  if (!text.includes(",")) throw new Error(`NASA FIRMS: ${text.trim() || "no data returned"}`);
  return parseCsv(text);
}

export function firesQuery(args: FirmsQueryArgs) {
  return queryOptions({
    queryKey: ["firms", args.bbox, args.source, args.dayRange],
    queryFn: () => fetchFires(args),
    enabled: isFirmsConfigured(),
    staleTime: 10 * 60_000,
    refetchInterval: 15 * 60_000, // respect FIRMS transaction limits
    retry: 1,
  });
}

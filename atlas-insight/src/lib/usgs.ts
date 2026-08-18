import { queryOptions } from "@tanstack/react-query";

export interface Quake {
  id: string;
  magnitude: number;
  place: string;
  depthKm: number;
  timestamp: string;
  latitude: number;
  longitude: number;
}

const FEED = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson";

/** Live, key-less USGS earthquake feed. Never fabricated. */
export async function fetchQuakes(): Promise<Quake[]> {
  const res = await fetch(FEED);
  if (!res.ok) throw new Error(`USGS feed unavailable (${res.status})`);
  const json = (await res.json()) as {
    features: Array<{
      id: string;
      properties: { mag: number | null; place: string | null; time: number };
      geometry: { coordinates: [number, number, number] };
    }>;
  };
  return json.features
    .filter((f) => typeof f.properties.mag === "number")
    .map((f) => ({
      id: f.id,
      magnitude: f.properties.mag as number,
      place: f.properties.place ?? "Unknown location",
      depthKm: Math.round(f.geometry.coordinates[2]),
      timestamp: new Date(f.properties.time).toISOString(),
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
    }));
}

export const quakesQuery = queryOptions({
  queryKey: ["usgs", "significant-week"],
  queryFn: fetchQuakes,
  staleTime: 5 * 60_000,
  refetchInterval: 5 * 60_000,
  retry: 1,
});

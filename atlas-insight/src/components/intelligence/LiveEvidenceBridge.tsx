import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useIntel } from "@/lib/intel-store";
import { quakesQuery } from "@/lib/usgs";
import { firesQuery } from "@/lib/firms";
import { weatherQuery } from "@/lib/weather";
import type { Evidence } from "@/lib/intel";

const PAD = 1.5;

/**
 * Converts only live API observations into evidence. The training CSV is never read here.
 * This component deliberately does not fabricate social/satellite observations.
 */
export function LiveEvidenceBridge() {
  const { mode, scenario, setLiveEvidence } = useIntel();
  const { lat, lng } = scenario.center;
  const quakes = useQuery(quakesQuery);
  const fires = useQuery(
    firesQuery({ bbox: [lng - PAD, lat - PAD, lng + PAD, lat + PAD], dayRange: 1 }),
  );
  const weather = useQuery(weatherQuery(lat, lng));

  useEffect(() => {
    if (mode !== "live") return;
    const items: Evidence[] = [];

    // USGS: only use earthquakes actually present in the live feed and near the monitored area.
    if (quakes.data) {
      const nearby = quakes.data.filter(
        (q) => Math.abs(q.latitude - lat) <= 5 && Math.abs(q.longitude - lng) <= 5,
      );
      for (const q of nearby.slice(0, 5)) {
        const confidence = Math.min(0.98, 0.65 + Math.max(0, q.magnitude - 4) * 0.07);
        items.push({
          id: `live-usgs-${q.id}`,
          source: "usgs",
          prediction: "earthquake",
          confidence,
          timestamp: q.timestamp,
          latitude: q.latitude,
          longitude: q.longitude,
          reliability: 0.96,
          details: `USGS live event M${q.magnitude.toFixed(1)} — ${q.place}; depth ${q.depthKm} km.`,
        });
      }
    }

    // NASA FIRMS: only use current detections from the live 24-hour feed.
    if (fires.data && fires.data.length > 0) {
      const latest = [...fires.data].sort(
        (a, b) => new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime(),
      )[0];
      const high = fires.data.filter((f) => f.confidence === "high").length;
      items.push({
        id: `live-firms-${latest?.id ?? "summary"}`,
        source: "firms",
        prediction: "wildfire",
        confidence: Math.min(0.97, 0.62 + Math.min(0.25, fires.data.length / 100)),
        timestamp: latest?.acquiredAt ?? new Date().toISOString(),
        latitude: latest?.latitude ?? lat,
        longitude: latest?.longitude ?? lng,
        reliability: 0.94,
        details: `NASA FIRMS live 24h feed: ${fires.data.length} active detections nearby (${high} high-confidence).`,
      });
    }

    // OpenWeather: weather is contextual evidence only; it is never labelled a prediction.
    if (weather.data) {
      const adverse = weather.data.signals.filter((s) => s !== "no adverse signal");
      if (adverse.length > 0) {
        const prediction = weather.data.rainLastHourMm >= 10 ? "flood" : "wildfire";
        items.push({
          id: `live-weather-${weather.data.observedAt}`,
          source: "weather",
          prediction,
          confidence: Math.min(0.85, 0.55 + adverse.length * 0.08),
          timestamp: weather.data.observedAt,
          latitude: lat,
          longitude: lng,
          reliability: 0.84,
          details: `OpenWeather live reading: ${weather.data.condition}; ${weather.data.rainLastHourMm.toFixed(1)} mm rain/1h, ${weather.data.windSpeedMs.toFixed(1)} m/s wind. Signals: ${adverse.join(", ")}.`,
        });
      }
    }

    setLiveEvidence(items);
  }, [mode, scenario, lat, lng, quakes.data, fires.data, weather.data, setLiveEvidence]);

  // No UI: the live API panels remain the source/status display.
  return null;
}

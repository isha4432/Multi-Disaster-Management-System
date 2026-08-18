import { queryOptions } from "@tanstack/react-query";

export interface WeatherSnapshot {
  temperatureC: number;
  humidityPct: number;
  windSpeedMs: number;
  pressureHpa: number;
  visibilityM: number;
  rainLastHourMm: number;
  condition: string;
  observedAt: string;
  /** Contextual signals derived from the raw reading — never labeled a prediction. */
  signals: string[];
}

const BASE = "https://api.openweathermap.org/data/2.5/weather";

function getApiKey(): string | undefined {
  return import.meta.env["VITE_OPENWEATHER_API_KEY"] as string | undefined;
}

export function isWeatherConfigured(): boolean {
  return Boolean(getApiKey());
}

interface RawOpenWeatherResponse {
  main: { temp: number; humidity: number; pressure: number };
  wind: { speed: number };
  visibility?: number;
  rain?: { "1h"?: number };
  weather: Array<{ main: string; description: string }>;
  dt: number;
}

function deriveSignals(w: RawOpenWeatherResponse): string[] {
  const signals: string[] = [];
  const rain1h = w.rain?.["1h"] ?? 0;
  if (rain1h >= 10) signals.push("heavy rainfall");
  if (w.wind.speed >= 15) signals.push("strong wind");
  if ((w.visibility ?? 10000) < 2000) signals.push("reduced visibility");
  if (rain1h >= 10 && w.wind.speed >= 10) signals.push("possible flood conditions");
  if (signals.length === 0) signals.push("no adverse signal");
  return signals;
}

/** Live OpenWeather reading for a coordinate. Requires a free OPENWEATHER_API_KEY. */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherSnapshot> {
  const key = getApiKey();
  if (!key) {
    throw new Error(
      "OpenWeather API key is not configured. Add VITE_OPENWEATHER_API_KEY to .env (see docs/API_SETUP.md).",
    );
  }
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    units: "metric",
    appid: key,
  });
  const res = await fetch(`${BASE}?${params.toString()}`);
  if (!res.ok) {
    if (res.status === 401) throw new Error("OpenWeather: invalid API key");
    throw new Error(`OpenWeather request failed (${res.status})`);
  }
  const data = (await res.json()) as RawOpenWeatherResponse;

  return {
    temperatureC: data.main.temp,
    humidityPct: data.main.humidity,
    windSpeedMs: data.wind.speed,
    pressureHpa: data.main.pressure,
    visibilityM: data.visibility ?? 10000,
    rainLastHourMm: data.rain?.["1h"] ?? 0,
    condition: data.weather[0]?.description ?? "unknown",
    observedAt: new Date(data.dt * 1000).toISOString(),
    signals: deriveSignals(data),
  };
}

export function weatherQuery(lat: number, lon: number) {
  return queryOptions({
    queryKey: ["openweather", lat, lon],
    queryFn: () => fetchWeather(lat, lon),
    enabled: isWeatherConfigured(),
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
    retry: 1,
  });
}

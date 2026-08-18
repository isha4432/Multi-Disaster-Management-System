import type { LayerKey } from "@/lib/intel-store";

export interface MapFeature {
  id: string;
  layer: LayerKey;
  latitude: number;
  longitude: number;
  title: string;
  subtitle: string;
  details: string[];
  color: string;
  scale?: number;
  pulse?: boolean;
}

export const FEATURE_COLORS: Record<string, string> = {
  sosCritical: "#DC2626",
  sosHigh: "#F97316",
  sosOther: "#EA580C",
  relief: "#16A34A",
  fire: "#F97316",
  quake: "#F59E0B",
  social: "#2563EB",
  satellite: "#64748B",
  zone: "#EA580C",
};

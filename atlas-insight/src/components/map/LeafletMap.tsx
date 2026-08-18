import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { MapFeature } from "./map-features";

interface LeafletMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  features: MapFeature[];
  zone?: { center: { lat: number; lng: number }; radiusMeters: number } | null;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  /** When set, the map pans/zooms to this point (used by search + location list). */
  focus?: { lat: number; lng: number; zoom?: number; nonce: number } | null;
  cluster?: boolean;
  className?: string;
}

/** Builds a colored circular marker icon, matching the app's palette. */
function circleIcon(color: string, scale: number, selected: boolean): L.DivIcon {
  const size = Math.round(scale * 2 * (selected ? 1.35 : 1));
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:9999px;background:${color};opacity:0.95;border:2px solid #ffffff;box-shadow:0 0 0 1px rgba(0,0,0,0.15);"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/** Loads the map on `leaflet` + OpenStreetMap tiles — free, no API key required. */
export function LeafletMap({
  center,
  zoom = 11,
  features,
  zone = null,
  selectedId = null,
  onSelect,
  focus = null,
  cluster = true,
  className,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const overlaysRef = useRef<Array<L.Circle>>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  // Initialise the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    try {
      const map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom,
        minZoom: 3,
        maxZoom: 19,
        maxBounds: [
          [-85, -179.9999],
          [85, 179.9999],
        ],
        maxBoundsViscosity: 1,
        zoomControl: false,
        attributionControl: true,
      });

      const streets = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        noWrap: true,
        maxZoom: 19,
      });
      const satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles &copy; Esri",
          noWrap: true,
          maxZoom: 19,
        },
      );
      streets.addTo(map);
      L.control
        .layers({ Streets: streets, Satellite: satellite }, undefined, {
          position: "topright",
          collapsed: true,
        })
        .addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;
      setStatus("ready");
    } catch {
      setStatus("error");
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recentre when the monitored area changes.
  useEffect(() => {
    if (status === "ready" && mapRef.current) {
      mapRef.current.setView([center.lat, center.lng], zoom);
    }
  }, [center.lat, center.lng, zoom, status]);

  // Focus requests from search / location list.
  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !focus) return;
    mapRef.current.setView([focus.lat, focus.lng], focus.zoom ?? 13);
  }, [focus?.nonce, status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Draw markers + zone overlay.
  useEffect(() => {
    const map = mapRef.current;
    if (status !== "ready" || !map) return;

    clusterGroupRef.current?.clearLayers();
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current = null;
    }
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    overlaysRef.current.forEach((o) => map.removeLayer(o));
    overlaysRef.current = [];

    if (zone) {
      overlaysRef.current.push(
        L.circle([zone.center.lat, zone.center.lng], {
          radius: zone.radiusMeters,
          color: "#EA580C",
          opacity: 0.55,
          weight: 1.5,
          fillColor: "#F97316",
          fillOpacity: 0.08,
        }).addTo(map),
      );
    }

    const group = cluster ? L.markerClusterGroup() : null;
    if (group) clusterGroupRef.current = group;

    features.forEach((f) => {
      if (f.pulse) {
        const ring = L.circle([f.latitude, f.longitude], {
          radius: 900,
          color: f.color,
          opacity: 0.5,
          weight: 1,
          fillColor: f.color,
          fillOpacity: 0.12,
        }).addTo(map);
        overlaysRef.current.push(ring);
      }

      const marker = L.marker([f.latitude, f.longitude], {
        icon: circleIcon(f.color, f.scale ?? 7, selectedId === f.id),
        title: `${f.title} — ${f.subtitle}`,
        zIndexOffset: f.pulse ? 300 : 100,
      });
      marker.on("click", () => onSelect?.(f.id));
      markersRef.current.push(marker);

      if (group) {
        group.addLayer(marker);
      } else {
        marker.addTo(map);
      }
    });

    if (group) group.addTo(map);

    // Gentle pulse animation for critical markers.
    let step = 0;
    const timer = window.setInterval(() => {
      step = (step + 1) % 40;
      const t = step / 40;
      overlaysRef.current.forEach((circle, i) => {
        if (zone && i === 0) return;
        circle.setRadius(700 + t * 1100);
        circle.setStyle({
          fillOpacity: 0.14 * (1 - t),
          opacity: 0.5 * (1 - t),
        });
      });
    }, 60);

    return () => window.clearInterval(timer);
  }, [features, zone, selectedId, status, onSelect, cluster]);

  return (
    <div className={className}>
      <div className="relative h-full w-full overflow-hidden rounded-md">
        <div
          ref={containerRef}
          className="h-full w-full bg-warm"
          aria-label="Disaster intelligence map"
          role="application"
        />
        {status === "loading" && (
          <div className="absolute inset-0 grid place-items-center bg-warm/80 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-brand" />
              Loading map…
            </div>
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 grid place-items-center bg-warm px-6 text-center text-sm text-muted-foreground">
            <div className="space-y-2">
              <p>The map could not be initialised.</p>
              <p className="text-xs">Try reloading the page.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

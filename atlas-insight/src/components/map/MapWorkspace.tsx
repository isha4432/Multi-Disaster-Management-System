import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LeafletMap } from "./LeafletMap";
import { FEATURE_COLORS, type MapFeature } from "./map-features";
import { LAYERS, useIntel } from "@/lib/intel-store";
import { quakesQuery } from "@/lib/usgs";
import { firesQuery, isFirmsConfigured } from "@/lib/firms";

const FIRMS_BBOX_PAD = 1.5;

export function MapWorkspace({ className = "" }: { className?: string }) {
  const { scenario, evidence, sosList, layers, toggleLayer, selectedId, setSelectedId } =
    useIntel();
  const quakes = useQuery(quakesQuery);
  const fires = useQuery(
    firesQuery({
      bbox: [
        scenario.center.lng - FIRMS_BBOX_PAD,
        scenario.center.lat - FIRMS_BBOX_PAD,
        scenario.center.lng + FIRMS_BBOX_PAD,
        scenario.center.lat + FIRMS_BBOX_PAD,
      ],
    }),
  );
  const [query, setQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [clustered, setClustered] = useState(true);
  const [focus, setFocus] = useState<{
    lat: number;
    lng: number;
    zoom?: number;
    nonce: number;
  } | null>(null);

  const features = useMemo<MapFeature[]>(() => {
    const out: MapFeature[] = [];

    if (layers.sos) {
      for (const s of sosList) {
        if (s.status === "RESOLVED") continue;
        out.push({
          id: s.id,
          layer: "sos",
          latitude: s.latitude,
          longitude: s.longitude,
          title: `${s.id} · ${s.priority}`,
          subtitle: `${s.people} people · ${s.status}`,
          details: [
            s.message,
            `Needs: ${
              [s.foodNeeded && "food", s.waterNeeded && "water", s.medicalNeeded && "medical"]
                .filter(Boolean)
                .join(", ") || "unspecified"
            }`,
            s.trapped ? "Reported trapped" : "Not reported trapped",
          ],
          color:
            s.priority === "CRITICAL"
              ? FEATURE_COLORS["sosCritical"]!
              : s.priority === "HIGH"
                ? FEATURE_COLORS["sosHigh"]!
                : FEATURE_COLORS["sosOther"]!,
          scale: 8,
          pulse: s.priority === "CRITICAL",
        });
      }
    }

    if (layers.relief) {
      for (const c of scenario.centers) {
        out.push({
          id: c.id,
          layer: "relief",
          latitude: c.latitude,
          longitude: c.longitude,
          title: c.name,
          subtitle: `Relief center · ${c.status.replace("_", " ")}`,
          details: [
            `Food: ${c.foodInventory.toLocaleString()} meals`,
            `Water: ${c.waterInventory.toLocaleString()} L`,
            `Medical: ${c.medicalInventory} kits`,
            `Capacity: ${c.capacity} people`,
          ],
          color: FEATURE_COLORS["relief"]!,
          scale: 8,
        });
      }
    }

    for (const e of evidence) {
      const layer =
        e.source === "social"
          ? "social"
          : e.source === "satellite"
            ? "satellite"
            : e.source === "firms"
              ? "fires"
              : e.source === "usgs"
                ? "earthquakes"
                : null;
      if (!layer || !layers[layer]) continue;
      out.push({
        id: e.id,
        layer,
        latitude: e.latitude,
        longitude: e.longitude,
        title: `${e.source.toUpperCase()} evidence`,
        subtitle: `${e.prediction} · ${Math.round(e.confidence * 100)}% confidence`,
        details: [e.details, new Date(e.timestamp).toLocaleString()],
        color:
          layer === "social"
            ? FEATURE_COLORS["social"]!
            : layer === "fires"
              ? FEATURE_COLORS["fire"]!
              : layer === "earthquakes"
                ? FEATURE_COLORS["quake"]!
                : FEATURE_COLORS["satellite"]!,
        scale: 6,
      });
    }

    if (layers.earthquakes && quakes.data) {
      for (const q of quakes.data.slice(0, 60)) {
        out.push({
          id: q.id,
          layer: "earthquakes",
          latitude: q.latitude,
          longitude: q.longitude,
          title: `M ${q.magnitude.toFixed(1)} earthquake`,
          subtitle: `${q.place} · USGS live`,
          details: [`Depth ${q.depthKm} km`, new Date(q.timestamp).toLocaleString()],
          color: FEATURE_COLORS["quake"]!,
          scale: Math.max(4, Math.min(14, q.magnitude * 1.8)),
        });
      }
    }

    if (layers.fires && isFirmsConfigured() && fires.data) {
      for (const f of fires.data) {
        out.push({
          id: f.id,
          layer: "fires",
          latitude: f.latitude,
          longitude: f.longitude,
          title: `Active fire · ${f.confidence} confidence`,
          subtitle: `${f.satellite} · NASA FIRMS live`,
          details: [
            Number.isFinite(f.brightnessKelvin) ? `Brightness ${f.brightnessKelvin} K` : "",
            new Date(f.acquiredAt).toLocaleString(),
          ].filter(Boolean),
          color: FEATURE_COLORS["fire"]!,
          scale: 6,
        });
      }
    }

    return out;
  }, [layers, sosList, scenario.centers, evidence, quakes.data, fires.data]);

  const selected = features.find((f) => f.id === selectedId) ?? null;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? features.filter((f) =>
          `${f.title} ${f.subtitle} ${f.details.join(" ")}`.toLowerCase().includes(q),
        )
      : features;
    return list;
  }, [features, query]);

  function openFeature(f: MapFeature) {
    setSelectedId(f.id);
    setFocus({ lat: f.latitude, lng: f.longitude, zoom: 13, nonce: Date.now() });
  }

  return (
    <section className={`panel relative flex flex-col overflow-hidden ${className}`}>
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <h2 className="mr-1 text-[13px] font-semibold">Live operational map</h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location, SOS or station"
          aria-label="Search locations on the map"
          className="h-7 w-56 rounded-md border border-border bg-card px-2 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="button"
          onClick={() => setListOpen((v) => !v)}
          aria-expanded={listOpen}
          className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px]"
        >
          All locations ({matches.length})
        </button>
        <button
          type="button"
          onClick={() => setClustered((v) => !v)}
          aria-pressed={clustered}
          className={`rounded-full border px-2 py-0.5 text-[11px] ${clustered ? "border-border bg-card" : "border-transparent bg-secondary text-muted-foreground"}`}
        >
          Clustering
        </button>
        {LAYERS.map((l) => (
          <button
            key={l.key}
            type="button"
            onClick={() => toggleLayer(l.key)}
            aria-pressed={layers[l.key]}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
              layers[l.key]
                ? "border-border bg-card text-foreground"
                : "border-transparent bg-secondary text-muted-foreground"
            }`}
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: l.color, opacity: layers[l.key] ? 1 : 0.35 }}
            />
            {l.label}
          </button>
        ))}
        {quakes.isError && (
          <span className="ml-auto text-[11px] text-muted-foreground">
            USGS feed temporarily unavailable
          </span>
        )}
        {isFirmsConfigured() && fires.isError && (
          <span className="text-[11px] text-muted-foreground">
            NASA FIRMS feed temporarily unavailable
          </span>
        )}
      </div>

      <div className="relative min-h-[420px] flex-1">
        <LeafletMap
          className="h-full w-full"
          center={scenario.center}
          zoom={11}
          features={matches}
          focus={focus}
          cluster={clustered}
          zone={layers.disaster ? { center: scenario.center, radiusMeters: 9000 } : null}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        {listOpen && (
          <aside className="absolute left-3 top-3 max-h-[70%] w-64 overflow-y-auto panel p-2 text-xs">
            <p className="mb-1 px-1 text-[11px] font-semibold">
              All monitoring locations ({matches.length})
            </p>
            {matches.length === 0 && (
              <p className="px-1 text-muted-foreground">No locations match this search.</p>
            )}
            <ul>
              {matches.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => openFeature(f)}
                    className={`flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-secondary ${selectedId === f.id ? "bg-secondary" : ""}`}
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: f.color }}
                    />
                    <span className="min-w-0">
                      <span className="block truncate">{f.title}</span>
                      <span className="block truncate text-[10px] text-muted-foreground">
                        {f.subtitle}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {selected && (
          <aside className="absolute right-3 top-3 w-72 animate-fade-up panel tilt-3d p-3 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-semibold">{selected.title}</p>
                <p className="text-muted-foreground">{selected.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Close details"
                className="rounded px-1 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {selected.details.map((d, i) => (
                <li key={i}>{d || "Data unavailable"}</li>
              ))}
            </ul>
            <p className="mt-2 text-[10px] text-muted-foreground">
              {selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}
            </p>
          </aside>
        )}

        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-border bg-card/95 px-2.5 py-2 text-[10px] leading-relaxed text-muted-foreground shadow-sm">
          <p className="mb-1 font-semibold text-foreground">Legend</p>
          <LegendRow color={FEATURE_COLORS["sosCritical"]!} label="SOS critical" />
          <LegendRow color={FEATURE_COLORS["sosHigh"]!} label="SOS high" />
          <LegendRow color={FEATURE_COLORS["relief"]!} label="Relief center" />
          <LegendRow color={FEATURE_COLORS["fire"]!} label="Fire detection" />
          <LegendRow color={FEATURE_COLORS["quake"]!} label="Earthquake" />
          <LegendRow color={FEATURE_COLORS["social"]!} label="Social report" />
          <LegendRow color={FEATURE_COLORS["satellite"]!} label="Satellite observation" />
        </div>
      </div>
    </section>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CloudRain, Flame, KeyRound, MessageSquareText } from "lucide-react";
import { useIntel } from "@/lib/intel-store";
import { weatherQuery, isWeatherConfigured } from "@/lib/weather";
import { firesQuery, isFirmsConfigured } from "@/lib/firms";
import { useClassifyText, type ClassificationResult } from "@/lib/classifier";

const BBOX_PAD = 1.5; // degrees around the scenario center

export function LiveSignalsPanel() {
  const { scenario } = useIntel();
  const { lat, lng } = scenario.center;

  const weather = useQuery(weatherQuery(lat, lng));
  const fires = useQuery(
    firesQuery({ bbox: [lng - BBOX_PAD, lat - BBOX_PAD, lng + BBOX_PAD, lat + BBOX_PAD] }),
  );

  return (
    <section className="panel p-4">
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-[13px] font-semibold">Live external signals</h2>
        <span className="text-[11px] text-muted-foreground">Real APIs · your own keys</span>
      </header>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {/* OpenWeather */}
        <div className="rounded-md border border-border p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <CloudRain className="size-3.5" aria-hidden />
            OpenWeather
          </p>
          {!isWeatherConfigured() ? (
            <NotConfigured envVar="VITE_OPENWEATHER_API_KEY" />
          ) : weather.isLoading ? (
            <p className="mt-2 text-xs text-muted-foreground">Loading live reading…</p>
          ) : weather.isError ? (
            <p className="mt-2 text-xs text-emergency">{(weather.error as Error).message}</p>
          ) : weather.data ? (
            <div className="mt-2 space-y-1 text-xs">
              <p className="text-[13px] font-medium capitalize">{weather.data.condition}</p>
              <p className="tabular-nums text-muted-foreground">
                {weather.data.temperatureC.toFixed(1)}°C · {weather.data.humidityPct}% humidity ·{" "}
                {weather.data.windSpeedMs.toFixed(1)} m/s wind
              </p>
              <p className="flex flex-wrap gap-1">
                {weather.data.signals.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {s}
                  </span>
                ))}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Observed {new Date(weather.data.observedAt).toLocaleTimeString()} — contextual
                signal, not a prediction.
              </p>
            </div>
          ) : null}
        </div>

        {/* NASA FIRMS */}
        <div className="rounded-md border border-border p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Flame className="size-3.5" aria-hidden />
            NASA FIRMS
          </p>
          {!isFirmsConfigured() ? (
            <NotConfigured envVar="VITE_NASA_FIRMS_MAP_KEY" />
          ) : fires.isLoading ? (
            <p className="mt-2 text-xs text-muted-foreground">Loading active-fire feed…</p>
          ) : fires.isError ? (
            <p className="mt-2 text-xs text-emergency">{(fires.error as Error).message}</p>
          ) : fires.data ? (
            <div className="mt-2 space-y-1 text-xs">
              <p className="text-[13px] font-medium tabular-nums">
                {fires.data.length} active detection{fires.data.length === 1 ? "" : "s"} nearby
              </p>
              <p className="text-muted-foreground">
                Within ±{BBOX_PAD}° of scenario center, last 24h.
              </p>
              <p className="text-[10px] text-muted-foreground">
                Cached 15 min to respect NASA FIRMS transaction limits.
              </p>
            </div>
          ) : null}
        </div>

        {/* Disaster-tweet classifier (ai-service/) */}
        <div className="rounded-md border border-border p-3 sm:col-span-2">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <MessageSquareText className="size-3.5" aria-hidden />
            Social report classifier
          </p>
          <SocialClassifierCard />
        </div>
      </div>
    </section>
  );
}

function SocialClassifierCard() {
  const { addLiveEvidence, scenario } = useIntel();
  const [text, setText] = useState("");
  const [lastResult, setLastResult] = useState<ClassificationResult | null>(null);
  const classify = useClassifyText();

  const handleClassify = () => {
    if (!text.trim()) return;
    classify.mutate(text, {
      onSuccess: (result) => setLastResult(result),
    });
  };

  const handleAddAsEvidence = () => {
    if (!lastResult || lastResult.label !== "disaster") return;
    const { lat, lng } = scenario.center;
    addLiveEvidence({
      id: `live-social-${Date.now()}`,
      source: "social",
      // The classifier only outputs disaster/non-disaster, not a disaster type,
      // so this is deliberately generic evidence rather than a specific type guess.
      prediction: "none",
      confidence: lastResult.confidence,
      timestamp: new Date().toISOString(),
      latitude: lat,
      longitude: lng,
      reliability: 0.55, // unverified single social report — intentionally low trust
      details: `Social report classified as disaster-related (confidence ${(lastResult.confidence * 100).toFixed(0)}%): "${text.slice(0, 140)}${text.length > 140 ? "…" : ""}"`,
    });
    setText("");
    setLastResult(null);
  };

  return (
    <div className="mt-2 space-y-2">
      <p className="text-xs text-muted-foreground">
        Paste a social-media style report to classify it as disaster-related or not, using the
        TF-IDF + logistic-regression model trained on the bundled dataset. This is on-demand
        classification, not a live social feed — Atlas Insight never fabricates live social
        observations.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. Bridge collapsed near the river after heavy rain, several people trapped"
        rows={2}
        className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleClassify}
          disabled={!text.trim() || classify.isPending}
          className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground disabled:opacity-50"
        >
          {classify.isPending ? "Classifying…" : "Classify"}
        </button>
        {lastResult?.label === "disaster" && (
          <button
            type="button"
            onClick={handleAddAsEvidence}
            className="rounded-md border border-border px-2.5 py-1 text-[11px] font-medium"
          >
            Add as evidence
          </button>
        )}
      </div>
      {classify.isError && (
        <p className="text-xs text-emergency">{(classify.error as Error).message}</p>
      )}
      {lastResult && (
        <p className="text-xs">
          <span
            className={
              lastResult.label === "disaster"
                ? "font-semibold text-emergency"
                : "font-semibold text-muted-foreground"
            }
          >
            {lastResult.label}
          </span>{" "}
          <span className="tabular-nums text-muted-foreground">
            ({(lastResult.confidence * 100).toFixed(0)}% confidence)
          </span>
        </p>
      )}
      <p className="text-[10px] text-muted-foreground">
        Requires the classifier backend running locally — see{" "}
        <code className="rounded bg-secondary px-1 py-0.5 text-[10px]">ai-service/README.md</code>.
      </p>
    </div>
  );
}

function NotConfigured({ envVar }: { envVar: string }) {
  return (
    <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
      <KeyRound className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>
        Add <code className="rounded bg-secondary px-1 py-0.5 text-[10px]">{envVar}</code> to{" "}
        <code className="rounded bg-secondary px-1 py-0.5 text-[10px]">.env</code> to enable this
        live feed. See{" "}
        <code className="rounded bg-secondary px-1 py-0.5 text-[10px]">docs/API_SETUP.md</code>.
      </span>
    </p>
  );
}

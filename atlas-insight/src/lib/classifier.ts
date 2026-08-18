import { useMutation } from "@tanstack/react-query";

/**
 * Client for the disaster-tweet classifier backend (ai-service/).
 * That service is a separate Python process — this file only talks to it
 * over HTTP. It is NOT started automatically by `npm run dev`.
 *
 *   cd ai-service
 *   pip install -r requirements.txt
 *   python train.py
 *   uvicorn app:app --reload --port 8000
 */

export interface ClassificationResult {
  label: "disaster" | "non-disaster";
  target: 0 | 1;
  confidence: number; // 0..1
}

function getBaseUrl(): string {
  return (
    (import.meta.env["VITE_CLASSIFIER_API_URL"] as string | undefined) ?? "http://localhost:8000"
  );
}

export function isClassifierConfigured(): boolean {
  return Boolean(getBaseUrl());
}

/** Calls POST /predict on the classifier backend for a single piece of text. */
export async function classifyText(text: string): Promise<ClassificationResult> {
  const res = await fetch(`${getBaseUrl()}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    if (res.status === 503) {
      throw new Error("Classifier model not trained yet. Run `python train.py` in ai-service/.");
    }
    throw new Error(`Classifier request failed (${res.status})`);
  }
  return (await res.json()) as ClassificationResult;
}

/** Pings GET /health so the UI can show whether the backend process is even up. */
export async function checkClassifierHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${getBaseUrl()}/health`);
    if (!res.ok) return false;
    const data = (await res.json()) as { status: string; model_loaded: boolean };
    return data.status === "ok" && data.model_loaded;
  } catch {
    return false;
  }
}

/** React Query mutation hook — call `.mutate(text)` from a component. */
export function useClassifyText() {
  return useMutation({
    mutationFn: (text: string) => classifyText(text),
  });
}

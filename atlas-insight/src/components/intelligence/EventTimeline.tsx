import { useIntel } from "@/lib/intel-store";

const KIND_COLOR: Record<string, string> = {
  evidence: "var(--info)",
  ai: "var(--brand)",
  gap: "var(--amber)",
  response: "var(--relief)",
};

export function EventTimeline({ className = "" }: { className?: string }) {
  const { timeline } = useIntel();

  return (
    <section className={`panel p-4 ${className}`}>
      <h2 className="text-[13px] font-semibold">Event timeline</h2>
      <ol className="mt-3 space-y-2.5">
        {timeline.map((t, i) => (
          <li key={`${t.time}-${i}`} className="flex gap-2.5 text-xs animate-fade-up">
            <span className="w-9 shrink-0 tabular-nums text-muted-foreground">{t.time}</span>
            <span
              className="mt-1 size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: KIND_COLOR[t.kind] ?? "var(--muted-foreground)" }}
            />
            <span>{t.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

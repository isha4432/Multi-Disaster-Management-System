export function PriorityTag({ priority }: { priority: string }) {
  const cls =
    priority === "CRITICAL"
      ? "bg-emergency/10 text-emergency"
      : priority === "HIGH"
        ? "bg-brand/15 text-brand-strong"
        : priority === "MEDIUM"
          ? "bg-amber/20 text-brand-strong"
          : "bg-secondary text-muted-foreground";
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${cls}`}>{priority}</span>
  );
}

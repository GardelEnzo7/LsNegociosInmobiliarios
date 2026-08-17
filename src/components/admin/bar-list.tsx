export function BarList({
  items,
  emptyText,
  labelMap,
}: {
  items: [string, number][];
  emptyText: string;
  labelMap?: Record<string, string>;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-grafito/40">{emptyText}</p>;
  }

  const max = Math.max(...items.map(([, count]) => count), 1);

  return (
    <div className="space-y-2.5">
      {items.map(([key, count]) => (
        <div key={key} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs text-grafito/60">{labelMap?.[key] ?? key}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-piedra/40">
            <div
              className="h-full rounded-full bg-petroleo transition-[width] duration-500 ease-out"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-xs tabular-nums text-grafito/50">{count}</span>
        </div>
      ))}
    </div>
  );
}

import { ACTIVITY_EVENT_LABELS, formatRelativeDate } from "@/lib/admin/constants";

type ActivityEvent = {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
  actor: { full_name: string } | null;
};

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-grafito/40">Sin actividad registrada.</p>;
  }

  return (
    <ul className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="flex items-start gap-3">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-petroleo" />
          <div className="min-w-0">
            <p className="text-sm text-grafito/70">{event.description}</p>
            <p className="text-xs text-grafito/40">
              {ACTIVITY_EVENT_LABELS[event.event_type] ?? event.event_type} · {formatRelativeDate(event.created_at)}
              {event.actor ? ` · ${event.actor.full_name}` : ""}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

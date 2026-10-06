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
    return <p className="py-2 text-sm text-grafito/50">Sin actividad registrada.</p>;
  }

  return (
    <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[3px] before:top-2 before:w-px before:bg-grafito/[0.08]">
      {events.map((event) => (
        <li key={event.id} className="relative flex items-start gap-3.5">
          <span aria-hidden="true" className="relative mt-[7px] h-[7px] w-[7px] shrink-0 rounded-full bg-petroleo ring-2 ring-blanco-roto" />
          <div className="min-w-0">
            <p className="text-sm leading-snug text-grafito/80">{event.description}</p>
            <p className="mt-1 text-xs text-grafito/50">
              {ACTIVITY_EVENT_LABELS[event.event_type] ?? event.event_type} · {formatRelativeDate(event.created_at)}
              {event.actor ? ` · ${event.actor.full_name}` : ""}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

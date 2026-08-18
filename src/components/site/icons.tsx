type IconProps = { className?: string };

const base = "h-5 w-5";

export function IconBed({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
      <path d="M3 18v2M21 18v2" />
      <path d="M3 12V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
      <path d="M13 12V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3" />
    </svg>
  );
}

export function IconBath({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <path d="M4 12h16a1 1 0 0 1 1 1 7 7 0 0 1-4 6.32V20a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-.68A7 7 0 0 1 3 13a1 1 0 0 1 1-1Z" />
      <path d="M6 12V6.5A2.5 2.5 0 0 1 8.5 4c.9 0 1.5.4 2 1" />
    </svg>
  );
}

export function IconArea({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <rect x={4} y={4} width={16} height={16} rx={1} />
      <path d="M4 9h3M4 15h3M20 9h-3M20 15h-3M9 4v3M15 4v3M9 20v-3M15 20v-3" />
    </svg>
  );
}

export function IconPin({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx={12} cy={9.5} r={2.3} />
    </svg>
  );
}

export function IconBuilding({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <path d="M6 21V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v16" />
      <path d="M14 21V10a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v11" />
      <path d="M3 21h18" />
      <path d="M8 8h1M8 12h1M8 16h1" />
    </svg>
  );
}

export function IconKey({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <circle cx={8} cy={9} r={4} />
      <path d="M11 12.2 20 21M17 15l2.5 2.5M14.5 17.5 17 20" />
    </svg>
  );
}

export function IconCalculator({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <rect x={5} y={3} width={14} height={18} rx={1.5} />
      <path d="M8 7h8M8 12h1M12 12h1M16 12h1M8 16h1M12 16h1M16 16h1" />
    </svg>
  );
}

export function IconChart({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <path d="M4 20V10M11 20V4M18 20v-7" />
      <path d="M3 20h18" />
    </svg>
  );
}

export function IconUsers({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <circle cx={9} cy={8} r={3} />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <path d="M16 4.5c1.7.4 3 1.9 3 3.5s-1.3 3.1-3 3.5M20.5 20c0-2.8-1.8-4.8-4-5.3" />
    </svg>
  );
}

export function IconDocument({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4h4M9 12h6M9 15.5h6M9 8.5h2" />
    </svg>
  );
}

export function IconHome({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function IconExpand({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <path d="M4 9V5a1 1 0 0 1 1-1h4" />
      <path d="M20 9V5a1 1 0 0 0-1-1h-4" />
      <path d="M4 15v4a1 1 0 0 0 1 1h4" />
      <path d="M20 15v4a1 1 0 0 1-1 1h-4" />
    </svg>
  );
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-4 w-4"} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-4 w-4"} aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconStar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? "h-4 w-4"} aria-hidden="true">
      <path d="M12 2.5l2.85 6.3 6.9.66-5.2 4.63 1.55 6.79L12 17.77 5.9 20.88l1.55-6.79-5.2-4.63 6.9-.66L12 2.5Z" />
    </svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={className ?? "h-4 w-4"} aria-hidden="true">
      <circle cx={11} cy={11} r={7} />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function IconPortrait({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <circle cx={12} cy={8.5} r={3.5} />
      <path d="M4.5 20c0-4.1 3.4-6.5 7.5-6.5s7.5 2.4 7.5 6.5" />
    </svg>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <circle cx={12} cy={12} r={8} />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}

export function IconFilter({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <path d="M4 6h16M7.5 12h9M11 18h2" />
    </svg>
  );
}

export function IconBell({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <path d="M6 9a6 6 0 0 1 12 0c0 4 1.4 5.3 1.8 5.8a.6.6 0 0 1-.5.9H4.7a.6.6 0 0 1-.5-.9C4.6 14.3 6 13 6 9Z" />
      <path d="M10.3 19a1.8 1.8 0 0 0 3.4 0" />
    </svg>
  );
}

export function IconTag({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <path d="M3 12.4 12 3.5h6a2 2 0 0 1 2 2v6l-8.9 9a1.4 1.4 0 0 1-2 0L3 14.4a1.4 1.4 0 0 1 0-2Z" />
      <circle cx={15.2} cy={8} r={1.1} fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconStatusDot({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <circle cx={12} cy={12} r={8} />
      <circle cx={12} cy={12} r={2.6} fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconTable({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <rect x={3.5} y={4.5} width={17} height={15} rx={1.5} />
      <path d="M3.5 9.5h17M9 9.5V19.5" />
    </svg>
  );
}

export function IconInstagram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className ?? base} aria-hidden="true">
      <rect x={3} y={3} width={18} height={18} rx={5} />
      <circle cx={12} cy={12} r={4} />
      <circle cx={17.5} cy={6.5} r={1} fill="currentColor" stroke="none" />
    </svg>
  );
}

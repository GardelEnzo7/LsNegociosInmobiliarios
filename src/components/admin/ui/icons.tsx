/**
 * Admin-only icons, drawn in the same 24px / 1.6 stroke language as
 * components/site/icons.tsx (which the admin also uses for its nav icons).
 * Kept separate so admin-specific glyphs never touch the public site's file.
 */
type IconProps = { className?: string };

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-4 w-4"}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconGrip({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? "h-4 w-4"} aria-hidden="true">
      <circle cx={9} cy={6} r={1.4} />
      <circle cx={15} cy={6} r={1.4} />
      <circle cx={9} cy={12} r={1.4} />
      <circle cx={15} cy={12} r={1.4} />
      <circle cx={9} cy={18} r={1.4} />
      <circle cx={15} cy={18} r={1.4} />
    </svg>
  );
}

export function IconTrash({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 7h16M9.5 7V4.5h5V7M6 7l.9 12.1A2 2 0 0 0 8.9 21h6.2a2 2 0 0 0 2-1.9L18 7M10 11v6M14 11v6" />
    </Svg>
  );
}

export function IconStarOutline({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3.2l2.6 5.6 6.1.6-4.6 4.1 1.4 6L12 16.6l-5.5 2.9 1.4-6-4.6-4.1 6.1-.6L12 3.2Z" />
    </Svg>
  );
}

export function IconImagePlus({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7" />
      <path d="M4 16l4.5-4.5a1.5 1.5 0 0 1 2.1 0L15 16M13.5 14.5l1.4-1.4a1.5 1.5 0 0 1 2.1 0L20 16" />
      <path d="M18 3v6M15 6h6" />
    </Svg>
  );
}

export function IconPlus({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function IconArrowLeft({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Svg>
  );
}

export function IconExternal({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </Svg>
  );
}

export function IconLogout({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" />
    </Svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function IconInfo({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx={12} cy={12} r={8.5} />
      <path d="M12 11v5M12 8h.01" />
    </Svg>
  );
}

export function IconEye({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M2 12c1.5-3.5 5.3-7 10-7s8.5 3.5 10 7c-1.5 3.5-5.3 7-10 7s-8.5-3.5-10-7Z" />
      <circle cx={12} cy={12} r={2.8} />
    </Svg>
  );
}

export function IconEyeOff({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 3l18 18M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5M6.5 6.7C4.3 8.2 2.7 10.3 2 12c1.5 3.5 5.3 7 10 7 1.7 0 3.3-.4 4.7-1.1M9.9 4.2A10.6 10.6 0 0 1 12 4c4.7 0 8.5 3.5 10 7-.4 1-1 2-1.7 2.9" />
    </Svg>
  );
}

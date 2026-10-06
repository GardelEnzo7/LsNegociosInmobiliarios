import type { ReactNode } from "react";
import Link from "next/link";
import { IconArrowLeft } from "@/components/admin/ui/icons";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="-ml-1 inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-sm text-grafito/55 transition-colors duration-150 ease-out hover:text-petroleo"
    >
      <IconArrowLeft className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
  back,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header>
      {back ? (
        <div className="mb-3">
          <BackLink href={back.href} label={back.label} />
        </div>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h1 className="font-display text-[26px] leading-[1.15] text-grafito sm:text-[28px]" style={{ fontWeight: 480 }}>
            {title}
          </h1>
          {subtitle ? <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-grafito/60">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}

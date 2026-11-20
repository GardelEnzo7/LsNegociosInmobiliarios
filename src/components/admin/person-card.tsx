import { IconMail, IconWhatsapp } from "@/components/site/icons";
import { labelClass } from "@/components/admin/ui/form-field";
import { buttonClass } from "@/components/admin/ui/button";
import { Panel } from "@/components/admin/ui/panel";
import { telHref, whatsappHref } from "@/lib/admin/contact-links";

/** Owner / tenant block on the contract detail, with one-tap contact. */
export function PersonCard({
  label,
  person,
}: {
  label: string;
  person: { full_name: string; contact_phone: string | null; contact_email: string | null } | null;
}) {
  const wa = whatsappHref(person?.contact_phone);
  const tel = telHref(person?.contact_phone);

  return (
    <Panel>
      <p className={labelClass}>{label}</p>
      <p className="mt-2 font-display text-[17px] leading-snug text-grafito" style={{ fontWeight: 480 }}>
        {person?.full_name ?? "—"}
      </p>
      <p className="mt-1 text-sm text-grafito/60">
        {tel ? (
          <a href={tel} className="hover:text-petroleo">
            {person?.contact_phone}
          </a>
        ) : null}
        {tel && person?.contact_email ? " · " : null}
        {person?.contact_email ? (
          <a href={`mailto:${person.contact_email}`} className="break-all hover:text-petroleo">
            {person.contact_email}
          </a>
        ) : null}
        {!tel && !person?.contact_email ? "Sin datos de contacto" : null}
      </p>
      {wa || person?.contact_email ? (
        <div className="-mx-2.5 mt-3 flex flex-wrap gap-1">
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClass("ghost", "sm")}>
              <IconWhatsapp className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          ) : null}
          {person?.contact_email ? (
            <a href={`mailto:${person.contact_email}`} className={buttonClass("ghost", "sm")}>
              <IconMail className="h-3.5 w-3.5" />
              Email
            </a>
          ) : null}
        </div>
      ) : null}
    </Panel>
  );
}

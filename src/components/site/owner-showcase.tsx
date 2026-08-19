import { Suspense } from "react";
import { Reveal } from "@/components/site/reveal";
import { OwnerPhotoModal } from "@/components/site/owner-photo-modal";
import { getAgencyProfile } from "@/lib/data/showcase";
import { SITE } from "@/lib/constants";
import { splitParagraphs } from "@/lib/utils";

const DEFAULT_BIO =
  "¡Hola! Mi nombre es Laura Senmache. Soy Licenciada en Dirección y Gestión de Bienes, egresada de la UCA, con más de 6 años de experiencia en el rubro.\n\nMi principal objetivo es acompañarte en cada proceso y negociación, brindándote seguridad y confianza en cada operación.";

/**
 * Editorial two-column layout, no card chrome around the photo/copy — just
 * a large portrait and generous type. Photo comes first in markup so it's
 * naturally first on mobile too (`lg:grid-cols-2` only kicks in the
 * side-by-side arrangement at desktop widths).
 *
 * The profile-dependent grid is split into its own async component behind
 * a Suspense boundary so this section's own `getAgencyProfile()` round trip
 * can never hold up the initial HTML flush for the rest of the homepage —
 * it was previously the one section on this page with its own data fetch
 * outside the page-level `Promise.all`, sitting on the critical path in
 * front of the Hero's LCP image for every request. This section is well
 * below the fold, so in practice the fallback below is rarely if ever seen.
 */
export function OwnerShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 sm:px-10">
      <Reveal className="text-center">
        <p className="font-utility text-[12px] uppercase tracking-[0.24em] text-petroleo">
          Quién te acompaña
        </p>
        <h2 className="mt-3 font-display text-4xl text-grafito">
          Detrás de cada operación, un mismo nombre
        </h2>
      </Reveal>

      <Suspense fallback={<OwnerShowcaseFallback />}>
        <OwnerShowcaseContent />
      </Suspense>
    </section>
  );
}

async function OwnerShowcaseContent() {
  const profile = await getAgencyProfile();
  const name = profile?.owner_name || SITE.displayName;
  const license = profile?.owner_license || SITE.matricula;
  const bio = profile?.owner_bio || DEFAULT_BIO;
  const quote = profile?.owner_quote ?? null;

  return (
    <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
      <Reveal className="mx-auto w-full max-w-sm sm:max-w-md lg:mx-0 lg:max-w-md">
        <OwnerPhotoModal
          photoUrl={profile?.owner_photo_url ?? null}
          photoAlt={profile?.owner_photo_alt ?? null}
          name={name}
          license={license}
          bio={bio}
          quote={quote}
        />
      </Reveal>

      <Reveal delay={100}>
        <div className="mx-auto max-w-md text-center lg:mx-0 lg:max-w-none lg:text-left">
          <p className="font-display text-3xl leading-[1.1] text-grafito sm:text-4xl lg:text-5xl">
            {name}
          </p>
          <p className="mt-3 font-utility text-[12px] uppercase tracking-[0.16em] text-petroleo">
            Fundadora · {license}
          </p>
          <div className="mx-auto mt-6 max-w-md space-y-3 lg:mx-0">
            {splitParagraphs(bio).map((paragraph, index) => (
              <p key={index} className="font-body text-base leading-relaxed text-grafito/70">
                {paragraph}
              </p>
            ))}
          </div>
          {quote ? (
            <p className="mx-auto mt-8 max-w-md border-l-2 border-petroleo/40 pl-5 text-left font-display text-lg italic leading-snug text-grafito/80 lg:mx-0">
              &ldquo;{quote}&rdquo;
            </p>
          ) : null}
        </div>
      </Reveal>
    </div>
  );
}

// Matches OwnerShowcaseContent's grid closely enough (same aspect-ratio photo
// box, same column widths) to keep any shift on swap-in imperceptible — see
// the Suspense boundary above for why this is rarely even shown in practice.
function OwnerShowcaseFallback() {
  return (
    <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div className="mx-auto aspect-[4/5] w-full max-w-sm rounded-2xl bg-piedra/50 sm:max-w-md lg:mx-0 lg:max-w-md" />
      <div className="mx-auto max-w-md text-center lg:mx-0 lg:max-w-none lg:text-left">
        <div className="mx-auto h-10 w-56 rounded bg-piedra/50 lg:mx-0" />
        <div className="mx-auto mt-4 h-3 w-40 rounded bg-piedra/50 lg:mx-0" />
        <div className="mx-auto mt-8 space-y-3 lg:mx-0">
          <div className="h-4 w-full rounded bg-piedra/50" />
          <div className="h-4 w-full rounded bg-piedra/50" />
          <div className="h-4 w-2/3 rounded bg-piedra/50 lg:mx-0" />
        </div>
      </div>
    </div>
  );
}

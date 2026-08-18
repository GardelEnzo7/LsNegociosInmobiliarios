import { Reveal } from "@/components/site/reveal";
import { OwnerPhotoModal } from "@/components/site/owner-photo-modal";
import { getAgencyProfile } from "@/lib/data/showcase";
import { SITE } from "@/lib/constants";

const DEFAULT_BIO =
  "Más de 5 años acompañando a familias rosarinas a comprar, vender y alquilar con confianza.";

/**
 * Editorial two-column layout, no card chrome around the photo/copy — just
 * a large portrait and generous type. Photo comes first in markup so it's
 * naturally first on mobile too (`lg:grid-cols-2` only kicks in the
 * side-by-side arrangement at desktop widths).
 */
export async function OwnerShowcase() {
  const profile = await getAgencyProfile();
  const name = profile?.owner_name || SITE.displayName;
  const license = profile?.owner_license || SITE.matricula;
  const bio = profile?.owner_bio || DEFAULT_BIO;
  const quote = profile?.owner_quote ?? null;

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
            <p className="mx-auto mt-6 max-w-md font-body text-base leading-relaxed text-grafito/70 lg:mx-0">
              {bio}
            </p>
            {quote ? (
              <p className="mx-auto mt-8 max-w-md border-l-2 border-petroleo/40 pl-5 text-left font-display text-lg italic leading-snug text-grafito/80 lg:mx-0">
                &ldquo;{quote}&rdquo;
              </p>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

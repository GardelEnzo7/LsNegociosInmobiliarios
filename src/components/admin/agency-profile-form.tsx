"use client";

import { useActionState, useState } from "react";
import { updateAgencyProfile, type AgencyProfileFormState } from "@/app/actions/showcase";
import { Panel } from "@/components/admin/ui/panel";
import { FormField, inputClass } from "@/components/admin/ui/form-field";
import { ShowcaseImageField } from "@/components/admin/showcase-image-field";

type Profile = {
  owner_photo_url: string | null;
  owner_photo_alt: string | null;
  owner_name: string | null;
  owner_license: string | null;
  owner_bio: string | null;
  owner_quote: string | null;
} | null;

const initialState: AgencyProfileFormState = {};

export function AgencyProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateAgencyProfile, initialState);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  return (
    <Panel title="Quién te acompaña">
      <form action={formAction} className="space-y-4">
        <ShowcaseImageField
          name="photoUrl"
          folder="profile"
          initialUrl={profile?.owner_photo_url}
          disabled={pending}
          onUploadingChange={setUploadingPhoto}
        />

        <FormField label="Texto alternativo de la foto (SEO)" htmlFor="photoAlt">
          <input id="photoAlt" name="photoAlt" defaultValue={profile?.owner_photo_alt ?? ""} className={inputClass} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nombre" htmlFor="ownerName">
            <input id="ownerName" name="ownerName" defaultValue={profile?.owner_name ?? ""} className={inputClass} />
          </FormField>
          <FormField label="Matrícula" htmlFor="ownerLicense">
            <input id="ownerLicense" name="ownerLicense" defaultValue={profile?.owner_license ?? ""} className={inputClass} />
          </FormField>
        </div>

        <FormField label="Descripción" htmlFor="ownerBio">
          <textarea id="ownerBio" name="ownerBio" rows={3} defaultValue={profile?.owner_bio ?? ""} className={inputClass} />
        </FormField>

        <FormField label="Frase institucional (opcional)" htmlFor="ownerQuote">
          <textarea id="ownerQuote" name="ownerQuote" rows={2} defaultValue={profile?.owner_quote ?? ""} className={inputClass} />
        </FormField>

        {state.error ? <p className="text-sm text-terracota">{state.error}</p> : null}

        <button
          type="submit"
          disabled={pending || uploadingPhoto}
          className="rounded-lg bg-grafito px-5 py-2.5 text-sm font-medium text-blanco-roto transition-colors duration-200 ease-out hover:bg-grafito-dark disabled:opacity-60"
        >
          {uploadingPhoto ? "Subiendo foto…" : pending ? "Guardando…" : "Guardar"}
        </button>
      </form>
    </Panel>
  );
}

"use client";

import { useActionState, useState } from "react";
import { updateAgencyProfile, type AgencyProfileFormState } from "@/app/actions/showcase";
import { Panel } from "@/components/admin/ui/panel";
import { FormField, inputClass, textareaClass } from "@/components/admin/ui/form-field";
import { buttonClass } from "@/components/admin/ui/button";
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
    <Panel>
      <form action={formAction} className="space-y-5">
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

        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <FormField label="Nombre" htmlFor="ownerName">
            <input id="ownerName" name="ownerName" defaultValue={profile?.owner_name ?? ""} className={inputClass} />
          </FormField>
          <FormField label="Matrícula" htmlFor="ownerLicense">
            <input id="ownerLicense" name="ownerLicense" defaultValue={profile?.owner_license ?? ""} className={inputClass} />
          </FormField>
        </div>

        <FormField label="Descripción" htmlFor="ownerBio">
          <textarea id="ownerBio" name="ownerBio" rows={3} defaultValue={profile?.owner_bio ?? ""} className={textareaClass} />
        </FormField>

        <FormField label="Frase institucional (opcional)" htmlFor="ownerQuote">
          <textarea id="ownerQuote" name="ownerQuote" rows={2} defaultValue={profile?.owner_quote ?? ""} className={textareaClass} />
        </FormField>

        <div className="flex flex-col gap-3 border-t border-grafito/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div role="status" className="text-sm text-terracota">
            {state.error ? <p>{state.error}</p> : null}
          </div>
          <button type="submit" disabled={pending || uploadingPhoto} className={buttonClass("primary")}>
            {uploadingPhoto ? "Subiendo foto…" : pending ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </Panel>
  );
}

"use client";

import type { ReactNode } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";

import {
  siteSettingsSchema,
  type SiteSettingsFormValues,
} from "@/lib/validations/admin/content";

import { describeDispatchWindow } from "@/features/admin/content/types";

import { ContentTextField } from "./ContentTextField";

interface SettingsGroupProps {
  title: string;
  children: ReactNode;
}

function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <fieldset className="flex flex-col gap-4 border-t border-ash pt-4">
      <legend className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
        {title}
      </legend>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export interface SiteSettingsFormProps {
  defaultValues: SiteSettingsFormValues;
  isSaving: boolean;
  heroField: ReactNode;
  onSubmit: (values: SiteSettingsFormValues) => void;
}

export function SiteSettingsForm({
  defaultValues,
  isSaving,
  heroField,
  onSubmit,
}: SiteSettingsFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues,
  });

  const dispatchMin = useWatch({ control, name: "dispatch_days_min" });
  const dispatchMax = useWatch({ control, name: "dispatch_days_max" });
  const dispatchLine = describeDispatchWindow(
    Number(dispatchMin),
    Number(dispatchMax),
  );

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
    >
      <SettingsGroup title="Contact">
        <ContentTextField
          id="settings-contact-email"
          label="Email"
          hint={null}
          error={errors.contact_email?.message}
          isMultiline={false}
          registration={register("contact_email")}
        />
        <ContentTextField
          id="settings-contact-phone"
          label="Phone"
          hint="Ten digits."
          error={errors.contact_phone?.message}
          isMultiline={false}
          registration={register("contact_phone")}
        />
        <ContentTextField
          id="settings-whatsapp"
          label="WhatsApp"
          hint="Used by the ask-us links on product pages."
          error={errors.whatsapp_number?.message}
          isMultiline={false}
          registration={register("whatsapp_number")}
        />
        <ContentTextField
          id="settings-opening-hours"
          label="Opening hours"
          hint={null}
          error={errors.opening_hours?.message}
          isMultiline={false}
          registration={register("opening_hours")}
        />
        <ContentTextField
          id="settings-address"
          label="Address"
          hint={null}
          error={errors.address?.message}
          isMultiline
          registration={register("address")}
        />
      </SettingsGroup>

      <SettingsGroup title="Social">
        <ContentTextField
          id="settings-instagram"
          label="Instagram"
          hint="Leave empty to hide the link."
          error={errors.instagram_url?.message}
          isMultiline={false}
          registration={register("instagram_url")}
        />
        <ContentTextField
          id="settings-facebook"
          label="Facebook"
          hint={null}
          error={errors.facebook_url?.message}
          isMultiline={false}
          registration={register("facebook_url")}
        />
        <ContentTextField
          id="settings-youtube"
          label="YouTube"
          hint={null}
          error={errors.youtube_url?.message}
          isMultiline={false}
          registration={register("youtube_url")}
        />
      </SettingsGroup>

      <SettingsGroup title="Shipping">
        <ContentTextField
          id="settings-shipping-fee"
          label="Flat fee in rupees"
          hint={null}
          error={errors.shipping_flat_fee?.message}
          isMultiline={false}
          registration={register("shipping_flat_fee")}
        />
        <ContentTextField
          id="settings-free-shipping"
          label="Free above, in rupees"
          hint="Leave empty to always charge the flat fee."
          error={errors.free_shipping_above?.message}
          isMultiline={false}
          registration={register("free_shipping_above")}
        />
      </SettingsGroup>

      <SettingsGroup title="Dispatch">
        <ContentTextField
          id="settings-dispatch-min"
          label="Earliest, in days"
          hint="The first number in \u201cships in 7 to 12 days\u201d."
          error={errors.dispatch_days_min?.message}
          isMultiline={false}
          registration={register("dispatch_days_min")}
        />
        <ContentTextField
          id="settings-dispatch-max"
          label="Latest, in days"
          hint="Never earlier than the first number."
          error={errors.dispatch_days_max?.message}
          isMultiline={false}
          registration={register("dispatch_days_max")}
        />
        <p className="text-[12px] text-muted-foreground md:col-span-2">
          The shelf will read: {dispatchLine}
        </p>
      </SettingsGroup>

      <SettingsGroup title="Hero">
        <ContentTextField
          id="settings-hero-heading"
          label="Heading"
          hint={null}
          error={errors.hero_heading?.message}
          isMultiline={false}
          registration={register("hero_heading")}
        />
        <ContentTextField
          id="settings-hero-subheading"
          label="Subheading"
          hint={null}
          error={errors.hero_subheading?.message}
          isMultiline={false}
          registration={register("hero_subheading")}
        />
        <ContentTextField
          id="settings-hero-cta-text"
          label="Button text"
          hint={null}
          error={errors.hero_cta_text?.message}
          isMultiline={false}
          registration={register("hero_cta_text")}
        />
        <ContentTextField
          id="settings-hero-cta-href"
          label="Button link"
          hint="A path like /products, or a full URL."
          error={errors.hero_cta_href?.message}
          isMultiline={false}
          registration={register("hero_cta_href")}
        />
      </SettingsGroup>

      {heroField}

      <div className="flex gap-3">
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}

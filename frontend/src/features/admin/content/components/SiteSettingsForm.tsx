"use client";

import type { ReactNode } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";

import {
  siteSettingsSchema,
  type SiteSettingsFormValues,
} from "@/lib/validations/admin/content";

import {
  canAddCommissionStep,
  describeCommissionStepCount,
  describeDispatchWindow,
  EMPTY_COMMISSION_STEP,
  nextIndex,
} from "@/features/admin/content/types";

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

  const steps = useFieldArray({ control, name: "commission_steps" });
  const stepCount = steps.fields.length;
  const stepsError =
    errors.commission_steps?.message ?? errors.commission_steps?.root?.message;

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
          hint="The first number in “ships in 7 to 12 days”."
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

      <fieldset className="flex flex-col gap-4 border-t border-ash pt-4">
        <legend className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          Commission page
        </legend>
        <ContentTextField
          id="settings-commission-intro"
          label="Intro"
          hint="The line under “Commission a piece” on /custom."
          error={errors.commission_intro?.message}
          isMultiline
          registration={register("commission_intro")}
        />

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[12px] text-muted-foreground">
              {describeCommissionStepCount(stepCount)}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!canAddCommissionStep(stepCount)}
              onClick={() => steps.append({ ...EMPTY_COMMISSION_STEP })}
            >
              Add step
            </Button>
          </div>
          {stepsError && (
            <p role="alert" className="text-[12px] text-destructive">
              {stepsError}
            </p>
          )}
          {steps.fields.map((step, index) => {
            const stepErrors = errors.commission_steps?.[index];
            const position = index + 1;
            const up = nextIndex(stepCount, index, -1);
            const down = nextIndex(stepCount, index, 1);
            return (
              <div
                key={step.id}
                className="flex flex-col gap-3 border border-ash p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[12px] text-muted-foreground">
                    Step {position}
                  </span>
                  <span className="flex gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      aria-label={`Move step ${position} up`}
                      disabled={up === null}
                      onClick={() => up !== null && steps.move(index, up)}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      aria-label={`Move step ${position} down`}
                      disabled={down === null}
                      onClick={() => down !== null && steps.move(index, down)}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove step ${position}`}
                      disabled={stepCount === 1}
                      onClick={() => steps.remove(index)}
                    >
                      Remove
                    </Button>
                  </span>
                </div>
                <ContentTextField
                  id={`settings-commission-step-${index}-title`}
                  label="Title"
                  hint={null}
                  error={stepErrors?.title?.message}
                  isMultiline={false}
                  registration={register(`commission_steps.${index}.title`)}
                />
                <ContentTextField
                  id={`settings-commission-step-${index}-detail`}
                  label="Detail"
                  hint={null}
                  error={stepErrors?.detail?.message}
                  isMultiline
                  registration={register(`commission_steps.${index}.detail`)}
                />
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className="flex gap-3">
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { CommissionStatus } from "@/graphql/generated/graphql";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { formatEnumLabel } from "@/features/admin/shell";

const STATUSES = Object.values(CommissionStatus);

export interface CommissionDrawerProps {
  isOpen: boolean;
  name: string;
  email: string;
  phone: string | null;
  briefLine: string;
  carvedWords: string | null;
  notes: string | null;
  referenceImageUrls: string[];
  status: CommissionStatus;
  whatsAppHref: string | null;
  isBusy: boolean;
  onStatusChange: (status: CommissionStatus) => void;
  onWhatsAppClick: () => void;
  onOpenChange: (isOpen: boolean) => void;
}

export function CommissionDrawer({
  isOpen,
  name,
  email,
  phone,
  briefLine,
  carvedWords,
  notes,
  referenceImageUrls,
  status,
  whatsAppHref,
  isBusy,
  onStatusChange,
  onWhatsAppClick,
  onOpenChange,
}: CommissionDrawerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>{briefLine}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <dl className="flex flex-col gap-1.5 text-[13px]">
            <div className="flex gap-2">
              <dt className="w-20 text-muted-foreground">Email</dt>
              <dd>{email}</dd>
            </div>
            {phone !== null && (
              <div className="flex gap-2">
                <dt className="w-20 text-muted-foreground">Phone</dt>
                <dd className="tnum">{phone}</dd>
              </div>
            )}
            {carvedWords !== null && (
              <div className="flex gap-2">
                <dt className="w-20 text-muted-foreground">To carve</dt>
                <dd>{carvedWords}</dd>
              </div>
            )}
          </dl>

          {notes !== null && (
            <section className="flex flex-col gap-1.5">
              <h3 className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                What they wrote
              </h3>
              <p className="text-[13px] whitespace-pre-line">{notes}</p>
            </section>
          )}

          {referenceImageUrls.length > 0 && (
            <section className="flex flex-col gap-1.5">
              <h3 className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                Reference photos
              </h3>
              <div className="flex flex-wrap gap-2">
                {referenceImageUrls.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt=""
                    className="size-24 border border-ash object-cover"
                  />
                ))}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-2 border-t border-ash pt-4">
            <h3 className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
              Where this brief stands
            </h3>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((member) => (
                <Button
                  key={member}
                  type="button"
                  size="sm"
                  variant={member === status ? "default" : "secondary"}
                  disabled={isBusy || member === status}
                  onClick={() => onStatusChange(member)}
                >
                  {formatEnumLabel(member)}
                </Button>
              ))}
            </div>
          </section>

          {whatsAppHref !== null && (
            <div>
              <Button asChild type="button" variant="secondary" size="sm">
                <a
                  href={whatsAppHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={onWhatsAppClick}
                >
                  Reply on WhatsApp
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

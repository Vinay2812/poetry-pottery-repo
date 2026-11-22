import { PrivacyNote } from "@/components/legal/PrivacyNote";

// Sits beside a tracked WhatsApp link, which records the prefilled message on tap.
export function WhatsAppCopyNote() {
  return (
    <PrivacyNote lead="Opening WhatsApp saves a copy of this message so we can follow up, even if you don't send it." />
  );
}

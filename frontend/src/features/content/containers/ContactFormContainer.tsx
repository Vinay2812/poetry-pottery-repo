"use client";

import { useCallback, useState } from "react";

import { useMutation } from "@apollo/client/react";
import { SendContactMessageDocument } from "@/graphql/generated/graphql";
import { describeError } from "@/lib/apollo/errors";
import type { ContactFormValues } from "@/lib/validations/contact";

import { ConfirmationLine } from "@/features/content/components/ConfirmationLine";
import { ContactForm } from "@/features/content/components/ContactForm";

export function ContactFormContainer() {
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [send, { loading }] = useMutation(SendContactMessageDocument);

  const handleSubmit = useCallback(
    async (values: ContactFormValues) => {
      setErrorMessage(null);
      try {
        await send({
          variables: {
            input: {
              name: values.name,
              email: values.email,
              phone: values.phone.length > 0 ? values.phone : null,
              subject: values.subject.length > 0 ? values.subject : null,
              message: values.message,
            },
          },
        });
        setIsSent(true);
      } catch (error) {
        setErrorMessage(
          describeError(
            error,
            "We could not send that just now. Try again in a minute.",
          ),
        );
      }
    },
    [send],
  );

  if (isSent) {
    return (
      <ConfirmationLine text="Thank you, your message is with us. We reply within a day." />
    );
  }

  return (
    <ContactForm
      isSubmitting={loading}
      errorMessage={errorMessage}
      onSubmit={(values) => void handleSubmit(values)}
    />
  );
}

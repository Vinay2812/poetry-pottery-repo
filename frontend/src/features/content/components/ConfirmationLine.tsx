export interface ConfirmationLineProps {
  text: string;
}

// One plain line, used where a form or a link has done its job.
export function ConfirmationLine({ text }: ConfirmationLineProps) {
  return (
    <p role="status" className="border-t border-ash pt-5 text-[15px]">
      {text}
    </p>
  );
}

export interface ReferencePhotosSignInProps {
  onSignIn: () => void;
}

// Uploads are signed, so a guest gets the same heading as the picker and two ways to send photos.
export function ReferencePhotosSignIn({
  onSignIn,
}: ReferencePhotosSignInProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium">
        Reference photos
        <span className="font-normal text-muted-foreground"> (optional)</span>
      </p>
      <p className="text-[13px] text-muted-foreground">
        <button
          type="button"
          onClick={onSignIn}
          className="border-b border-ink text-ink hover:border-primary hover:text-primary"
        >
          Sign in
        </button>{" "}
        to attach them here, or send them on WhatsApp with your brief.
      </p>
    </div>
  );
}

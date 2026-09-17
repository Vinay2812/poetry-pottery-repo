export interface ClayGradientsProps {
  clayId: string;
  highlightId: string;
  shadeId: string;
  mouthId: string;
}

/**
 * The wash every drawn piece is painted with: warm clay across the body, a
 * highlight on the lit third, a terminator on the right, and depth in the mouth.
 * Ids are passed in because a page can hold several drawings and every url(#…)
 * would otherwise resolve to whichever one rendered first.
 */
export function ClayGradients({
  clayId,
  highlightId,
  shadeId,
  mouthId,
}: ClayGradientsProps) {
  return (
    <>
      <linearGradient id={clayId} x1="0" y1="0" x2="1" y2="0.55">
        <stop offset="0" stopColor="#F1EBE3" />
        <stop offset="0.22" stopColor="#EDE5DA" />
        <stop offset="0.62" stopColor="#E3D7C8" />
        <stop offset="0.86" stopColor="#DCCFBF" />
        <stop offset="1" stopColor="#D3C3B0" />
      </linearGradient>
      <linearGradient id={highlightId} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0.04" stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="0.2" stopColor="#FFFFFF" stopOpacity="0.5" />
        <stop offset="0.46" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={shadeId} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0.5" stopColor="#1F1D1A" stopOpacity="0" />
        <stop offset="1" stopColor="#1F1D1A" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id={mouthId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4F4840" stopOpacity="0.45" />
        <stop offset="0.55" stopColor="#9C8F7E" stopOpacity="0.22" />
        <stop offset="1" stopColor="#D6C8B6" stopOpacity="0.12" />
      </linearGradient>
    </>
  );
}

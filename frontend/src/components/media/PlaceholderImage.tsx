import { useId } from "react";

import type { PotteryIconKind } from "@/components/icons/pottery";
import { VESSEL_BOX, toDrawnVessel } from "@/components/media/vessels";
import { cn } from "@/lib/utils";

export interface PlaceholderImageProps {
  kind: PotteryIconKind;
  className?: string;
}

const CENTRE = VESSEL_BOX / 2;
// The drawn piece sits in the middle half of its box, so left alone it reads far smaller
// than a photographed piece does in its frame. These lift it to the same optical size.
const PIECE_CENTRE_Y = 108;
const FILL_SCALE = 1.4;

/**
 * Stands in wherever a photo is missing: the piece itself, drawn and shaded the
 * way the hero jar is, so an unphotographed product still looks handmade.
 */
export function PlaceholderImage({ kind, className }: PlaceholderImageProps) {
  const vessel = toDrawnVessel(kind);
  // A grid can hold several unphotographed pieces of one kind, and every url(#…)
  // in the document would otherwise resolve to whichever one rendered first.
  const id = useId();
  const clayId = `${id}-clay`;
  const highlightId = `${id}-highlight`;
  const shadeId = `${id}-shade`;
  const mouthId = `${id}-mouth`;
  const clipId = `${id}-body`;

  return (
    <span
      className={cn(
        "flex size-full items-center justify-center bg-clay-white text-ink",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${VESSEL_BOX} ${VESSEL_BOX}`}
        role="img"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-full [&_*]:[vector-effect:non-scaling-stroke]"
      >
        <title>{vessel.title}</title>

        <defs>
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
          <clipPath id={clipId}>
            <path d={vessel.body} />
          </clipPath>
        </defs>

        <g
          transform={`translate(${CENTRE} ${PIECE_CENTRE_Y}) scale(${FILL_SCALE}) translate(${-CENTRE} ${-PIECE_CENTRE_Y})`}
        >
          {/* The shadow it drops on the shelf. */}
          {vessel.shadow.map((ring) => (
            <ellipse
              key={ring.rx}
              cx={CENTRE + 4}
              cy={vessel.shadowY}
              rx={ring.rx}
              ry={ring.ry}
              fill="currentColor"
              fillOpacity={ring.opacity}
              stroke="none"
            />
          ))}

          {vessel.handle && (
            <path
              d={vessel.handle}
              fill={`url(#${clayId})`}
              stroke="currentColor"
              strokeWidth={1.1}
            />
          )}

          <path d={vessel.body} fill={`url(#${clayId})`} stroke="none" />

          {/* Light from the upper left, then the piece's own rings and hatching. */}
          <g clipPath={`url(#${clipId})`}>
            <rect
              x="0"
              y="0"
              width={VESSEL_BOX}
              height={VESSEL_BOX}
              fill={`url(#${highlightId})`}
              stroke="none"
            />
            <rect
              x="0"
              y="0"
              width={VESSEL_BOX}
              height={VESSEL_BOX}
              fill={`url(#${shadeId})`}
              stroke="none"
            />
            <g className="text-smoke" strokeWidth={0.8}>
              {vessel.rings.map((ring) => (
                <path key={ring.d} d={ring.d} strokeOpacity={ring.opacity} />
              ))}
            </g>
            <g className="text-smoke" strokeWidth={0.65}>
              {vessel.hatch.map((stroke) => (
                <path
                  key={stroke.d}
                  d={stroke.d}
                  strokeOpacity={stroke.opacity}
                />
              ))}
            </g>
            <path
              d={vessel.glazeBand}
              fill="#4F6F52"
              fillOpacity={0.68}
              stroke="none"
            />
            <path
              d={vessel.glazeTop}
              stroke="#F7F4EF"
              strokeOpacity={0.55}
              strokeWidth={0.8}
            />
          </g>

          {/* The mouth, with the inside of the piece seen over the rim. */}
          <path d={vessel.mouth} fill={`url(#${clayId})`} stroke="none" />
          <path d={vessel.mouthInner} fill={`url(#${mouthId})`} stroke="none" />

          <g strokeWidth={1.25}>
            <path d={vessel.nearWall} />
            <path d={vessel.farWall} />
            <path d={vessel.foot} />
            <path d={vessel.mouth} />
            <path
              d={vessel.mouthInner}
              strokeWidth={0.7}
              strokeOpacity={0.55}
            />
          </g>
        </g>
      </svg>
    </span>
  );
}

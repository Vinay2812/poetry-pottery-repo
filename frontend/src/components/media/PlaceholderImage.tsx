import { useId } from "react";

import type { PotteryIconKind } from "@/components/icons/pottery";
import { ClayGradients } from "@/components/media/ClayGradients";
import {
  FILL_SCALE,
  PIECE_CENTRE_Y,
  VESSEL_BOX,
  toDrawnVessel,
} from "@/components/media/vessels";
import { cn } from "@/lib/utils";

export interface PlaceholderImageProps {
  kind: PotteryIconKind;
  className?: string;
}

const CENTRE = VESSEL_BOX / 2;

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
          <ClayGradients
            clayId={clayId}
            highlightId={highlightId}
            shadeId={shadeId}
            mouthId={mouthId}
          />
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

import { useId } from "react";

import { ClayGradients } from "@/components/media/ClayGradients";
import {
  toCategoryPiece,
  toCategoryPieceKind,
  type PieceElement,
} from "@/components/media/categoryPieces";
import { VESSEL_BOX } from "@/components/media/vessels";
import { cn } from "@/lib/utils";

export interface CategoryPieceProps {
  slug: string;
  className?: string;
}

const CENTRE = VESSEL_BOX / 2;
const KILN = "#C4785A";

// Strokes are in user units, not screen pixels, so the whole drawing thins out
// together as the tile shrinks instead of the outline going wiry over it.
const OUTLINE_WIDTH = 2.6;
const RING_WIDTH = 2;
const HATCH_WIDTH = 1.9;

interface ElementProps {
  element: PieceElement;
  clayId: string;
  highlightId: string;
  shadeId: string;
  mouthId: string;
  flashId: string;
  clipId: string;
}

function Element({
  element,
  clayId,
  highlightId,
  shadeId,
  mouthId,
  flashId,
  clipId,
}: ElementProps) {
  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <path d={element.body} />
        </clipPath>
      </defs>

      {element.handle && (
        <path
          d={element.handle}
          fill={`url(#${clayId})`}
          stroke="currentColor"
          strokeWidth={OUTLINE_WIDTH * 0.8}
        />
      )}

      <path d={element.body} fill={`url(#${clayId})`} stroke="none" />

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
        {element.flash && (
          <ellipse
            cx={element.flash.cx}
            cy={element.flash.cy}
            rx={element.flash.rx}
            ry={element.flash.ry}
            fill={`url(#${flashId})`}
            stroke="none"
          />
        )}
        <g className="text-smoke" strokeWidth={RING_WIDTH}>
          {element.rings.map((ring) => (
            <path key={ring.d} d={ring.d} strokeOpacity={ring.opacity} />
          ))}
        </g>
        <g className="text-smoke" strokeWidth={HATCH_WIDTH}>
          {element.hatch.map((stroke) => (
            <path key={stroke.d} d={stroke.d} strokeOpacity={stroke.opacity} />
          ))}
        </g>
        {element.flash && (
          <g stroke={KILN} strokeWidth={HATCH_WIDTH * 1.2}>
            {element.flash.strokes.map((stroke) => (
              <path
                key={stroke.d}
                d={stroke.d}
                strokeOpacity={Math.min(0.5, stroke.opacity * 1.3)}
              />
            ))}
          </g>
        )}
        {element.glaze && (
          <>
            <path
              d={element.glaze.band}
              fill="#4F6F52"
              fillOpacity={0.68}
              stroke="none"
            />
            <path
              d={element.glaze.top}
              stroke="#F7F4EF"
              strokeOpacity={0.55}
              strokeWidth={RING_WIDTH}
            />
          </>
        )}
      </g>

      <path d={element.mouth.outer} fill={`url(#${clayId})`} stroke="none" />
      {element.mouth.inner && (
        <path d={element.mouth.inner} fill={`url(#${mouthId})`} stroke="none" />
      )}

      <g strokeWidth={OUTLINE_WIDTH}>
        {element.outline.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </>
  );
}

/**
 * The piece a category is named after, drawn and shaded like the hero jar
 * rather than outlined. Decorative: the category name is always beside it.
 */
export function CategoryPiece({ slug, className }: CategoryPieceProps) {
  const piece = toCategoryPiece(toCategoryPieceKind(slug));
  const id = useId();
  const clayId = `${id}-clay`;
  const highlightId = `${id}-highlight`;
  const shadeId = `${id}-shade`;
  const mouthId = `${id}-mouth`;
  const flashId = `${id}-flash`;

  return (
    <svg
      viewBox={`0 0 ${VESSEL_BOX} ${VESSEL_BOX}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn("size-16", className)}
    >
      <defs>
        <ClayGradients
          clayId={clayId}
          highlightId={highlightId}
          shadeId={shadeId}
          mouthId={mouthId}
        />
        <radialGradient id={flashId}>
          <stop offset="0" stopColor={KILN} stopOpacity="0.34" />
          <stop offset="0.55" stopColor={KILN} stopOpacity="0.16" />
          <stop offset="1" stopColor={KILN} stopOpacity="0" />
        </radialGradient>
      </defs>

      <g
        transform={`translate(${CENTRE} ${piece.centreY}) scale(${piece.scale}) translate(${-CENTRE} ${-piece.centreY})`}
      >
        {/* The shadow stays ink while the outline takes the hover colour. */}
        {piece.shadow.map((ring) => (
          <ellipse
            key={ring.rx}
            cx={CENTRE + 4}
            cy={piece.shadowY}
            rx={ring.rx}
            ry={ring.ry}
            fill="#1F1D1A"
            fillOpacity={ring.opacity}
            stroke="none"
          />
        ))}

        {piece.elements.map((element, index) => (
          <Element
            key={element.body}
            element={element}
            clayId={clayId}
            highlightId={highlightId}
            shadeId={shadeId}
            mouthId={mouthId}
            flashId={flashId}
            clipId={`${id}-body-${index}`}
          />
        ))}
      </g>
    </svg>
  );
}

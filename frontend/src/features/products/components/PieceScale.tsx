import type { PotteryIconKind } from "@/components/icons/pottery";
import { REFERENCE_CUP, toSilhouette } from "@/components/media/vessels";
import { cn } from "@/lib/utils";

import { formatCentimetres, toPieceScale } from "@/features/products/types";

export interface PieceScaleProps {
  kind: PotteryIconKind;
  heightCm: number;
  diameterCm: number;
  className?: string;
}

// How big it is, answered the way the rest of the site answers things: a drawing.
// The piece and an ordinary 250 ml cup stand on one floor at true relative scale.
export function PieceScale({
  kind,
  heightCm,
  diameterCm,
  className,
}: PieceScaleProps) {
  const scale = toPieceScale(
    heightCm,
    diameterCm,
    REFERENCE_CUP.heightCm,
    REFERENCE_CUP.diameterCm,
  );
  const piece = toSilhouette(kind, scale.pieceHeight, scale.pieceWidth);
  const cup = toSilhouette(REFERENCE_CUP.kind, scale.cupHeight, scale.cupWidth);
  const height = formatCentimetres(heightCm);
  const across = formatCentimetres(diameterCm);

  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <svg
        viewBox={`0 ${scale.minY} ${scale.width} ${scale.height}`}
        role="img"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        className="w-full max-w-[220px] text-ink [&_*]:[vector-effect:non-scaling-stroke]"
      >
        <title>
          {`This piece, ${height} tall, drawn beside a standard 250 ml cup at the same scale`}
        </title>
        <line
          x1={0}
          y1={0}
          x2={scale.width}
          y2={0}
          className="stroke-ash"
          strokeWidth={1}
        />
        <g transform={`translate(${scale.pieceX} 0)`} strokeWidth={1.25}>
          <path d={piece.body} fill="#EDE5DA" />
          <path d={piece.rim} fill="#F7F4EF" />
        </g>
        <g
          transform={`translate(${scale.cupX} 0)`}
          strokeWidth={1}
          className="text-smoke"
        >
          <path d={cup.body} strokeDasharray="4 3" />
          <path d={cup.rim} strokeDasharray="4 3" />
        </g>
      </svg>
      <figcaption className="text-[13px] text-muted-foreground">
        {across ? `${height} tall, ${across} across` : height}, next to a 250 ml
        cup
      </figcaption>
    </figure>
  );
}

import {
  BODY_PATH,
  hatchStrokes,
  throwingRings,
} from "@/features/home/components/jar-surface";
import { CLAY_WEDGE } from "@/features/home/components/jar";

const HATCH = hatchStrokes();
const RINGS = throwingRings();

/**
 * Paint shared by all six states: the clay gradients, the body clip and the
 * hatching. Rendered once and pulled in with `use`, so six drawings of the
 * same piece cost one copy of the several hundred shading strokes.
 */
export function MakingPieceDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={0}
      height={0}
      className="absolute"
    >
      <defs>
        <linearGradient id="making-clay" x1="0" y1="0" x2="1" y2="0.55">
          <stop offset="0" stopColor="#F1EBE3" />
          <stop offset="0.22" stopColor="#EDE5DA" />
          <stop offset="0.62" stopColor="#E3D7C8" />
          <stop offset="0.86" stopColor="#DCCFBF" />
          <stop offset="1" stopColor="#D3C3B0" />
        </linearGradient>
        {/* Bisque: the same light, on clay the fire has turned terracotta. */}
        <linearGradient id="making-bisque" x1="0" y1="0" x2="1" y2="0.55">
          <stop offset="0" stopColor="#F5E8DE" />
          <stop offset="0.22" stopColor="#F0DED1" />
          <stop offset="0.62" stopColor="#E8D3C4" />
          <stop offset="0.86" stopColor="#DEC3B0" />
          <stop offset="1" stopColor="#D0AF98" />
        </linearGradient>
        <linearGradient id="making-mouth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4F4840" stopOpacity="0.5" />
          <stop offset="0.55" stopColor="#9C8F7E" stopOpacity="0.24" />
          <stop offset="1" stopColor="#D6C8B6" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="making-terminator" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.5" stopColor="#1F1D1A" stopOpacity="0" />
          <stop offset="1" stopColor="#1F1D1A" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="making-highlight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.04" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.2" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="0.46" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        <clipPath id="making-body">
          <path d={BODY_PATH} />
        </clipPath>
        <clipPath id="making-wedge">
          <path d={CLAY_WEDGE} />
        </clipPath>

        <filter id="making-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves={2}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.55" intercept="-0.12" />
          </feComponentTransfer>
        </filter>

        <g id="making-rings" fill="none" stroke="#6F6A62" strokeWidth={0.85}>
          {RINGS.map((ring) => (
            <path key={ring.d} d={ring.d} strokeOpacity={ring.opacity} />
          ))}
        </g>
        <g id="making-hatch" fill="none" stroke="#6F6A62" strokeWidth={0.6}>
          {HATCH.map((stroke) => (
            <path key={stroke.d} d={stroke.d} strokeOpacity={stroke.opacity} />
          ))}
        </g>
      </defs>
    </svg>
  );
}

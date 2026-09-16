/**
 * A glaze test tile: the same crawled lower edge and pooled drip the hero jar
 * wears on its shoulder, laid flat so a colour can be shown as a material.
 */

import { pointD, splineD, wallSpline, type Point } from "./vessel";

export interface Wash {
  /** The glazed area, filled with the glaze colour. */
  glaze: string;
  /** The crawled edge where the glaze stopped and thickened. */
  crawl: string;
  /** One run that pooled and hung below the edge. */
  drip: string;
}

const EDGE = 0.74;
const STEPS = 6;

export function washSquare(width: number, height: number, seed: number): Wash {
  const edgeY = height * EDGE;
  const points: Point[] = [];
  for (let step = 0; step <= STEPS; step += 1) {
    points.push([(step / STEPS) * width, edgeY]);
  }
  const edge = wallSpline(points, seed, height * 0.09);
  const crawl = splineD(edge);
  const dripX = width * 0.63;
  const dripHalf = width * 0.045;
  const dripY = edgeY + height * 0.15;
  return {
    glaze: `${crawl}L${pointD([width, 0])}L${pointD([0, 0])}Z`,
    crawl,
    drip:
      `M${pointD([dripX - dripHalf, edgeY - height * 0.04])}` +
      `C${pointD([dripX - dripHalf * 1.4, dripY])} ${pointD([dripX + dripHalf * 1.4, dripY])} ${pointD([dripX + dripHalf, edgeY - height * 0.04])}Z`,
  };
}

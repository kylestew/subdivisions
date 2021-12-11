import { polygon, tessellate, centroid, arcLength } from "@thi.ng/geom";
import {
  earCut2,
  rimTris,
  quadFan,
  triFan,
  edgeSplit,
} from "@thi.ng/geom-tessellate";
import { rgbToHex } from "../../snod/util";

const makePoly = (points) => polygon(points);

function recursiveTess(poly, depth, decisionFn) {
  let polys = tessellate(poly, [triFan]).map(makePoly);
  return polys.flatMap((poly) => {
    if (decisionFn(poly, depth + 1)) {
      return recursiveTess(poly, depth + 1, decisionFn);
    }
    return poly;
  });
}

function decision(poly, depth) {
  // console.log(poly);
  return depth < 1;
}

function sampledPolyTint(poly, sampler) {
  let color = sampler.colorAt(centroid(poly));
  // console.log(centroid(poly), color);
  poly.attribs = {
    fill: rgbToHex(color),
  };
  return poly;
}

function subdiv(polys, sampler, decisionFn) {
  decisionFn = decision;
  // for each polygon, recursively tesselate based on some sort of decision function
  const tessFn = (poly) => recursiveTess(poly, 0, decisionFn);
  // sample image at centroid for poly color
  const polyTintFn = (poly) => sampledPolyTint(poly, sampler);
  return polys.flatMap(tessFn).map(polyTintFn);
}

export { subdiv };

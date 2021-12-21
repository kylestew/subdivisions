import { polygon, tessellate } from "@thi.ng/geom";
import { normalFromPoly } from "./normals";
import * as v from "@thi.ng/vectors";

function centroid(poly) {
  let total = [0, 0, 0];
  poly.points.forEach((pt) => {
    v.add(null, total, pt);
  });
  return v.divN([], total, poly.points.length);
}

/*
 * Grows new polys in the direction of face normal of original poly
 * poly - original poly
 * points - points of new polys after tessellation
 * depth - recursion dept of current tessellation
 */

function growFromPoly(poly, points, growthScale) {
  let cent = centroid(poly);
  return polygon(
    points.map((pt) => {
      if (v.dist(pt, cent) < 1) {
        // extrude this point along original poly normal
        let norm = normalFromPoly(poly);
        return v.add([], pt, v.mulN([], norm, growthScale));
      }
      return pt;
    }),
    poly.attribs
  );
}

function recursiveTess(poly, depth, tessFns, decisionFn, growthFn) {
  if (decisionFn(poly, depth)) {
    // tess fn selected based on depth
    let idx = depth % tessFns.length;
    let growthScale = growthFn(depth);
    let polys = tessellate(poly, [tessFns[idx]]).map((pts) =>
      growFromPoly(poly, pts, growthScale)
    );
    return polys.flatMap((poly) =>
      recursiveTess(poly, depth + 1, tessFns, decisionFn, growthFn)
    );
  }
  return poly;
}

function subdiv(
  polys,
  tessFns,
  decisionFn,
  maxDepth,
  growthAmount,
  growthFalloff
) {
  // for each polygon, recursively tesselate based on some sort of decision function
  // decisions function returns [0-1] which maps to 0 to max recursion
  let scaledMaxedDecisionFn = (poly, depth) => {
    return depth < decisionFn(poly) * maxDepth;
  };
  let growthFn = (depth) => {
    return growthAmount * Math.pow(growthFalloff, depth);
  };
  const tessFn = (poly) =>
    recursiveTess(poly, 0, tessFns, scaledMaxedDecisionFn, growthFn);
  return polys.flatMap(tessFn);
}

export { subdiv };

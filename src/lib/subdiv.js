import { polygon, tessellate, centroid, arcLength } from "@thi.ng/geom";

const makePoly = (points) => polygon(points);

function recursiveTess(poly, depth, tessFns, decisionFn) {
  if (decisionFn(poly, depth)) {
    // tess fn selected based on depth
    let idx = depth % tessFns.length;
    let polys = tessellate(poly, [tessFns[idx]]).map(makePoly);
    return polys.flatMap((poly) =>
      recursiveTess(poly, depth + 1, tessFns, decisionFn)
    );
  }
  return poly;
}

function subdiv(polys, tessFns, decisionFn, maxDepth) {
  // for each polygon, recursively tesselate based on some sort of decision function
  // decisions function returns [0-1] which maps to 0 to max recursion
  let scaledMaxedDecisionFn = (poly, depth) => {
    return depth < decisionFn(poly) * maxDepth;
  };
  const tessFn = (poly) =>
    recursiveTess(poly, 0, tessFns, scaledMaxedDecisionFn);
  return polys.flatMap(tessFn);
}

export { subdiv };

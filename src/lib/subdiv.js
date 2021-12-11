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

function subdiv(polys, tessFns, decisionFn) {
  // for each polygon, recursively tesselate based on some sort of decision function
  const tessFn = (poly) => recursiveTess(poly, 0, tessFns, decisionFn);
  return polys.flatMap(tessFn);
}

export { subdiv };

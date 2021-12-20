import * as v from "@thi.ng/vectors";

function normalFromPoly(poly) {
  const [a, b, c] = poly.points;

  // cb = c - b
  let cb = v.sub([], c, b);
  // ab = a - b
  let ab = v.sub([], a, b);
  // normal = cb X ab
  let norm = v.cross3([], cb, ab);

  return v.normalize([], norm);
}

export { normalFromPoly };

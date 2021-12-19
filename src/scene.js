import grids from "../snod/grids";
import { luminosity } from "../snod/color";
import { subdiv } from "./lib/subdiv";
import { transformThatFits, insetRect, rgbToHex } from "../snod/util";
import { centroid, polygon } from "@thi.ng/geom";
import { scale23, mulV } from "@thi.ng/matrices";
import * as THREE from "three";

function simpleDivider(poly) {
  return 0.5; // half depth
}

function update(state) {
  let { sampler, gridDensity, tessStack, maxDepth } = state;
  if (sampler == undefined) return;
  const { width, height } = sampler;

  // setup base grid geometry - working in size of image being sampled
  const baseGeo = grids.triangle(width, height, parseInt(gridDensity));

  // tessellate base geometry according to settings
  // split decision function returns a float 0-1 indicating relative
  // depth of tesselation (compared to max depth)
  let splitDecisionFn = (poly) => simpleDivider(poly);
  // colorDepthDivider(poly, state.sampler, state.invert);
  // let tessedPolys = subdiv(baseGeo, tessStack, splitDecisionFn, maxDepth);

  let tessedPolys = baseGeo;
  console.log(tessedPolys);

  // color polys
  const polyTintFn = (poly) => sampledPolyTint(poly, sampler);
  const polys = tessedPolys.map(polyTintFn);

  // Transform to GL normalized space [-1, 1]
  let trans = transformThatFits(
    [width, height],
    [0, 0, 1, 1]
    // insetRect([0, 0, width, height], 40) // cropped border
  );
  // mulV([], mat, pt)
  console.log(trans);

  // map thi.ng polys to three geom
  const vertices = new Float32Array(
    polys.flatMap((poly) => poly.points.flat())
  );
  // create vertex colors array
  const colors = new Float32Array(
    polys.flatMap((poly) => repeatArray(poly.attribs.color, poly.points.length))
  );

  // build mesh geometry and return
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.MeshBasicMaterial({
    vertexColors: THREE.VertexColors,
  });
  const mesh = new THREE.Mesh(geometry, material);
  const scene = new THREE.Scene();
  scene.add(mesh);
  return scene;
}

const repeatArray = (arr, times) => {
  return Array.from(
    {
      length: times,
    },
    () => arr
  ).flat();
};

function sampledPolyTint(poly, sampler) {
  let color = sampler
    .colorAt(centroid(poly))
    .map((c) => c / 255.0)
    .slice(0, 3);
  poly.attribs = {
    color,
  };
  return poly;
}

// function colorDepthDivider(poly, sampler, invert) {
//   let color = sampler.colorAt(centroid(poly));
//   let lumi = luminosity(color);
//   // shape luminosity so its more responsive on the low end: [0-1] -> [0-1]
//   if (invert) {
//     return 1.0 - Math.log10(lumi * 9 + 1);
//   }
//   return Math.log10(lumi * 9 + 1);
// }

export { update };

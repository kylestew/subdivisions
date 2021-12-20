import grids from "../snod/grids";
import { luminosity } from "../snod/color";
import { subdiv } from "./lib/subdiv";
import { normalFromPoly } from "./lib/normals";
import { rgbToHex } from "../snod/util";
import { centroid, polygon, tessellate } from "@thi.ng/geom";
import { triFan } from "@thi.ng/geom-tessellate";
import * as THREE from "three";

function simpleDivider(poly) {
  return 0.5; // half depth
}

function createMesh(state) {
  let {
    sampler,
    gridDensity,
    tessStack,
    maxDepth,
    growthAmount,
    growthFalloff,
  } = state;
  const { width, height } = sampler;

  // setup base grid geometry - working in size of image being sampled
  const baseGeo = grids.triangle(width, height, parseInt(gridDensity));
  // const baseGeo = [
  //   polygon([
  //     [width / 2, 0, 0],
  //     [width, height, 0],
  //     [0, height, 0],
  //   ]),
  // ];

  // tessellate base geometry according to settings
  // split decision function returns a float 0-1 indicating relative
  // depth of tesselation (compared to max depth)
  let splitDecisionFn = (poly) =>
    colorDepthDivider(poly, state.sampler, state.invert);
  // simpleDivider(poly);
  let tessedPolys = subdiv(
    baseGeo,
    tessStack,
    splitDecisionFn,
    maxDepth,
    growthAmount,
    growthFalloff
  );
  // console.log(tessedPolys);

  // color polys before ensuring they are all triangles
  const polyTintFn = (poly) => sampledPolyTint(poly, sampler);
  const polys = tessedPolys.map(polyTintFn);
  console.log("poly count:", polys.length);

  // tesselations can lead to non-triangular geometry, split into triangles
  const normalizedPolys = polys.flatMap((poly) => {
    if (poly.points.length > 3) {
      return tessellate(poly, [triFan]).map((pts) =>
        polygon(pts, poly.attribs)
      );
    }
    return poly;
  });
  console.log("normalize poly count:", normalizedPolys.length);

  // map thi.ng polys to three geom
  const vertices = new Float32Array(
    normalizedPolys.flatMap((poly) => poly.points.flat())
  );
  // create normals from triangles
  const normals = new Float32Array(
    normalizedPolys.flatMap((poly) => repeatArray(normalFromPoly(poly), 3))
  );
  // console.log(normals);
  // create vertex colors array
  const colors = new Float32Array(
    normalizedPolys.flatMap((poly) =>
      repeatArray(poly.attribs.color, poly.points.length)
    )
  );

  // build mesh geometry and return
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const material = new THREE.MeshPhongMaterial({
    color: 0xaaaaaa,
    specular: 0xffffff,
    shininess: 10,
    vertexColors: THREE.VertexColors,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(geometry, material);
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

function colorDepthDivider(poly, sampler, invert) {
  let color = sampler.colorAt(centroid(poly));
  let lumi = luminosity(color);
  // shape luminosity so its more responsive on the low end: [0-1] -> [0-1]
  if (invert) {
    return 1.0 - Math.log10(lumi * 9 + 1);
  }
  return Math.log10(lumi * 9 + 1);
}

export { createMesh };

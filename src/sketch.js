import grids from "../snod/grids";
import { luminosity } from "../snod/color";
import { repeatArray } from "../snod/util";
import { subdiv } from "./lib/subdiv";
import { normalFromPoly } from "./lib/normals";
import { centroid, polygon, tessellate } from "@thi.ng/geom";
import { triFan } from "@thi.ng/geom-tessellate";
import * as THREE from "three";

function createMesh(state, envMap) {
  let {
    sampler,
    gridDensity,
    tessStack,
    maxDepth,
    growthAmount,
    growthFalloff,
    brightness,
  } = state;
  const { width, height } = sampler;
  const largestSide = width > height ? width : height;

  /* === BASE GEOMETRY === */
  // setup base grid geometry
  // working in size of image being sampled
  const baseGeo = grids.triangle(width, height, parseInt(gridDensity));
  describeComplexity("baseGeo", baseGeo);

  /* === TESSELLATION STAGE === */
  // tessellate base geometry according to settings
  // split decision function returns a float 0-1 indicating relative
  // depth of tesselation (compared to max depth)
  let splitDecisionFn = (poly) =>
    colorDepthDivider(poly, state.sampler, state.invert);
  let tessedPolys = subdiv(
    baseGeo,
    tessStack,
    splitDecisionFn,
    maxDepth,
    growthAmount * largestSide,
    growthFalloff
  );
  describeComplexity("tessedPolys", tessedPolys);

  /* === COLORIZATION STAGE === */
  // color polys before ensuring they are all triangles
  const polyTintFn = (poly) => sampledPolyTint(poly, sampler);
  const coloredPolys = tessedPolys.map(polyTintFn);
  describeComplexity("coloredPolys", coloredPolys);

  /* === FINAL GEOMETRY === */
  const normalizedPolys = makeRenderable(coloredPolys);
  describeComplexity("normalizedPolys", normalizedPolys);
  let geometry = createGeometry(normalizedPolys);
  const material = new THREE.MeshStandardMaterial({
    vertexColors: THREE.VertexColors,
    side: THREE.DoubleSide,
    color: 0xfffffff,
    roughness: state.roughness,
    metalness: state.metalness,
    envMap,
    envMapIntensity: 0.5 * brightness,
    // wireframe: true,
  });
  return new THREE.Mesh(geometry, material);
}

function createGeometry(polys) {
  // map thi.ng polys to three geom
  const vertices = new Float32Array(
    polys.flatMap((poly) => poly.points.flat())
  );
  // create normals from triangles
  const normals = new Float32Array(
    polys.flatMap((poly) => repeatArray(normalFromPoly(poly), 3))
  );
  // create vertex colors array
  const colors = new Float32Array(
    polys.flatMap((poly) => repeatArray(poly.attribs.color, poly.points.length))
  );

  // build mesh geometry and return
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  return geometry;
}

function makeRenderable(polys) {
  // tesselations can lead to non-triangular geometry, split into triangles
  return polys.flatMap((poly) => {
    if (poly.points.length > 3) {
      return tessellate(poly, [triFan]).map((pts) =>
        polygon(pts, poly.attribs)
      );
    }
    return poly;
  });
}

function sampledPolyTint(poly, sampler) {
  let color = sampler
    .colorAt(centroid(poly))
    .slice(0, 3)
    .map((c) => c / 255.0);
  poly.attribs = {
    color,
  };
  return poly;
}

function simpleDivider(poly) {
  return 1.0; // full depth
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

function describeComplexity(stage, polys) {
  let length = polys.length;
  let renderable = polys.filter((poly) => poly.points.length != 3).length;
  console.log(
    stage,
    length,
    renderable == 0 ? "renderable" : "non-renderable"
    // polys
  );
}

export { createMesh };

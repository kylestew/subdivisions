import { transformThatFits, insetRect, componentToHex } from "../snod/util";
import grids from "../snod/grids";
import { luminosity } from "../snod/color";
import { subdiv } from "./lib/subdiv";
import { rgbToHex } from "../snod/util";
import { centroid, polygon } from "@thi.ng/geom";
import {
  WebGLRenderer,
  Scene,
  Vector3,
  PerspectiveCamera,
  LineBasicMaterial,
  BufferGeometry,
  Color,
  Line,
} from "three";

function colorDepthDivider(poly, sampler, invert) {
  let color = sampler.colorAt(centroid(poly));
  let lumi = luminosity(color);
  // shape luminosity so its more responsive on the low end: [0-1] -> [0-1]
  if (invert) {
    return 1.0 - Math.log10(lumi * 9 + 1);
  }
  return Math.log10(lumi * 9 + 1);
}

function sampledPolyTint(poly, sampler) {
  let color = sampler.colorAt(centroid(poly));
  poly.attribs = {
    fill: rgbToHex(color),
  };
  return poly;
}

function createTessedGeometry(width, height, state) {
  // setup base grid geometry
  let baseGeo = grids.triangle(width, height, parseInt(state.gridDensity));

  // tessellate
  let decisionFn = (poly) =>
    colorDepthDivider(poly, state.sampler, state.invert);
  let tessedPolys = subdiv(
    baseGeo,
    state.tessStack,
    decisionFn,
    state.maxDepth
  );

  // color polys
  const polyTintFn = (poly) => sampledPolyTint(poly, state.sampler);
  return tessedPolys.map(polyTintFn);
}

function render3D({ ctx, exporting, time, width, height, state }) {
  const renderer = new WebGLRenderer({ canvas: ctx.canvas });
  renderer.setSize(width, height);
  renderer.setClearColor(new Color(0x000000));

  const camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    500
  );
  camera.position.set(0, 0, 100);
  camera.lookAt(0, 0, 0);

  const scene = new Scene();

  const material = new LineBasicMaterial({ color: 0x0000ff });

  const points = [];
  points.push(new Vector3(-10, 0, 0));
  points.push(new Vector3(0, 10, 0));
  points.push(new Vector3(10, 0, 0));
  const geometry = new BufferGeometry().setFromPoints(points);

  const line = new Line(geometry, material);
  scene.add(line);

  renderer.render(scene, camera);

  // do the actual tesselation
  // const polys = createTessedGeometry(width, height, state);

  let poly = polygon([
    [0, 0, 0],
    [1, 1, 1],
    [1, 0, 1],
  ]);

  console.log(poly);
  // TODO: submit to 3D pipeline
}

function render2D({ ctx, exporting, time, width, height, state }) {
  const { sampler, enableFill, enableStroke } = state;
  if (sampler == undefined) return;

  if (!exporting) {
    // transform canvas to fit image
    let trans = transformThatFits(
      [sampler.width, sampler.height],
      insetRect([0, 0, width, height], 40) // cropped border
    );
    ctx.transform(...trans);
    // new canvas size
    width = sampler.width;
    height = sampler.height;
  }

  // clear frame
  // ctx.fillStyle = settings.clearColor || "white";
  // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // do the actual tesselation
  const polys = createTessedGeometry(width, height, state);

  const renderPoly = (poly) => {
    ctx.beginPath();
    const p0 = poly.points[0];
    ctx.moveTo(p0[0], p0[1]);
    poly.points.slice(1).map((p) => {
      ctx.lineTo(p[0], p[1]);
    });
    ctx.lineTo(p0[0], p0[1]);

    if (enableFill) {
      ctx.fillStyle = poly.attribs.fill;
      ctx.fill();
    }

    if (enableStroke) {
      ctx.strokeStyle = state.lineColor + componentToHex(state.lineOpacity);
      ctx.lineWidth = state.lineWidth;
      ctx.stroke();
    } else if (enableFill) {
      // stroke to fill in gaps in polys
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  };

  // clip to picture extends (grids will overflow)
  // clip extra to trim errors at edges
  ctx.beginPath();
  ctx.rect(2, 2, width - 4, height - 4);
  ctx.clip();

  // draw grid
  ctx.lineJoin = "round";
  polys.map(renderPoly);
}

export { render2D, render3D };

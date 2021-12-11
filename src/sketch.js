import { ImageSampler } from "../snod/sampler";
import { transformThatFits, insetRect } from "../snod/util";
import grids from "../snod/grids";
import { luminosity } from "../snod/color";
import { subdiv } from "./lib/subdiv";
import { rgbToHex } from "../snod/util";
import { centroid } from "@thi.ng/geom";
import {
  earCut2,
  rimTris,
  quadFan,
  triFan,
  edgeSplit,
} from "@thi.ng/geom-tessellate";

let sampler = new ImageSampler("./assets/tex03.jpg");

function colorDepthDivider(poly, depth, sampler) {
  let color = sampler.colorAt(centroid(poly));
  let lumi = luminosity(color);
  // console.log(color, lumi);

  return depth < lumi * 3;
  return false;
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
  let baseGeo = grids.diamond(width, height, parseInt(state.gridDensity));

  // tessellate
  let decisionFn = (poly, depth) => colorDepthDivider(poly, depth, sampler);
  let tessedPolys = subdiv(baseGeo, [triFan, edgeSplit], decisionFn);

  // color polys
  const polyTintFn = (poly) => sampledPolyTint(poly, sampler);
  return tessedPolys.map(polyTintFn);
}

function render({ ctx, time, width, height, state }) {
  // transform canvas to fit image
  let trans = transformThatFits(
    [sampler.width, sampler.height],
    insetRect([0, 0, width, height], 40) // cropped border
  );
  ctx.transform(...trans);
  // new canvas size
  width = sampler.width;
  height = sampler.height;

  // do the actual tesselation
  const polys = createTessedGeometry(width, height, state);

  const renderPoly = (poly) => {
    // console.log(poly);
    ctx.beginPath();
    const p0 = poly.points[0];
    ctx.moveTo(p0[0], p0[1]);
    poly.points.slice(1).map((p) => {
      ctx.lineTo(p[0], p[1]);
    });
    ctx.lineTo(p0[0], p0[1]);

    ctx.fillStyle = poly.attribs.fill;
    ctx.fill();

    if (state.enableStroke) {
      ctx.strokeStyle = state.lineColor;
      ctx.lineWidth = state.lineWidth;
      ctx.stroke();
    } else {
      // stroke to fill in gaps in polys
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  };

  // clip to picture extends (grids will overflow)
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.clip();

  // draw grid
  polys.map(renderPoly);

  // if stroke enabled, border canvas to clean up edges
  if (state.enableStroke) {
    ctx.strokeStyle = state.lineColor;
    ctx.lineWidth = state.lineWidth;
    ctx.beginPath();
    // inset rect by half stroke width since strokes
    // are drawn from center
    let [x, y, w, h] = insetRect([0, 0, width, height], state.lineWidth / 2);
    ctx.rect(x, y, w, h);
    ctx.stroke();
  }
}

export { render };

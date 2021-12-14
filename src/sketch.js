import { transformThatFits, insetRect, componentToHex } from "../snod/util";
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

function colorDepthDivider(poly, sampler) {
  let color = sampler.colorAt(centroid(poly));
  let lumi = luminosity(color);
  // shape luminosity so its more responsive on the low end: [0-1] -> [0-1]
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
  let baseGeo = grids.diamond(width, height, parseInt(state.gridDensity));

  // tessellate
  let decisionFn = (poly) => colorDepthDivider(poly, state.sampler);
  let tessedPolys = subdiv(
    baseGeo,
    [edgeSplit, triFan],
    decisionFn,
    state.maxDepth
  );

  // color polys
  const polyTintFn = (poly) => sampledPolyTint(poly, state.sampler);
  return tessedPolys.map(polyTintFn);
}

function render({ ctx, time, width, height, state }) {
  const { sampler, enableFill, enableStroke } = state;

  if (sampler == undefined) return;

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
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.clip();

  // draw grid
  polys.map(renderPoly);

  // if stroke enabled, border canvas to clean up edges
  if (enableStroke) {
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

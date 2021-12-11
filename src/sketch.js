import { ImageSampler } from "../snod/sampler";
import { transformThatFits, insetRect } from "../snod/util";
import grids from "../snod/grids";
import { subdiv } from "./lib/subdiv";

let sampler = new ImageSampler("./assets/tex03.jpg");

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

  // setup base grid geometry
  let baseGeo = grids.diamond(width, height, parseInt(state.gridDensity));

  // tessellate -> tint pipeline
  let tessedPolys = subdiv(baseGeo, sampler, {});
  // console.log(tessedPolys);

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
  tessedPolys.map(renderPoly);

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

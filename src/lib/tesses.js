import { rimTris, quadFan, triFan, edgeSplit } from "@thi.ng/geom-tessellate";

const tessOptions = {
  "Triangle Fan": triFan,
  "Quad Fan": quadFan,
  "Rim Triangles": rimTris,
  "Edge Split": edgeSplit,
};

function tessOptionToName(option) {
  const idx = Object.values(tessOptions).indexOf(option);
  return Object.keys(tessOptions)[idx];
}
function tessNameToOption(name) {
  const idx = Object.keys(tessOptions).indexOf(name);
  return Object.values(tessOptions)[idx];
}

function buildRandomTessStack() {
  return [triFan, triFan, triFan, triFan];
  // let fns = Object.values(tessOptions);
  // const getOne = () => fns[Math.floor(Math.random() * fns.length)];
  // return [getOne(), getOne(), getOne(), getOne()];
}

export {
  tessOptionToName,
  tessNameToOption,
  buildRandomTessStack,
  tessOptions,
};

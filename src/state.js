import { createStore } from "redux";
import { ImageSampler } from "../snod/sampler";
import { rimTris, quadFan, triFan, edgeSplit } from "@thi.ng/geom-tessellate";

// import tex02 from "/assets/tex00.jpg";
// import tex02 from "/assets/tex01.jpg";
// import tex02 from "/assets/tex02.jpg";
import tex03 from "/assets/tex03.jpg";
import tex04 from "/assets/tex04.jpg";
import tex05 from "/assets/tex05.jpg";
// import tex06 from "/assets/tex06.jpg";
import tex07 from "/assets/tex07.jpg";
import tex08 from "/assets/tex08.jpg";
import tex09 from "/assets/tex09.jpg";
const defaultImages = [tex03, tex04, tex05, tex07, tex08, tex09];

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
  let fns = Object.values(tessOptions);
  const getOne = () => fns[Math.floor(Math.random() * fns.length)];
  return [getOne(), getOne(), getOne(), getOne()];
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function getRandomBool() {
  return Boolean(Math.round(Math.random()));
}

function getRandomTrue(probability) {
  return Boolean(Math.random() < probability);
}

let willStroke = getRandomTrue(0.8);

const initState = {
  sampler: undefined,

  gridDensity: getRandomInt(6, 12),

  tessStack: buildRandomTessStack(),

  get tessLevel1() {
    return tessOptionToName(this.tessStack[0]);
  },
  set tessLevel1(dropped) {},
  get tessLevel2() {
    return tessOptionToName(this.tessStack[1]);
  },
  set tessLevel2(dropped) {},
  get tessLevel3() {
    return tessOptionToName(this.tessStack[2]);
  },
  set tessLevel3(dropped) {},
  get tessLevel4() {
    return tessOptionToName(this.tessStack[3]);
  },
  set tessLevel4(dropped) {},
  maxDepth: getRandomInt(2, 4),
  invert: getRandomBool(),

  enableFill: true,
  enableStroke: willStroke,
  lineWidth: 2.0,
  lineColor: willStroke ? "#000000" : "#ffffff",
  lineOpacity: willStroke ? 128 : 255,
};

const AppActions = {
  ReplaceSampler: "ReplaceSampler",
  SetTessLevel: "SetTessLevel",
  UpdateParam: "UpdateParam",
};

function appReducer(state = initState, action) {
  switch (action.type) {
    case AppActions.ReplaceSampler:
      return Object.assign({}, state, { sampler: action.payload });

    case AppActions.SetTessLevel:
      let { level, name } = action.payload;
      let tessFn = tessNameToOption(name);
      let tessStack = state.tessStack;
      tessStack[level] = tessFn;
      return Object.assign({}, state, { tessStack });

    case AppActions.UpdateParam:
      return Object.assign({}, state, action.payload);

    default:
      return state;
  }
}

function replaceSamplerFromUrl(url, store) {
  ImageSampler.CreateFromImageUrl(url, (sampler) => {
    store.dispatch({
      type: AppActions.ReplaceSampler,
      payload: sampler,
    });
  });
}

function createApp() {
  let store = createStore(appReducer);

  // select random image from set
  var url = defaultImages[Math.floor(Math.random() * defaultImages.length)];
  replaceSamplerFromUrl(url, store);

  return store;
}

export { AppActions, createApp, replaceSamplerFromUrl, tessOptions };

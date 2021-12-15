import { createStore } from "redux";
import { ImageSampler } from "../snod/sampler";
import { rimTris, quadFan, triFan, edgeSplit } from "@thi.ng/geom-tessellate";

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

const initState = {
  sampler: undefined,

  gridDensity: 8,

  tessStack: [edgeSplit, triFan, quadFan, triFan],

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
  maxDepth: 3,
  invert: true,

  enableFill: true,
  enableStroke: false,
  lineWidth: 2.0,
  lineColor: "#ffffff",
  lineOpacity: 255,
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

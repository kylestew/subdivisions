import { createStore } from "redux";
import { ImageSampler } from "../snod/sampler";

import tex02 from "/assets/tex02.jpg";
import tex03 from "/assets/tex03.jpg";
import tex04 from "/assets/tex04.jpg";
import tex05 from "/assets/tex05.jpg";
import tex06 from "/assets/tex06.jpg";
import tex07 from "/assets/tex07.jpg";
import tex08 from "/assets/tex08.jpg";
import tex09 from "/assets/tex09.jpg";
const defaultImages = [tex02, tex03, tex04, tex05, tex06, tex07, tex08, tex09];

const initState = {
  sampler: undefined,

  gridDensity: 9,

  maxDepth: 2,

  enableFill: true,
  enableStroke: false,
  lineWidth: 2.0,
  lineColor: "#FFFFFF",
  lineOpacity: 255,
};

const AppActions = {
  ReplaceSampler: "ReplaceSampler",
  UpdateParam: "UpdateParam",
};

function appReducer(state = initState, action) {
  switch (action.type) {
    case AppActions.ReplaceSampler:
      return Object.assign({}, state, { sampler: action.payload });
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

export { AppActions, createApp, replaceSamplerFromUrl };

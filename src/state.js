import { createStore } from "redux";
import { ImageSampler } from "../snod/sampler";

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

  // TODO: select from image set randomly
  let url = "./assets/tex02.jpg";
  replaceSamplerFromUrl(url, store);

  return store;
}

export { AppActions, createApp, replaceSamplerFromUrl };

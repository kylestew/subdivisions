import { createStore } from "redux";
import { ImageSampler } from "../snod/sampler";
import { randomImage } from "./lib/images";
import { random } from "canvas-sketch-util";
import {
  tessOptionToName,
  tessNameToOption,
  buildRandomTessStack,
} from "./lib/tesses";

function randomState() {
  let roughness = Math.random();
  let metalness = 1.0 - roughness;

  return {
    sampler: undefined,

    envMap: undefined,
    lut: undefined,

    // base grid
    gridDensity: random.rangeFloor(6, 13),

    // tess settings
    maxDepth: random.rangeFloor(2, 5),
    growthAmount: random.range(0.01, 0.02), // relative to largest side of canvas
    growthFalloff: random.range(0.3, 0.7),
    invert: random.boolean(),
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

    // style
    brightness: 1.0,
    roughness,
    metalness,

    // enableFill: true,
    // enableStroke: willStroke,
    // lineWidth: 2.0,
    // lineColor: willStroke ? "#000000" : "#ffffff",
    // lineOpacity: willStroke ? 128 : 255,
  };
}

const AppActions = {
  ReplaceSampler: "ReplaceSampler",
  SetTessLevel: "SetTessLevel",
  UpdateParam: "UpdateParam",
  RandomizeState: "RandomizeState",
};

function appReducer(state = randomState(), action) {
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
      console.log("update", action.payload);
      return Object.assign({}, state, action.payload);

    case AppActions.RandomizeState:
      return Object.assign(randomState(), {
        sampler: state.sampler,
        envMap: state.envMap,
      });

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
  replaceSamplerFromUrl(randomImage(), store);
  return store;
}

export { AppActions, createApp, replaceSamplerFromUrl };

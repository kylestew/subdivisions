import { createStore } from "redux";

const initState = {
  gridDensity: 12,

  maxDepth: 3,

  enableFill: false,
  enableStroke: true,
  lineWidth: 2.0,
  lineColor: "#FFFFFF",
  lineOpacity: 255,
};

const AppActions = {
  UpdateParam: "UpdateParam",
};

function appReducer(state = initState, action) {
  switch (action.type) {
    default:
      return state;
  }
}

function createApp() {
  return createStore(appReducer);
}

export { AppActions, createApp };

import { createStore } from "redux";

const initState = {
  gridDensity: 4,
  enableStroke: false,
  lineWidth: 9.0,
  lineColor: "#fff",
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

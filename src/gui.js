import * as dat from "dat.gui";
import { AppActions } from "./state";

function createGUI(app) {
  const state = app.getState();
  const gui = new dat.GUI();

  let dispatchUpdate = (payload) => {
    app.dispatch({
      type: AppActions.UpdateParam,
      payload: payload,
    });
  };

  var baseGridFolder = gui.addFolder("Base Grid");
  // baseGridFolder.open();

  baseGridFolder
    .add(state, "gridDensity")
    .name("Density")
    .min(2)
    .max(18)
    .step(1)
    .onChange((val) => dispatchUpdate({ gridDensity: val }));

  var tessFolder = gui.addFolder("Tessellation");
  tessFolder.open();

  tessFolder
    .add(state, "maxDepth")
    .name("Max Depth")
    .min(1)
    .max(5)
    .step(1)
    .onChange((val) => dispatchUpdate({ maxDepth: val }));

  let styleFolder = gui.addFolder("Style");
  styleFolder.open();

  styleFolder
    .add(state, "enableFill")
    .name("Fill Polygons")
    .onChange((val) => dispatchUpdate({ enableStroke: val }));

  styleFolder
    .add(state, "enableStroke")
    .name("Draw Lines")
    .onChange((val) => dispatchUpdate({ enableStroke: val }));

  styleFolder
    .add(state, "lineWidth")
    .name("Line Width")
    .min(0.1)
    .max(24.0)
    .step(0.1)
    .onChange((val) => dispatchUpdate({ lineWidth: val }));

  styleFolder
    .addColor(state, "lineColor")
    .onChange((val) => dispatchUpdate({ lineColor: val }));

  styleFolder
    .add(state, "lineOpacity")
    .name("Line Opacity")
    .min(0)
    .max(255)
    .step(1)
    .onChange((val) => dispatchUpdate({ lineOpacity: val }));
}

export { createGUI };

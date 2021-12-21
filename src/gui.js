import * as dat from "dat.gui";
import { AppActions, replaceSamplerFromUrl } from "./state";
import { tessOptions } from "./lib/tesses";

let imageSelector = {};

function createImageSelector(app) {
  const reader = new FileReader();
  const input = document.getElementById("imageInput");

  reader.onload = (e) => {
    replaceSamplerFromUrl(e.target.result, app);
  };

  input.addEventListener("change", (e) => {
    const f = e.target.files[0];
    reader.readAsDataURL(f);
  });

  return {
    reader,
    input,
  };
}

function createGUI(app) {
  const state = app.getState();
  const gui = new dat.GUI();
  gui.close();

  const dispatchUpdate = (payload) => {
    app.dispatch({
      type: AppActions.UpdateParam,
      payload: payload,
    });
  };
  const setTessLevel = (level, name) => {
    app.dispatch({
      type: AppActions.SetTessLevel,
      payload: { level: level, name: name },
    });
  };

  imageSelector = createImageSelector(app);

  var tessFolder = gui.addFolder("Tessellation");
  tessFolder.open();

  tessFolder
    .add(state, "gridDensity")
    .name("Density")
    .min(2)
    .max(18)
    .step(1)
    .onChange((val) => dispatchUpdate({ gridDensity: val }));

  tessFolder
    .add(state, "maxDepth", 1, 5, 1)
    .name("Max Recursion")
    .onChange((val) => dispatchUpdate({ maxDepth: val }));

  tessFolder
    .add(state, "growthAmount", 0, 0.05, 0.001)
    .name("Growth")
    .onChange((val) => dispatchUpdate({ growthAmount: val }));

  tessFolder
    .add(state, "growthFalloff", 0, 1.2, 0.01)
    .name("Falloff")
    .onChange((val) => dispatchUpdate({ growthFalloff: val }));

  tessFolder
    .add(state, "invert")
    .name("Invert")
    .onChange((val) => dispatchUpdate({ invert: val }));

  tessFolder
    .add(state, "tessLevel1", Object.keys(tessOptions))
    .name("Level 1")
    .onChange((val) => setTessLevel(0, val));
  tessFolder
    .add(state, "tessLevel2", Object.keys(tessOptions))
    .name("Level 2")
    .onChange((val) => setTessLevel(1, val));
  tessFolder
    .add(state, "tessLevel3", Object.keys(tessOptions))
    .name("Level 3")
    .onChange((val) => setTessLevel(2, val));
  tessFolder
    .add(state, "tessLevel4", Object.keys(tessOptions))
    .name("Level 4")
    .onChange((val) => setTessLevel(3, val));

  let styleFolder = gui.addFolder("Style");
  styleFolder.open();

  styleFolder
    .addColor(state, "backgroundColor")
    .name("Background Color")
    .onChange((val) => dispatchUpdate({ backgroundColor: val }));

  styleFolder
    .add(state, "showEnvironment")
    .name("Show World")
    .onChange((val) => dispatchUpdate({ showEnvironment: val }));

  styleFolder
    .add(state, "brightness", 0, 2, 0.01)
    .name("Brightness")
    .onChange((val) => dispatchUpdate({ brightness: val }));

  styleFolder
    .add(state, "roughness", 0, 1, 0.01)
    .name("Matte")
    .onChange((val) => dispatchUpdate({ roughness: val }));

  styleFolder
    .add(state, "metalness", 0, 1, 0.01)
    .name("Metalic")
    .onChange((val) => dispatchUpdate({ metalness: val }));
}

export { createGUI };

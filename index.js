import { createApp, AppActions, replaceSamplerFromUrl } from "./src/state";
import Renderer from "./src/render";
import { createGUI } from "./src/gui";

let app, canvasContainer, renderer;

init();

function init() {
  app = createApp();

  createGUI(app);

  canvasContainer = document.getElementById("canvas-container");
  renderer = new Renderer(canvasContainer);

  // watch for state updates
  app.subscribe(() => {
    renderer.update(app.getState());
  });

  // start loading EnvMap
  // new RGBELoader().load(hdr, function (texture) {
  //   texture.mapping = THREE.EquirectangularReflectionMapping;
  //   app.dispatch({
  //     type: AppActions.UpdateParam,
  //     payload: { envMap: texture },
  //   });
  // });

  // // start loading" LUT
  // new LUTCubeLoader().load(lut, function (result) {
  //   app.dispatch({
  //     type: AppActions.UpdateParam,
  //     payload: { lut: result },
  //   });
  // });

  renderer.animate();
}

window.onresize = function () {
  // camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
  // camera.updateProjectionMatrix();
  // renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
  // composer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
};

window.onkeydown = function (evt) {
  // if (evt.key == "s") {
  //   saveFrame();
  // } else if (evt.key == "i") {
  //   replaceSamplerFromUrl(randomImage(), app);
  // } else if (evt.key == "r" && evt.metaKey == false) {
  //   app.dispatch({
  //     type: AppActions.RandomizeState,
  //     payload: {},
  //   });
  // } else if (evt.key == "z") {
  //   controls.reset();
  // }
};

// function download(dataURL, name) {
//   const link = document.createElement("a");
//   link.href = dataURL;
//   link.download = name;
//   link.click();
// }

// function saveFrame() {
//   let canvas = document.getElementById("canvas");
//   var dataURL = canvas.toDataURL("image/png");
//   download(dataURL, "image");
// }

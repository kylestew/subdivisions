import { createApp, AppActions } from "./src/state";
import { createGUI } from "./src/gui";
import { update } from "./src/scene";
import { WebGLRenderer, PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function init() {
  const app = createApp();
  createGUI(app);

  let canvas = document.getElementById("canvas");
  const renderer = new WebGLRenderer({ canvas });
  // TODO: does this need to adapt to screen size changes?
  // renderer.setSize(width, height);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const controls = new OrbitControls(camera, renderer.domElement);
  camera.position.set(0, 0, 10);
  controls.update();

  let scene = update(app.getState());
  app.subscribe(() => {
    scene = update(app.getState());
  });
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    if (scene) {
      renderer.render(scene, camera);
    }
  }
  animate();
}

window.onload = function () {
  init();
};

// window.onresize = function () {
//   _render();
// };

// window.onkeydown = function (evt) {
//   if (evt.key == "s") {
//     saveFrame();
//   } else if (evt.key == "r") {
//     app.dispatch({
//       type: AppActions.RandomizeState,
//       payload: {},
//     });
//   }
// };

// function download(dataURL, name) {
//   const link = document.createElement("a");
//   link.href = dataURL;
//   link.download = name;
//   link.click();
// }

// function saveFrame() {
//   var canvas = document.createElement("canvas");
//   var context = canvas.getContext("2d");
//   let { width, height } = app.getState().sampler;
//   canvas.width = width;
//   canvas.height = height;
//   render({
//     ctx: context,
//     exporting: true,
//     time: 0,
//     width,
//     height,
//     state: app.getState(),
//   });
//   var dataURL = context.canvas.toDataURL("image/png");
//   download(dataURL, "image");
// }

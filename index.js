import * as Stats from "stats.js";
import { createApp, AppActions } from "./src/state";
import { createGUI } from "./src/gui";
import { createMesh } from "./src/sketch";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let app, renderer, camera;

init();

function init() {
  app = createApp();
  createGUI(app);

  let stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  // let canvas = document.getElementById("canvas");
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const controls = new OrbitControls(camera, renderer.domElement);
  // TODO: select optimal zoom level somehow
  camera.position.set(0, 0, 3.0);
  controls.minDistance = 1;
  controls.maxDistance = 10;
  controls.update();

  // when values change - rebuild scene
  let scene = _update();
  let light;
  function _update() {
    let state = app.getState();

    // update needs a valid sampler to work
    let { sampler } = state;
    if (sampler == undefined) return;
    let { width, height } = sampler;

    // create scene
    let mesh = createMesh(state);
    const scene = new THREE.Scene();
    scene.add(mesh);

    // apply scale and offset needed to center canvas
    let scale, xSize, ySize;
    if (width >= height) {
      scale = 2.0 / width;
      xSize = 1.0;
      ySize = (height * scale) / 2;
    } else {
      scale = 2.0 / height;
      xSize = (width * scale) / 2;
      ySize = 1.0;
    }
    scene.scale.set(scale, -scale, scale);
    scene.translateX(-xSize);
    scene.translateY(ySize);

    // clip to canvas size of [-1, 1] in x, y axis
    renderer.clippingPlanes = [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), xSize),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), xSize),
      new THREE.Plane(new THREE.Vector3(0, 1, 0), ySize),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), ySize),
    ];

    // add lighting
    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(-10, 0, 1.0);
    light.target = mesh;
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    return scene;
  }
  app.subscribe(() => {
    scene = _update();
  });

  // render loop
  var angle = 0;
  function animate() {
    stats.begin();
    controls.update();
    if (scene) {
      angle -= 0.01;
      light.position.x = 8 * Math.sin(angle);
      light.position.y = 8 * Math.cos(angle);

      renderer.render(scene, camera);
    }
    stats.end();
    requestAnimationFrame(animate);
  }
  animate();
}

window.onresize = function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

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

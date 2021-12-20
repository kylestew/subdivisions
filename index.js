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
  let updateLightPositions;
  function _update() {
    let state = app.getState();

    // update needs a valid sampler to work
    let { sampler } = state;
    if (sampler == undefined) return;
    let { width, height } = sampler;

    // create scene
    const mesh = createMesh(state);
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
    mesh.scale.set(scale, -scale, scale);
    mesh.translateX(-xSize);
    mesh.translateY(ySize);

    // clip to canvas size of [-1, 1] in x, y axis
    renderer.clippingPlanes = [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), xSize),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), xSize),
      new THREE.Plane(new THREE.Vector3(0, 1, 0), ySize),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), ySize),
    ];

    // add lighting
    let light0 = new THREE.DirectionalLight(0xffffff, 2.0);
    scene.add(light0);
    let light1 = new THREE.DirectionalLight(0xffffff, 0.8);
    scene.add(light1);

    // const helper1 = new THREE.DirectionalLightHelper(light0, 0.2);
    // scene.add(helper1);
    // const helper2 = new THREE.DirectionalLightHelper(light1, 0.2);
    // scene.add(helper2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.333);
    scene.add(ambientLight);

    updateLightPositions = (time) => {
      let angle = time / 2048.0;
      light0.position.set(
        2 * Math.cos(angle),
        2 * Math.sin(angle),
        0.2 + 0.2 * Math.sin(angle * 0.333)
      );

      light1.position.set(
        2 * Math.sin(angle),
        2 * Math.cos(angle),
        0.5 + 0.3 * Math.cos(angle * 0.333)
      );

      // helper1.update();
      // helper2.update();
    };

    return scene;
  }
  app.subscribe(() => {
    scene = _update();
  });

  // render loop
  function animate(time) {
    stats.begin();
    controls.update();
    if (scene) {
      updateLightPositions(time);
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

window.onkeydown = function (evt) {
  if (evt.key == "s") {
    //     saveFrame();
  } else if (evt.key == "r") {
    app.dispatch({
      type: AppActions.RandomizeState,
      payload: {},
    });
  }
};

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

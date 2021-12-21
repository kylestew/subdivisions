import * as Stats from "stats.js";
import { createApp, AppActions, replaceSamplerFromUrl } from "./src/state";
import { createGUI } from "./src/gui";
import { createMesh } from "./src/sketch";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { randomImage } from "./src/lib/images";

let app, stats, canvasContainer, renderer, camera, controls;

init();

function init() {
  app = createApp();
  createGUI(app);
  stats = new Stats();

  canvasContainer = document.getElementById("canvas-container");
  let canvas = document.getElementById("canvas");
  renderer = new THREE.WebGLRenderer({
    canvas,
    preserveDrawingBuffer: true,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // start loading EnvMap
  new RGBELoader()
    .setPath("assets/")
    .load("venice_sunset_1k.hdr", function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      app.dispatch({
        type: AppActions.UpdateParam,
        payload: { envMap: texture },
      });
    });

  // camera
  camera = new THREE.PerspectiveCamera(
    35,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 0.5;
  controls.maxDistance = 10;
  function setCameraPositionForImageSize(size) {
    // TODO: if width is too great, scale height size until its not?
    let cropFactor = 1.2;
    let fov = camera.fov * (Math.PI / 180);
    let z = (size[1] * cropFactor) / Math.tan(fov / 2);
    camera.position.set(0, 0, z);
    controls.update();
    controls.saveState();
  }

  // when values change - rebuild scene
  let scene = _update();
  let imageSize = [-1, -1];
  let updateLightPositions;
  function _update() {
    let state = app.getState();

    // update needs a valid sampler to work
    let { sampler, brightness } = state;
    if (sampler == undefined) return;
    let { width, height } = sampler;

    // create scene
    const mesh = createMesh(state);
    const scene = new THREE.Scene();
    if (state.envMap != undefined) {
      scene.background = state.envMap;
      scene.environment = state.envMap;
    }
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

    if (imageSize != [xSize, ySize]) {
      setCameraPositionForImageSize([xSize, ySize]);
    }

    // clip to canvas size of [-1, 1] in x, y axis
    renderer.clippingPlanes = [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), xSize),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), xSize),
      new THREE.Plane(new THREE.Vector3(0, 1, 0), ySize),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), ySize),
    ];

    // add lighting
    let light0 = new THREE.DirectionalLight(0xffffff, 2.4);
    scene.add(light0);
    let light1 = new THREE.DirectionalLight(0xffffff, 0.8);
    scene.add(light1);

    // const helper1 = new THREE.DirectionalLightHelper(light0, 0.2);
    // scene.add(helper1);
    // const helper2 = new THREE.DirectionalLightHelper(light1, 0.2);
    // scene.add(helper2);

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
        0.5 + 0.3 * Math.cos(angle * 0.222)
      );

      light0.intensity = 2.4 * brightness;
      light1.intensity = 0.8 * brightness;

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
  camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
};

window.onkeydown = function (evt) {
  if (evt.key == "s") {
    saveFrame();
  } else if (evt.key == "i") {
    replaceSamplerFromUrl(randomImage(), app);
  } else if (evt.key == "r" && evt.metaKey == false) {
    app.dispatch({
      type: AppActions.RandomizeState,
      payload: {},
    });
  } else if (evt.key == "z") {
    controls.reset();
  } else if (evt.key == "f") {
    document.body.appendChild(stats.dom);
    stats.showPanel(0);
  }
};

function download(dataURL, name) {
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = name;
  link.click();
}

function saveFrame() {
  let canvas = document.getElementById("canvas");
  var dataURL = canvas.toDataURL("image/png");
  download(dataURL, "image");
}

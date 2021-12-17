import { createApp, AppActions } from "./src/state";
import { createGUI } from "./src/gui";
import { render2D, render3D } from "./src/sketch";

let app;

function download(dataURL, name) {
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = name;
  link.click();
}

function render() {
  const state = app.getState();

  let canvas = document.getElementById("canvas");
  let ctx = canvas.getContext(state.is3D ? "webgl" : "2d");

  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  const params = {
    ctx,
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    state,
  };

  if (state.is3D) {
    render3D(params);
  } else {
    render2D(params);
  }
}

function saveFrame() {
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
}

function init() {
  app = createApp();

  createGUI(app);

  app.subscribe(render);
  render();
}

window.onload = function () {
  init();
};

window.onresize = function () {
  render();
};

window.onkeydown = function (evt) {
  if (evt.key == "s") {
    saveFrame();
  } else if (evt.key == "r") {
    app.dispatch({
      type: AppActions.RandomizeState,
      payload: {},
    });
  }
};

import * as Engine from './engine.js';

export const keys = new Set();
export let mxView = 0;
export let myView = 0;
export let hasMouse = false;

window.addEventListener("keydown", (e) => keys.add(e.code));
window.addEventListener("keyup", (e) => keys.delete(e.code));

Engine.viewport.addEventListener("pointermove", (e) => {
  const r = Engine.viewport.getBoundingClientRect();
  mxView = e.clientX - r.left;
  myView = e.clientY - r.top;
  hasMouse = true;

  const px = (Engine.player.x - Engine.camX) + (Engine.player.w / 2);
  const py = (Engine.player.y - Engine.camY) + (Engine.player.h / 2);

  Engine.setFaceRad(Math.atan2(myView - py, mxView - px));
});

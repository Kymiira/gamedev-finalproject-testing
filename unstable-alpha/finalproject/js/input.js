import { viewport, setFaceRad, player, camX, camY } from './engine.js';


export const keys = new Set();
export let mxView = 0;
export let myView = 0;
export let hasMouse = false;

window.addEventListener("keydown", (e) => keys.add(e.code));
window.addEventListener("keyup", (e) => keys.delete(e.code));

viewport.addEventListener("pointermove", (e) => {
  const r = viewport.getBoundingClientRect();
  mxView = e.clientX - r.left;
  myView = e.clientY - r.top;
  hasMouse = true;

  const px = (player.x - camX) + (player.w / 2);
  const py = (player.y - camY) + (player.h / 2);

  setFaceRad(Math.atan2(myView - py, mxView - px));
});

import { viewport, setFaceRad } from './engine.js';

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
    
    // Calculate aiming angle
    const vx = viewport.clientWidth / 2;
    const vy = viewport.clientHeight / 2;
    setFaceRad(Math.atan2(myView - vy, mxView - vx));
});
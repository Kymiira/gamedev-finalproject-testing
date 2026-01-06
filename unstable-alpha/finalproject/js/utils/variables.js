export const viewport = document.getElementById("viewport");
export const world = document.getElementById("world");
export const playerEl = document.getElementById("player");
export const BulletEl = document.getElementById("bullet");
export const hudMX = document.getElementById("mouseX");
export const hudMY = document.getElementById("mouseY");

export let mxView = 0;
export let myView = 0;
export let faceRad = 0;
export let hasMouse = false;

export const WORLD_W = 3000;
export const WORLD_H = 3000;

export const keys = new Set();
window.addEventListener("keydown", (e) => keys.add(e.code));
window.addEventListener("keyup", (e) => keys.delete(e.code));

export const camera = { x: 0, y: 0 };

export const bullets = []
export const bullet_speed = 900;
export const bullet_ttl = 1.2;
export const fire_cooldown = 0.12;

export let fireCd = 0;

export let last = 0;
// engine.js
import { clamp } from './utils.js';
import { getRandomMath } from './utils.js';

// DOM Elements
export const viewport = document.getElementById("viewport");
export const world = document.getElementById("world");
export const playerEl = document.getElementById("player");
const bulletTemplate = document.getElementById("bullet");

// Game Constants
export const WORLD_W = 3000;
export const WORLD_H = 3000;
const bullet_speed = 900;
const bullet_ttl = 1.2;

// State
export const player = { x: 1500, y: 1500, w: 32, h: 32, speed: 280 };
export const bullets = [];
export const hostiles = [];
let spawnTimer = 0;
const SPAWN_RATE = 2;
export let camX = 0;
export let camY = 0;
export function setCamera(x, y) { camX = x; camY = y; }
export let faceRad = 0;
export let fireCd = 0;
export const fire_cooldown = 0.12;

// Logic: Bullets
export function spawnBullet() {
    const x = player.x + player.w / 2;
    const y = player.y + player.h / 2;
    const vx = Math.cos(faceRad) * bullet_speed;
    const vy = Math.sin(faceRad) * bullet_speed;

    const el = bulletTemplate ? bulletTemplate.cloneNode(true) : document.createElement("div");
    el.style.position = "absolute";
    el.style.display = "block";
    if (!bulletTemplate) {
        el.className = "bullet";
        el.style.width = "6px"; el.style.height = "6px";
        el.style.background = "#fff"; el.style.borderRadius = "50%";
    }
    world.appendChild(el);

    bullets.push({ x, y, vx, vy, life: bullet_ttl, el, w: 6, h: 6 });
}

export function updateBullets(dt) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;

        if (b.life <= 0 || b.x < 0 || b.y < 0 || b.x > WORLD_W || b.y > WORLD_H) {
            b.el.remove();
            bullets.splice(i, 1);
            continue;
        }
        b.el.style.left = `${b.x - b.w / 2}px`;
        b.el.style.top = `${b.y - b.h / 2}px`;
    }
}


export function setFaceRad(val) { faceRad = val; }
export function tickFireCd(dt) { fireCd = Math.max(0, fireCd - dt); }
export function resetFireCd() { fireCd = fire_cooldown; }

// Logic: Hostiles
export function updateHostiles(dt) {
    spawnTimer += dt;

    if (spawnTimer >= SPAWN_RATE) {
        spawnHostile();
        spawnTimer = 0;
    }
    // add move logic here
}
export function spawnHostile() {
    const x = getRandomMath(WORLD_W) - 32;
    const y = getRandomMath(WORLD_H - 32);

    const el = document.createElement("div");
    el.classList.add("hostile")
    el.style.position = "absolute";
    el.style.width = "32px";
    el.style.height = "32px";
    el.style.background = "#e90909";
    el.style.borderRadius = "6px";
    el.style.zIndex = "5";


    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    
    world.appendChild(el);

    hostiles.push({x, y, el });
    console.log(`hostile @ ${x}, ${y}`)
}
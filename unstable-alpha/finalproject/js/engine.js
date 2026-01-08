// engine.js
import { clamp } from './utils.js';
import { getRandomMath } from './utils.js';
import { normalize } from './utils.js';

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
export const player = { x: 1500, y: 1500, w: 32, h: 32, speed: 280, health: 100 };
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
const healthBar  = document.getElementById('healthBar');
const MAX_HEALTH = 100;

// Healthbar
export function updatePlayerHealth(amount) {
    player.health = Math.min(MAX_HEALTH, Math.max(0, player.health + amount));
    const healthPercentage = (player.health / MAX_HEALTH) * 100;
    console.log('healthPercentage') // debug

    if (healthBar) {
        healthBar.style.width = `${healthPercentage}%`;

        healthBar.style.background = "#00ff00"; // Green

        if (healthPercentage < 30) {
            healthBar.style.background = "#ff0000"; // Red
        } else if (healthPercentage < 60) {
            healthBar.style.background = "#ffff00"; // Yellow
        }
    }
}

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

    for (let i = 0; i < hostiles.length; i++) {
        const h = hostiles[i];

        const dx = player.x - h.x;
        const dy = player.y - h.y;

        const dir = normalize(dx, dy);

        const enemySpeed = 150
        h.x += dir.x * enemySpeed * dt;
        h.y += dir.y * enemySpeed * dt;

        h.el.style.left = `${h.x}px`;
        h.el.style.top = `${h.y}px`;
    }
}

export function spawnHostile() {
    const x = getRandomMath(WORLD_W - 32);
    const y = getRandomMath(WORLD_H - 32);
    let health = 5

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

    hostiles.push({x, y, el, health });
    console.log(`hostile @ ${x}, ${y}`)
}

// Logic: Collisions
let playerInvincibility = 0; 

export function checkCollisions(dt) {
    if (playerInvincibility > 0) playerInvincibility -= dt;

    for (let j = hostiles.length - 1; j >= 0; j--) {
        const h = hostiles[j];

// --- SECTION A: PLAYER VS HOSTILE ---
if (playerInvincibility <= 0) {
    if (
        player.x < h.x + 32 &&
        player.x + player.w > h.x &&
        player.y < h.y + 32 &&
        player.y + player.h > h.y
    ) {
        playerInvincibility = 0.5; 
        
        updatePlayerHealth(-10); 
        
        playerEl.style.filter = "brightness(3)";
        setTimeout(() => playerEl.style.filter = "none", 100);
        
        if (player.health <= 0) {
            alert("Game Over!");
            window.location.reload();
        }
    }
}

        // --- SECTION B: BULLETS VS THIS HOSTILE ---
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];

            if (
                b.x < h.x + 32 &&
                b.x + b.w > h.x &&
                b.y < h.y + 32 &&
                b.y + b.h > h.y
            ) {
                h.health -= 1;
                h.el.style.backgroundColor = "white";
                setTimeout(() => {
                    if (h.el) h.el.style.backgroundColor = "#e90909";
                }, 50);
                b.el.remove();
                bullets.splice(i, 1);

                if (h.health <= 0) {
                    h.el.remove();
                    hostiles.splice(j, 1);
                    updateScore(100);
                }
                
                break; 
            }
        }
    }
}

// Score
export let score = 0;
const hudScore = document.getElementById('hudScore');

export function updateScore(amount) {
    score += amount;

    if (hudScore) {
        hudScore.innerText = `Score: ${score}`;
    }
}
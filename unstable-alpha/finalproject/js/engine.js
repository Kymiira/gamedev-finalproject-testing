// engine.js
import { clamp } from './utils.js';
import { getRandomMath } from './utils.js';
import { normalize } from './utils.js';

// DOM Elements
export const viewport = document.getElementById("viewport");
export const world = document.getElementById("world");
export const playerEl = document.getElementById("player");
export const bulletTemplate = document.getElementById("bullet");
export const statusMessage = document.getElementById("statusMessage");
export const teleporterEl = document.getElementById("teleporter");

// Game Constants
export const WORLD_W = 3000;
export const WORLD_H = 3000;
export const bullet_speed = 900;
export const bullet_ttl = 1.2;

// State
export const player = { x: 1500, y: 1500, w: 32, h: 32, speed: 280, health: 100 };
export const bullets = [];
export const hostiles = [];
export let spawnTimer = 0;
export const SPAWN_RATE = 2;
export let camX = 0;
export let camY = 0;
export function setCamera(x, y) { camX = x; camY = y; }
export let faceRad = 0;
export let fireCd = 0;
export const fire_cooldown = 0.12;
export const healthBar  = document.getElementById('healthBar');
export const MAX_HEALTH = 100;
export let hostileSpawning = true;
export const teleporter = { x: 1500, y: 1500, w: 32, h: 32, active: false };

// Healthbar
export function updatePlayerHealth(amount) {
    player.health = Math.min(MAX_HEALTH, Math.max(0, player.health + amount));
    const healthPercentage = (player.health / MAX_HEALTH) * 100;

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
  while (spawnTimer >= SPAWN_RATE && hostileSpawning === true) {
    spawnHostile();
    spawnTimer -= SPAWN_RATE;
  }

  for (let i = 0; i < hostiles.length; i++) {
    const h = hostiles[i];
    const dir = normalize(player.x - h.x, player.y - h.y);
    const enemySpeed = 150;
    h.x += dir.x * enemySpeed * dt;
    h.y += dir.y * enemySpeed * dt;
    h.el.style.left = `${h.x}px`;
    h.el.style.top = `${h.y}px`;
  }
}

export function spawnHostile() {
  const ENEMY_SIZE = 32;

  const MIN_R = 250;
  const MAX_R = 650;

  const t = Math.random();
  const r = Math.sqrt((MIN_R * MIN_R) + t * (MAX_R * MAX_R - MIN_R * MIN_R));
  const a = Math.random() * Math.PI * 2;

  let x = player.x + Math.cos(a) * r;
  let y = player.y + Math.sin(a) * r;

  x = clamp(x, 0, WORLD_W - ENEMY_SIZE);
  y = clamp(y, 0, WORLD_H - ENEMY_SIZE);

  const el = document.createElement("div");
  el.classList.add("hostile");
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  world.appendChild(el);

  hostiles.push({ x, y, el, health: 10 });
}

// Logic: Collisions
export let playerInvincibility = 0; 

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
export const hudScore = document.getElementById('hudScore');

export function updateScore(amount) {
    if (score < 10) {
        score += amount;

        if (hudScore) {
            hudScore.innerText = `Score: ${score}`;
        }  
    } else {
        hostileSpawning = false;
        teleporter.active = true;
        teleporterEl.style.left = teleporter.x + 'px';
        teleporterEl.style.top = teleporter.y + 'px';
        statusMessage.innerText = 'Get to the teleporter at the center of the map!'
    }
}


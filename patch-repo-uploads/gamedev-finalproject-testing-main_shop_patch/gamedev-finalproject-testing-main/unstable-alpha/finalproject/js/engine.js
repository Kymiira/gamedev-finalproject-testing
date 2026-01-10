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

// Game Constants
export const WORLD_W = 3000;
export const WORLD_H = 3000;
export let bullet_speed = 900;
export const bullet_ttl = 1.2;

// Combat tuning (upgradable)
export let bullet_damage = 1;
export let bullet_pierce = 0; // number of extra enemies a bullet can pass through
export let multishot = 1;     // number of bullets per shot


// State
export const player = { x: 1500, y: 1500, w: 32, h: 32, speed: 280, health: 100, maxHealth: 100 };
export const bullets = [];
export const hostiles = [];
export let spawnTimer = 0;
export const SPAWN_RATE = 2;
export let camX = 0;
export let camY = 0;
export function setCamera(x, y) { camX = x; camY = y; }
export let faceRad = 0;
export let fireCd = 0;
export let fire_cooldown = 0.12;
export const healthBar  = document.getElementById('healthBar');
export const MAX_HEALTH = 100; // legacy default; use player.maxHealth for runtime
export let hostileSpawning = true;
export let hostileHealth = 10;
export let hostileDmg = -10;
export function setHostileSpawning(val) {
  hostileSpawning = !!val;
}

// Healthbar
export function updatePlayerHealth(amount) {
    player.health = Math.min(player.maxHealth, Math.max(0, player.health + amount));
    const healthPercentage = (player.health / player.maxHealth) * 100;

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

    const SPREAD = 0.14; // radians, total spread scales with multishot
    const shots = Math.max(1, Math.floor(multishot));

    for (let s = 0; s < shots; s++) {
        const t = shots === 1 ? 0 : (s / (shots - 1)) * 2 - 1; // -1..1
        const ang = faceRad + t * SPREAD;

        const vx = Math.cos(ang) * bullet_speed;
        const vy = Math.sin(ang) * bullet_speed;

        const el = bulletTemplate ? bulletTemplate.cloneNode(true) : document.createElement("div");
        // Avoid duplicate ids if a template is ever introduced later
        if (el.id) el.removeAttribute("id");

        el.style.position = "absolute";
        el.style.display = "block";
        if (!bulletTemplate) {
            el.className = "bullet";
            el.style.width = "6px"; el.style.height = "6px";
            el.style.background = "#fff"; el.style.borderRadius = "50%";
        }
        world.appendChild(el);

        bullets.push({ x, y, vx, vy, life: bullet_ttl, el, w: 6, h: 6, pierce: bullet_pierce });
    }
}

export function updateBullets(dt) {(dt) {
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

  hostiles.push({ x, y, el, health: hostileHealth });
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
                
                updatePlayerHealth(hostileDmg); 
                h.health -= bullet_damage; // contact damage to both sides
                
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
                h.health -= bullet_damage;
                h.el.style.backgroundColor = "white";
                setTimeout(() => {
                    if (h.el) h.el.style.backgroundColor = "#e90909";
                }, 50);
                if (b.pierce > 0) {
                    b.pierce -= 1;
                } else {
                    b.el.remove();
                    bullets.splice(i, 1);
                }

                if (h.health <= 0) {
                    h.el.remove();
                    hostiles.splice(j, 1);
                    updateCoins(1 + (Math.random() < 0.15 ? 1 : 0));
                }
                
                break; 
            }
        }
    }
}

// Coins
export let coins = 0;
export const hudCoins = document.getElementById('hudCoins');

export function updateCoins(amount) {
    coins = Math.max(0, Math.floor(coins + amount));
    if (hudCoins) {
        hudCoins.innerText = `Coins: ${coins}`;
    }  
}

// Shop upgrades (L02)
export const SHOP_UPGRADES = [
  { id: "rapid_fire", name: "Rapid Fire", desc: "Fire cooldown -12% (min 0.05s)", cost: 10 },
  { id: "damage_up", name: "Damage Up", desc: "+1 bullet damage", cost: 12 },
  { id: "bullet_speed", name: "Hot Rounds", desc: "Bullet speed +12%", cost: 8 },
  { id: "move_speed", name: "Light Boots", desc: "Move speed +10%", cost: 10 },
  { id: "max_health", name: "Vitality", desc: "+20 max health and heal +20", cost: 14 },
  { id: "heal", name: "Medkit", desc: "Heal +30", cost: 6 },
  { id: "multishot", name: "Twin Shot", desc: "+1 projectile per shot (max 3)", cost: 18 },
  { id: "piercing", name: "Piercing", desc: "Bullets pierce +1 (max 3)", cost: 16 }
];

export function applyUpgrade(id) {
  switch (id) {
    case "rapid_fire":
      fire_cooldown = Math.max(0.05, fire_cooldown * 0.88);
      return "Rapid Fire";
    case "damage_up":
      bullet_damage += 1;
      return "Damage Up";
    case "bullet_speed":
      bullet_speed = Math.min(2200, bullet_speed * 1.12);
      return "Hot Rounds";
    case "move_speed":
      player.speed = Math.min(650, player.speed * 1.10);
      return "Light Boots";
    case "max_health":
      player.maxHealth += 20;
      updatePlayerHealth(+20);
      return "Vitality";
    case "heal":
      updatePlayerHealth(+30);
      return "Medkit";
    case "multishot":
      multishot = Math.min(3, multishot + 1);
      return "Twin Shot";
    case "piercing":
      bullet_pierce = Math.min(3, bullet_pierce + 1);
      return "Piercing";
    default:
      return "Unknown";
  }
}

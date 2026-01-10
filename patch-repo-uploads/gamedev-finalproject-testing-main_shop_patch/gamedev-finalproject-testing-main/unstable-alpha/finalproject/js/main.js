// main.js
import { normalize, clamp } from './utils.js';
import * as Engine from './engine.js';
import { keys, hasMouse, myView, mxView } from './input.js';

let last = 0;
const hudPX = document.getElementById('hudPlayerX');
const hudPY = document.getElementById('hudPlayerY');
const hudMX = document.getElementById('hudMouseX');
const hudMY = document.getElementById('hudMouseY');

const shopOverlay = document.getElementById('shopOverlay');
const shopItemsEl = document.getElementById('shopItems');

let shopOpen = false;
let shopOffers = [];

const DEFAULT_STATUS = "Earn coins by killing hostiles. Press E to open shop.";
let statusTtl = 0;

function setStatus(text, ttlSeconds = 0) {
  if (!Engine.statusMessage) return;
  Engine.statusMessage.innerText = text;
  statusTtl = Math.max(0, ttlSeconds);
}

function rollShopOffers() {
  const pool = Engine.SHOP_UPGRADES.slice();
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  shopOffers = pool.slice(0, 3);
}

function renderShop() {
  if (!shopItemsEl) return;
  shopItemsEl.innerHTML = '';

  for (const offer of shopOffers) {
    const row = document.createElement('div');
    row.className = 'shopItem';

    const meta = document.createElement('div');
    meta.className = 'meta';

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = offer.name;

    const desc = document.createElement('div');
    desc.className = 'desc';
    desc.textContent = offer.desc;

    meta.appendChild(name);
    meta.appendChild(desc);

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.alignItems = 'center';
    right.style.gap = '10px';

    const cost = document.createElement('div');
    cost.className = 'cost';
    cost.textContent = `Cost: ${offer.cost}`;

    const btn = document.createElement('button');
    const affordable = Engine.coins >= offer.cost;
    btn.textContent = affordable ? 'Buy' : 'Not enough';
    btn.disabled = !affordable;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      attemptPurchase(offer);
    });

    right.appendChild(cost);
    right.appendChild(btn);

    row.appendChild(meta);
    row.appendChild(right);

    shopItemsEl.appendChild(row);
  }
}

function openShop() {
  if (!shopOverlay) return;
  shopOpen = true;
  rollShopOffers();
  renderShop();
  shopOverlay.classList.add('open');
  shopOverlay.setAttribute('aria-hidden', 'false');
  setStatus('Shop open — click an item to buy. Press E to close.');
}

function closeShop() {
  if (!shopOverlay) return;
  shopOpen = false;
  shopOverlay.classList.remove('open');
  shopOverlay.setAttribute('aria-hidden', 'true');
  setStatus(DEFAULT_STATUS);
}

function toggleShop() {
  if (shopOpen) closeShop();
  else openShop();
}

function attemptPurchase(offer) {
  if (Engine.coins < offer.cost) {
    setStatus('Not enough coins.', 1.5);
    return;
  }
  Engine.updateCoins(-offer.cost);
  const purchasedName = Engine.applyUpgrade(offer.id);
  setStatus(`Purchased: ${purchasedName}`, 2.0);
  // Refresh offers after purchase
  rollShopOffers();
  renderShop();
}

// Close when clicking outside panel
if (shopOverlay) {
  shopOverlay.addEventListener('pointerdown', (e) => {
    if (e.target === shopOverlay) closeShop();
  });
}

// Toggle shop with E
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyE') {
    e.preventDefault();
    toggleShop();
  }
});

function loop(ts) {
  const dt = Math.min(0.033, (ts - last) / 1000 || 0);
  last = ts;

  if (statusTtl > 0) {
    statusTtl -= dt;
    if (statusTtl <= 0 && !shopOpen) setStatus(DEFAULT_STATUS);
  }

  if (!shopOpen) {
  // 1. Movement
  const ax = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0);
  const ay = (keys.has("KeyS") ? 1 : 0) - (keys.has("KeyW") ? 1 : 0);
  const n = normalize(ax, ay);

  Engine.player.x = clamp(
    Engine.player.x + n.x * Engine.player.speed * dt,
    0,
    Engine.WORLD_W - Engine.player.w
  );
  Engine.player.y = clamp(
    Engine.player.y + n.y * Engine.player.speed * dt,
    0,
    Engine.WORLD_H - Engine.player.h
  );

  // 2. Spawning
  Engine.updateHostiles(dt);

  // 3. Combat
  Engine.tickFireCd(dt);
  Engine.updateBullets(dt);
  Engine.checkCollisions(dt);


  // 4. Camera
  const vw = Engine.viewport.clientWidth;
  const vh = Engine.viewport.clientHeight;
  const camX = clamp((Engine.player.x + Engine.player.w / 2) - vw / 2, 0, Engine.WORLD_W - vw);
  const camY = clamp((Engine.player.y + Engine.player.h / 2) - vh / 2, 0, Engine.WORLD_H - vh);
  Engine.setCamera(camX, camY);

  if (hasMouse && !shopOpen) {
    const px = (Engine.player.x - camX) + (Engine.player.w / 2);
    const py = (Engine.player.y - camY) + (Engine.player.h / 2);
    Engine.setFaceRad(Math.atan2(myView - py, mxView - px));
  }

  // 5. Rendering
  Engine.world.style.transform = `translate(${-camX}px, ${-camY}px)`;
  Engine.playerEl.style.left = `${Engine.player.x}px`;
  Engine.playerEl.style.top = `${Engine.player.y}px`;

  if (hasMouse && !shopOpen) {
    Engine.playerEl.style.transform = `rotate(${Engine.faceRad}rad)`;
  }

  // 6. Hud
  if (hudPX) hudPX.innerText = `PLAYER X: ${Math.floor(Engine.player.x)}`;
  if (hudPY) hudPY.innerText = `PLAYER Y: ${Math.floor(Engine.player.y)}`;
  if (hudMX) hudMX.innerText = `MOUSE X: ${Math.floor(mxView)}`;
  if (hudMY) hudMY.innerText = `MOUSE Y: ${Math.floor(myView)}`;

  if (shopOpen) renderShop();
  requestAnimationFrame(loop);
}
// Shooting Listener
Engine.viewport.addEventListener("pointerdown", (e) => {
  if (shopOpen) return;
  if (e.button === 0 && Engine.fireCd <= 0) {
    Engine.spawnBullet();
    Engine.resetFireCd();
  }
});
setStatus(DEFAULT_STATUS);
requestAnimationFrame(loop);

// main.js
import { normalize, clamp } from './utils.js';
import * as Engine from './engine.js';
import { keys, hasMouse, myView, mxView } from './input.js';

const fadeOverlay = document.getElementById('fadeOverlay');

let transitioning = false;
const TRANSITION_SECONDS = 5;
const LEVEL2_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

let last = 0;
const hudPX = document.getElementById('hudPlayerX');
const hudPY = document.getElementById('hudPlayerY');
const hudMX = document.getElementById('hudMouseX');
const hudMY = document.getElementById('hudMouseY');

function loop(ts) {
  const dt = Math.min(0.033, (ts - last) / 1000 || 0);
  last = ts;

  if (!transitioning) {
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
  }

  // 4. Camera
  const vw = Engine.viewport.clientWidth;
  const vh = Engine.viewport.clientHeight;
  const camX = clamp((Engine.player.x + Engine.player.w / 2) - vw / 2, 0, Engine.WORLD_W - vw);
  const camY = clamp((Engine.player.y + Engine.player.h / 2) - vh / 2, 0, Engine.WORLD_H - vh);
  Engine.setCamera(camX, camY);

  if (hasMouse && !transitioning) {
    const px = (Engine.player.x - camX) + (Engine.player.w / 2);
    const py = (Engine.player.y - camY) + (Engine.player.h / 2);
    Engine.setFaceRad(Math.atan2(myView - py, mxView - px));
  }

  // 5. Rendering
  Engine.world.style.transform = `translate(${-camX}px, ${-camY}px)`;
  Engine.playerEl.style.left = `${Engine.player.x}px`;
  Engine.playerEl.style.top = `${Engine.player.y}px`;

  if (hasMouse) {
    Engine.playerEl.style.transform = `rotate(${Engine.faceRad}rad)`;
  }

  // 6. Hud
  if (hudPX) hudPX.innerText = `PLAYER X: ${Math.floor(Engine.player.x)}`;
  if (hudPY) hudPY.innerText = `PLAYER Y: ${Math.floor(Engine.player.y)}`;
  if (hudMX) hudMX.innerText = `MOUSE X: ${Math.floor(mxView)}`;
  if (hudMY) hudMY.innerText = `MOUSE Y: ${Math.floor(myView)}`;

  // 7. LevelTP
  if (!transitioning && Engine.teleporter.active) {
    const p = Engine.player;
    const t = Engine.teleporter;

    const left = t.x - t.w / 2;
    const top  = t.y - t.h / 2;

    if (
      p.x < left + t.w &&
      p.x + p.w > left &&
      p.y < top + t.h &&
      p.y + p.h > top
    ) {
      startLevelTransition();
    }
  }

  requestAnimationFrame(loop);
}

// Shooting Listener
Engine.viewport.addEventListener("pointerdown", (e) => {
  if (transitioning) return;
  if (e.button === 0 && Engine.fireCd <= 0) {
    Engine.spawnBullet();
    Engine.resetFireCd();
  }
});

requestAnimationFrame(loop);

function startLevelTransition() {
  transitioning = true;

  if (Engine.statusMessage) {
    Engine.statusMessage.innerText = "Level 2 inbound...";
  }

  if (fadeOverlay) fadeOverlay.classList.add('active');

  Engine.setHostileSpawning(false);

  if (Engine.teleporterEl) Engine.teleporterEl.style.display = 'none';

  setTimeout(() => {
    window.location.href = LEVEL2_URL;
  }, TRANSITION_SECONDS * 1000);
}

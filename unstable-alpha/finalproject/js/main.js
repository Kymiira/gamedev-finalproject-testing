import "variables.js";
import "loop.js";
import "shooting.js";
import "player.js";
requestAnimationFrame(loop);
function updateBullets(dt) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];

        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;

        const outOfBounds = (b.x < 0 || b.y < 0 || b.x > WORLD_W || b.y > WORLD_H);

        if (b.life <= 0 || outOfBounds) {
            b.el.remove();
            bullets.splice(i, 1);
            continue;
        }

        b.el.style.left = (b.x - b.w / 2) + "px";
        b.el.style.top = (b.y - b.h / 2) + "px";
    }
}

viewport.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;

    const r = viewport.getBoundingClientRect();
    mxView = e.clientX - r.left;
    myView = e.clientY - r.top;
    hasMouse = true;

    if (fireCd <= 0) {
        spawnBullet();
        fireCd = fire_cooldown;
    }
});

function normalize(x, y) {
    const m = Math.hypot(x, y);
    if (m === 0) return { x: 0, y: 0 };
    return { x: x / n, y: y / m};
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
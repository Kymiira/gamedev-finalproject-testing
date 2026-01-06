 export function makeBulletElement() {
    let el = null;

    if (bulletEl) {
        el = bulletEl.cloneNode(true);
        el.removeAttribute("id");
        el.style.display = "";
        el.style.position = "absolute";
    } else {
        el = document.createElement("div");
        el.className = "bullet";
        el.style.position = "absolute";
        el.style.width = "6px";
        el.style.height = "6px";
        el.style.borderRadius = "999px";
        el.style.background = "#fff";
        el.style.zIndex = "10";
        el.style.boxShadow = "0 0 6px rgba(255,255,255,0.8)";
    }

    world.appendChild(el);
    const w = el.offsetWidth || 6;
    const h = el.offsetHeight || 6;

    return { el: el, w: w, h: h};
}

export function spawnBullet() {
    const x = player.x + player.w / 2;
    const y = player.y + player.h / 2;

    const vx = Math.cos(faceRad) * bullet_speed;
    const vy = Math.sin(faceRad) * bullet_speed;

    const made = makeBulletElement();

    bullets.push({
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        life: bullet_ttl,
        w: made.w,
        h: made.h,
        el: made.el,
    });
}
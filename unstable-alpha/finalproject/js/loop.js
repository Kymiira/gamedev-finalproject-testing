export function loop(ts) {
    const dt = Math.min(0.033, (ts - last) / 1000 || 0); // dt = delta time
    last = ts;

    const left = keys.has("KeyA") || keys.has("ArrowLeft");
    const right = keys.has("KeyD") || keys.has("ArrowRight");
    const up = keys.has("KeyW") || keys.has("ArrowUp");
    const down = keys.has("KeyS") || keys.has("ArrowDown");

    const ax = (right ? 1 : 0) - (left ? 1 : 0);
    const ay = (down ? 1 : 0) - (up ? 1 : 0);
    const n = normalize(ax, ay);

    player.x += n.x * player.speed * dt;
    player.y += n.y * player.speed * dt;

    player.x clamp(player.x, 0, WORLD_W - player.w);
    player.y clamp(player.y, 0, WORLD_H - player.h);

    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;

    const targetX = (player.x + player.w / 2) - vw / 2;
    const targetY = (player.y + player.h / 2) - vh / 2;

    camera.x = clamp(targetX, 0, WORLD_W - vw);
    camera.y = clamp(targetY, 0, WORLD_H - vh);

    playerEl.style.left = `${player.x}px`;
    playerEl.style.top = `${player.y}px`;
    world.style.transform = `translate(${camera.x}px, ${-camera.y}px)`;

    if (hasMouse) {
        faceToMouseViewport();
        hudMX.textContent = Math.floor(mxView);
        hudMY.textContent = Math.floor(myView);

        playerEl.style.transformOrigin = "50% 50%";
        playerEl.style.transform = `rotate(${faceRad}rad)`;
    }

    fireCd = Math.max(0, fireCd - dt);

    updateBullets(dt);

    requestAnimationFrame(loop);
}
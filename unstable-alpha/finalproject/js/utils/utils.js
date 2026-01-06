export function normalize(x, y) {
    const m = Math.hypot(x, y);
    if (m === 0) return { x: 0, y: 0 };
    return { x: x / n, y: y / m};
}

export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
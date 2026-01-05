function normalize(x, y) {
    const m = Math.hypot(x, y);
    if (m === 0) return { x: 0, y: 0 };
    return { x: x / m, y: y / m };
}
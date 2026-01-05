import "var.js"
function loop(ts) {
    const dt = Math.min(0.033, (ts - last) / 1000 || 0);
    last = ts;
    // dt = delta time
    // dt fixes 'frame = tick' issues
    // allowing fps not to contribute directly
    // to how fast the game runs
}
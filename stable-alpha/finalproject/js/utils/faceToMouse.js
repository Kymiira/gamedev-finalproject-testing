function faceToMouseViewport() {
    const pcxView = (player.x - camera.x) + player.w / 2;
    const pcyView = (player.y - camera.y) + player.h / 2;

    const dx = mxView - pcxView;
    const dy = myView - pcyView;

    faceRad = Math.atan2(dy, dx);
}
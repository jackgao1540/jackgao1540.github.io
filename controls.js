// Pointer capture keeps a gesture coherent across the canvas edges and UI layers.
export function bindOrbitGestures({ canvas, isActive, onDrag, onZoom, onTap, onHover, onLeave }) {
  const pointers = new Map();
  const document = canvas.ownerDocument, window = document?.defaultView;
  let dragged = false, pinched = false, distance = 0;
  const separation = () => { const [a, b] = [...pointers.values()]; return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0; };
  function down(event) {
    if (!isActive() || (event.pointerType !== 'touch' && event.button !== 0)) return;
    event.preventDefault();
    if (!pointers.size) { dragged = false; pinched = false; }
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY });
    canvas.setPointerCapture(event.pointerId);
    if (pointers.size > 1) { pinched = true; dragged = true; distance = separation(); }
  }
  function move(event) {
    const pointer = pointers.get(event.pointerId);
    if (!pointer) { if (isActive()) onHover?.(event); return; }
    // A release beyond the browser can arrive without pointerup/capture loss.
    if (event.pointerType !== 'touch' && event.buttons === 0) { cancel(event); return; }
    if (!isActive()) { cancel(event); return; }
    event.preventDefault();
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    pointer.x = event.clientX; pointer.y = event.clientY;
    if (pointers.size > 1) {
      const next = separation();
      if (next > 8 && distance > 8) onZoom(Math.log(distance / next) / .002);
      distance = next; return;
    }
    if (Math.hypot(pointer.x - pointer.startX, pointer.y - pointer.startY) > 5) dragged = true;
    if (dragged) { canvas.style.cursor = 'grabbing'; onLeave?.(); onDrag(dx, dy); }
  }
  function finish(event, tap) {
    if (!pointers.has(event.pointerId)) return;
    const pointer = pointers.get(event.pointerId);
    if (Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY) > 5) dragged = true;
    pointers.delete(event.pointerId);
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if (tap && !dragged && !pinched && !pointers.size && isActive()) onTap(event);
    if (!pointers.size) canvas.style.cursor = 'grab';
  }
  const up = event => finish(event, true);
  const cancel = event => finish(event, false);
  const outsideUp = event => { if (event.target !== canvas) cancel(event); };
  function reset() {
    const ids = [...pointers.keys()]; pointers.clear();
    for (const id of ids) if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
    canvas.style.cursor = 'grab'; onLeave?.();
  }
  const visibility = () => { if (document.hidden) reset(); };
  const leave = () => { if (!pointers.size) onLeave?.(); };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', cancel);
  canvas.addEventListener('lostpointercapture', cancel);
  canvas.addEventListener('pointerleave', leave);
  window?.addEventListener('pointerup', outsideUp, true);
  window?.addEventListener('pointercancel', cancel, true);
  window?.addEventListener('blur', reset);
  document?.addEventListener('visibilitychange', visibility);
  return () => {
    reset();
    canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move);
    canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', cancel);
    canvas.removeEventListener('lostpointercapture', cancel); canvas.removeEventListener('pointerleave', leave);
    window?.removeEventListener('pointerup', outsideUp, true);
    window?.removeEventListener('pointercancel', cancel, true);
    window?.removeEventListener('blur', reset);
    document?.removeEventListener('visibilitychange', visibility);
  };
}

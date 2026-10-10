import { COLORS } from '../constants/brand';

/*
 * Procedural placeholder art — neon squiggles like the Figma project mockup.
 *
 * Used in two places so they always match:
 *   - Hallway.jsx uploads the canvas to the GPU as a frame texture
 *   - ProjectModal.jsx shows it as an <img> via canvas.toDataURL()
 *
 * A tiny seeded random (same seed -> same drawing) keeps each project's
 * doodle stable across reloads instead of reshuffling every time.
 * Delete this once every project has real screenshots.
 */
export function drawPlaceholder(seed, width = 512, height = 320) {
  let s = seed * 9301 + 49297;
  const rand = () => (s = (s * 9301 + 49297) % 233280) / 233280;

  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);
  ctx.lineWidth = Math.max(4, width / 70);
  ctx.lineCap = 'round';

  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = i % 2 ? COLORS.uiViolet : COLORS.uiPink;
    ctx.beginPath();
    let x = rand() * width;
    let y = -10;
    ctx.moveTo(x, y);
    // A wandering vertical line made of bezier wiggles.
    while (y < height + 10) {
      const nx = x + (rand() - 0.5) * width * 0.3;
      const ny = y + height * (0.15 + rand() * 0.2);
      ctx.bezierCurveTo(
        x + (rand() - 0.5) * width * 0.25, y + height * 0.1,
        nx + (rand() - 0.5) * width * 0.25, ny - height * 0.1,
        nx, ny
      );
      x = nx;
      y = ny;
    }
    ctx.stroke();
  }
  return c;
}

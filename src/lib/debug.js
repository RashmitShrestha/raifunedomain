/*
 * URL debug switches — for hunting rendering bugs on a real phone, where you
 * can't open devtools easily. Add any combination to the URL, e.g.
 *
 *   https://your-site/?noedges&nobloom
 *
 *   noedges    hide all neon edge lines (temple + hallway)
 *   nobloom    disable post-processing (bloom + vignette)
 *   noshadows  disable shadow maps
 *   nosparkle  hide the black hole's sparkle particles
 *   nostars    hide the starfield
 *
 * Toggle one at a time: whichever one makes the flicker vanish is the culprit.
 */
const params = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search);

export const DEBUG = {
  noEdges: params.has('noedges'),
  noBloom: params.has('nobloom'),
  noShadows: params.has('noshadows'),
  noSparkle: params.has('nosparkle'),
  noStars: params.has('nostars'),
};

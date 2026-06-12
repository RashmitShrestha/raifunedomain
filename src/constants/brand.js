/**
 * Brand tokens, lifted directly from docs/personalBrand.md.
 * Single source of truth for colors used across DOM (CSS-in-JS / inline)
 * and the three.js scene. Keep hex strings — three.js Color accepts them.
 */

export const COLORS = {
  // red & blue palette
  pink: '#ff075e', // bright pink/red
  maroon: '#7f0000', // maroon
  violet: '#5900ff', // bright violet/blue
  cyan: '#4cffe7', // cyan torches / accents

  // neutrals for the void
  void: '#03010a', // near-black background of space
  ink: '#0a0512', // slightly lifted panel black
  bone: '#e9e4f0', // off-white text
};

/** Ordered palette handy for gradients / cycling. */
export const PALETTE = [COLORS.pink, COLORS.maroon, COLORS.violet, COLORS.cyan];

/** Motifs from the style guide — used to drive copy + future scene work. */
export const MOTIFS = [
  'dithering',
  'sparkle star',
  'black holes',
  'futuristic Y2K',
  'neon',
  'cool eyes',
  'anime edits',
  'asian architecture — horror',
  'nepali ancient temple',
  'masks',
  'divinity',
];

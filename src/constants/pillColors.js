/*
 * ============================================================================
 * Pill colors — one color per technology and per tag in the project modal.
 * ============================================================================
 *
 * The modal sits on wall-gray (#1e1e1e), so every color here is a light,
 * saturated tint (brand colors lightened where the real one is too dark)
 * that clears WCAG 4.5:1 contrast as text on that gray.
 *
 * Keys are lowercase, matching the `tech` / `tags` strings in projects.js.
 * Anything not listed falls back to a hashed pastel (pillColor below), so a
 * new tech still gets a stable, readable color before you pick one.
 */

export const TECH_COLORS = {
  javascript: '#f7df1e',
  typescript: '#6aa8ff',
  python: '#ffd866',
  'react.js': '#61dafb',
  'react native': '#3fe0c5',
  expo: '#d0d4ff',
  'mapbox api': '#5fd38d',
  'next.js': '#e6e6e6',
  airtable: '#fcb400',
  'google cloud platform': '#8ab4f8',
  firestore: '#ffa000',
  swift: '#ff8a65',
  xcode: '#5ec4ff',
  r: '#9cb8ff',
  shiny: '#7fd4ff',
  tidyverse: '#a3d977',
  magick: '#d29bff',
  godot: '#7ec3f0',
  gdscript: '#b4e1ff',
  'fl studio': '#ff9a3c',
  figma: '#c08cff',
  wordpress: '#6cb6e0',
  mailchimp: '#ffe01b',
  'adobe suite': '#ff6b6b',
  'adobe illustrator': '#ffa64d',
  'adobe after effects': '#b0a8ff',
};

export const TAG_COLORS = {
  'web development': '#4cffe7', // brand cyan
  'mobile development': '#7cf29c',
  'game development': '#ff8c42',
  'cloud platforming': '#93c5fd',
  'machine learning': '#c4a1ff',
  design: '#ff6fa5',
  music: '#f08cff',
  group: '#ffd166',
};

/** Stable light color for anything missing from the maps above. */
export function pillColor(name, map) {
  const key = name.toLowerCase();
  if (map[key]) return map[key];
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 85% 72%)`;
}

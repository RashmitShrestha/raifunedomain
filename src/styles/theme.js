import { COLORS } from '../constants/brand';

/** Shared DOM style tokens. Mirrors the brand palette for the UI layer. */
export const theme = {
  colors: COLORS,
  font: {
    display: "'Space Grotesk', 'Segoe UI', system-ui, sans-serif",
    mono: "'Space Mono', ui-monospace, 'Cascadia Code', monospace",
  },
  glow: {
    pink: `0 0 12px ${COLORS.pink}, 0 0 32px ${COLORS.pink}55`,
    cyan: `0 0 12px ${COLORS.cyan}, 0 0 32px ${COLORS.cyan}55`,
    violet: `0 0 12px ${COLORS.violet}, 0 0 32px ${COLORS.violet}55`,
  },
};

import { Stars } from '@react-three/drei';
import { DEBUG } from '../../lib/debug';

/** Sparkle-star void. Wraps drei's <Stars> with brand-tuned density. */
export default function Starfield() {
  if (DEBUG.noStars) return null;
  return (
    <Stars
      radius={200}
      depth={60}
      count={6000}
      factor={20}
      saturation={0}
      speed={0.4}
    />
  );
}

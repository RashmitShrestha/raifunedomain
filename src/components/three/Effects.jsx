import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { DEBUG } from '../../lib/debug';

/*
 * WHY PHONES GET DIFFERENT BLOOM SETTINGS
 * ---------------------------------------
 * Bloom picks every pixel brighter than `luminanceThreshold` and smears it
 * into a glow. Seen from far away on a small phone screen, the neon edge
 * lines are thinner than one pixel, so each frame they land on slightly
 * different pixels and their brightness jumps around. Bloom then turns each
 * tiny jump into a big, visible glow pulse, and the temple flickers. Up close
 * the lines are several pixels wide and stable, so the flicker goes away.
 *
 * On phones we raise the threshold (only really bright things bloom, so the
 * thin edges at rest don't) and tighten the smoothing ramp, then bump the
 * intensity a little so the things that DO bloom still feel neon.
 *
 * Tune on the device without redeploying, via URL params:
 *   ?bt=0.6   threshold     ?bs=0.3   smoothing     ?bi=1.3   intensity
 */
const isPhone =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

const PRESET = isPhone
  ? { threshold: 0.55, smoothing: 0.35, intensity: 1.3 }
  : { threshold: 0.2, smoothing: 0.9, intensity: 1 };

const params = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search);
const num = (key, fallback) => {
  const v = parseFloat(params.get(key));
  return Number.isFinite(v) ? v : fallback;
};

const BLOOM = {
  threshold: num('bt', PRESET.threshold),
  smoothing: num('bs', PRESET.smoothing),
  intensity: num('bi', PRESET.intensity),
};

/**
 * Post-processing: bloom makes the accretion disk, torches, neon edges and
 * spire bleed light (the core of the neon/Y2K look), and a vignette darkens
 * the frame edges so the eye falls to the temple + sun.
 */
export default function Effects() {
  if (DEBUG.noBloom) return null;
  return (
    <EffectComposer disableNormalPass>
      <Bloom
        intensity={BLOOM.intensity}
        luminanceThreshold={BLOOM.threshold}
        luminanceSmoothing={BLOOM.smoothing}
        mipmapBlur
        radius={0.7}
      />
      <Vignette offset={0.3} darkness={0.85} eskil={false} />
    </EffectComposer>
  );
}

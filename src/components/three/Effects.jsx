import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

/**
 * Post-processing: bloom makes the accretion disk, torches, neon edges and
 * spire bleed light (the core of the neon/Y2K look), and a vignette darkens
 * the frame edges so the eye falls to the temple + sun.
 */
export default function Effects() {
  return (
    <EffectComposer disableNormalPass>
      <Bloom
        intensity={1.15}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.7}
      />
      <Vignette offset={0.3} darkness={0.85} eskil={false} />
    </EffectComposer>
  );
}

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from '../../constants/brand';
import { DISK_TILT } from '../../constants/scene';
import { useStory } from '../../store/useStory';

/**
 * A "black-hole sun": a pure-black event horizon sphere, wrapped by a glowing
 * accretion disk and a soft corona. The disk emits in pink/violet so bloom
 * (see Effects.jsx) bleeds red & blue light across the foreground.
 *
 * STORYBOARD NOTES IMPLEMENTED HERE
 *   - "the black hole rings layer has slight particles and slight flux-ing
 *     in and out" -> <Sparkles> scattered in the disk plane, plus a slow,
 *     slightly irregular pulse on each ring's scale + opacity (the "flux").
 *   - START screen shows ONLY the rings on black -> the maroon corona is
 *     faded to 0 during phase 'start' and fades in once the intro begins.
 *   - "blackhole still pulsating" on the main entrance -> the flux keeps
 *     running in every phase.
 */
export default function BlackHoleSun({ position = [0, 0, 0] }) {
  const diskRef = useRef();
  const outerRef = useRef();
  const haloRef = useRef();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // FLUX: two sine waves at unrelated speeds summed together never quite
    // repeat, which reads as "organic" breathing instead of a metronome.
    const flux = Math.sin(t * 1.3) * 0.6 + Math.sin(t * 3.7 + 1.2) * 0.4; // -1..1

    if (diskRef.current) {
      diskRef.current.rotation.z += delta * 0.12;
      diskRef.current.scale.setScalar(1 + flux * 0.012);
      diskRef.current.material.opacity = 0.88 + flux * 0.08;
    }
    if (outerRef.current) {
      outerRef.current.rotation.z -= delta * 0.05; // counter-spin = shear
      outerRef.current.scale.setScalar(1 - flux * 0.015);
      outerRef.current.material.opacity = 0.5 - flux * 0.1;
    }
    if (haloRef.current) {
      // gentle breathing pulse on the corona
      const s = 1 + Math.sin(t * 0.6) * 0.04;
      haloRef.current.scale.setScalar(s);

      // Hidden on the start screen, eases in once the intro starts.
      const target = useStory.getState().phase === 'start' ? 0 : 0.45;
      const mat = haloRef.current.material;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, target, 0.02);
    }
  });

  return (
    <group position={position}>
      {/* Event horizon — absolute black, swallows light */}
      <mesh>
        <sphereGeometry args={[5.5, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Inner photon ring — hot pink/red, tilted toward camera */}
      <mesh ref={diskRef} rotation={[DISK_TILT, 0, 0]}>
        <ringGeometry args={[5.7, 9.5, 128]} />
        <meshBasicMaterial
          color={COLORS.pink}
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer disk — violet/blue, larger and dimmer */}
      <mesh ref={outerRef} rotation={[DISK_TILT, 0, 0]}>
        <ringGeometry args={[9.5, 13, 128]} />
        <meshBasicMaterial
          color={COLORS.violet}
          side={THREE.DoubleSide}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Particles drifting in the disk plane. The group shares the disk's
          tilt; the flattened scale (z = 1.5) keeps them hugging the disk. */}
      <group rotation={[DISK_TILT, 0, 0]}>
        <Sparkles count={140} scale={[28, 28, 1.5]} size={6} speed={0.35} noise={0.6} color={COLORS.pink} />
        <Sparkles count={80} scale={[30, 30, 2]} size={4} speed={0.25} noise={0.8} color={COLORS.cyan} />
      </group>

      {/* Corona — camera-facing soft glow halo behind the horizon */}
      <Billboard>
        <mesh ref={haloRef} position={[0, 0, -0.5]}>
          <circleGeometry args={[11, 64]} />
          <meshBasicMaterial
            color={COLORS.maroon}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
}

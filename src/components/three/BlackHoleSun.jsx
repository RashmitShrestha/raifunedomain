import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from '../../constants/brand';

/**
 * A "black-hole sun": a pure-black event horizon sphere, wrapped by a glowing
 * accretion disk and a soft corona. The disk emits in pink/violet so bloom
 * (see Effects.jsx) bleeds red & blue light across the foreground.
 */
export default function BlackHoleSun({ position = [0, 0, 0] }) {
  const diskRef = useRef();
  const haloRef = useRef();

  useFrame((state, delta) => {
    if (diskRef.current) diskRef.current.rotation.z += delta * 0.12;
    if (haloRef.current) {
      // gentle breathing pulse on the corona
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.04;
      haloRef.current.scale.setScalar(s);
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
      <mesh ref={diskRef} rotation={[Math.PI * 0.46, 0, 0]}>
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
      <mesh rotation={[Math.PI * 0.46, 0, 0]}>
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

      {/* Corona — camera-facing soft glow halo behind the horizon */}
      <Billboard>
        <mesh ref={haloRef} position={[0, 0, -0.5]}>
          <circleGeometry args={[11, 64]} />
          <meshBasicMaterial
            color={COLORS.maroon}
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
}

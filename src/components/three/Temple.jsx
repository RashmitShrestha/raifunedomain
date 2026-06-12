import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS, PALETTE } from '../../constants/brand';

/** Dark stone-ish body material, lit by the scene's red/blue rim lights. */
const stoneProps = {
  color: '#16101f',
  roughness: 0.85,
  metalness: 0.2,
};

/** One pagoda tier: a body box capped by an overhanging pyramid roof. */
function Tier({ y, width, height, roofColor }) {
  const roofY = y + height / 2 + 0.45;
  return (
    <group>
      {/* Body */}
      <mesh position={[0, y, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, width]} />
        <meshStandardMaterial {...stoneProps} />
        <Edges color={COLORS.cyan} threshold={15} />
      </mesh>

      {/* Pyramid roof (cylinder w/ 4 radial segments, top radius 0) */}
      <mesh position={[0, roofY, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <cylinderGeometry args={[0, width * 0.92, 0.9, 4, 1]} />
        <meshStandardMaterial color="#241016" roughness={0.7} metalness={0.3} />
        <Edges color={roofColor} threshold={15} />
      </mesh>
    </group>
  );
}

/** A glowing cyan torch on a post, with its own point light. */
function Torch({ position }) {
  const flame = useRef();
  useFrame((state) => {
    if (!flame.current) return;
    const t = state.clock.elapsedTime;
    const flicker = 1 + Math.sin(t * 9 + position[0]) * 0.12;
    flame.current.scale.setScalar(flicker);
    flame.current.material.opacity = 0.75 + Math.sin(t * 13) * 0.15;
  });

  return (
    <group position={position}>
      {/* Post */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 1.8, 8]} />
        <meshStandardMaterial color="#0d0a14" roughness={0.9} />
      </mesh>
      {/* Flame core */}
      <mesh ref={flame} position={[0, 1.95, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial
          color={COLORS.cyan}
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight
        position={[0, 2, 0]}
        color={COLORS.cyan}
        intensity={6}
        distance={9}
        decay={2}
      />
    </group>
  );
}

/** A horizontal string of small prayer-flag quads (lung ta). */
function PrayerFlags({ start, end, count = 12, y }) {
  const flags = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = THREE.MathUtils.lerp(start, end, t);
    // gentle catenary sag
    const sag = Math.sin(t * Math.PI) * 0.5;
    flags.push(
      <mesh key={i} position={[x, y - sag, 0]} rotation={[0, 0, 0.05]}>
        <planeGeometry args={[0.34, 0.46]} />
        <meshStandardMaterial
          color={PALETTE[i % PALETTE.length]}
          emissive={PALETTE[i % PALETTE.length]}
          emissiveIntensity={0.6}
          side={THREE.DoubleSide}
          roughness={0.8}
        />
      </mesh>
    );
  }
  return <group>{flags}</group>;
}

/*
 * ============================================================================
 * Doors — the scroll-driven PAYOFF.
 * ============================================================================
 *
 * THE HINGE TRICK
 * ---------------
 * A door doesn't spin around its center — it swings around its edge (the
 * hinge). But three.js rotates a mesh around its own LOCAL ORIGIN (its
 * center). So to hinge a door we use a classic trick:
 *
 *     <group at the hinge line>          <- we rotate THIS
 *        <door mesh shoved sideways>     <- offset so its edge sits on the hinge
 *     </group>
 *
 * Rotating the group now swings the offset panel around the hinge line.
 *
 * The OPEN amount comes from scroll: the doors stay shut for most of the
 * journey and only crack open in the final stretch — see scroll.range() below.
 */
function Doors() {
  const leftHinge = useRef();
  const rightHinge = useRef();
  const interiorLight = useRef();
  const scroll = useScroll();

  // We lerp the rotation toward its target each frame for a smooth, weighty
  // swing (same damping idea as the camera). Store current angle in a ref.
  const open = useRef(0);

  useFrame(() => {
    // scroll.range(start, distance) returns 0→1 ONLY across that slice of the
    // scroll, clamped outside it. Here: nothing happens until 70% scrolled,
    // then it ramps 0→1 over the final 30%. That's our "doors open at the end".
    const target = scroll.range(0.7, 0.3);

    // Damp the actual open amount toward the target (smoothing, again).
    open.current = THREE.MathUtils.lerp(open.current, target, 0.1);

    // Map 0→1 onto a swing angle (~0 to ~70°). Left and right mirror each
    // other (opposite signs) so they part down the middle.
    const angle = open.current * (Math.PI * 0.62);
    if (leftHinge.current) leftHinge.current.rotation.y = angle;
    if (rightHinge.current) rightHinge.current.rotation.y = -angle;

    // The interior light blooms up as the doors part — the reveal moment.
    if (interiorLight.current) interiorLight.current.intensity = open.current * 9;
  });

  // Shared look for the two door panels.
  const doorMat = (
    <meshStandardMaterial color="#0c0712" roughness={0.6} metalness={0.5} />
  );

  return (
    // Whole assembly sits on the front face of the lowest tier (local z = +2.2).
    <group position={[0, 1.5, 2.21]}>
      {/* INTERIOR GLOW: a hot plane + a light, BEHIND the doors. While the
          doors are shut they occlude this; as they open it's revealed. */}
      <mesh position={[0, 0, -0.25]}>
        <planeGeometry args={[2.0, 1.7]} />
        <meshBasicMaterial
          color={COLORS.cyan}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight
        ref={interiorLight}
        position={[0, 0, 0.4]}
        color={COLORS.pink}
        intensity={0}
        distance={8}
        decay={2}
      />

      {/* LEFT door: hinge group on the left edge, panel shoved toward center. */}
      <group ref={leftHinge} position={[-1.04, 0, 0]}>
        <mesh position={[0.5, 0, 0]} castShadow>
          <boxGeometry args={[1.0, 1.7, 0.12]} />
          {doorMat}
          <Edges color={COLORS.pink} threshold={15} />
        </mesh>
      </group>

      {/* RIGHT door: mirror of the left. */}
      <group ref={rightHinge} position={[1.04, 0, 0]}>
        <mesh position={[-0.5, 0, 0]} castShadow>
          <boxGeometry args={[1.0, 1.7, 0.12]} />
          {doorMat}
          <Edges color={COLORS.violet} threshold={15} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Futuristic ancient Nepali temple — the foreground subject.
 * Tiered pagoda, neon-edged, flanked by cyan torches and prayer flags,
 * with scroll-triggered doors at the entrance.
 */
export default function Temple({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Plinth / stepped base */}
      <mesh position={[0, 0.25, 0]} receiveShadow castShadow>
        <boxGeometry args={[7, 0.5, 7]} />
        <meshStandardMaterial {...stoneProps} />
        <Edges color={COLORS.violet} threshold={15} />
      </mesh>
      <mesh position={[0, 0.7, 0]} receiveShadow castShadow>
        <boxGeometry args={[6, 0.5, 6]} />
        <meshStandardMaterial {...stoneProps} />
        <Edges color={COLORS.pink} threshold={15} />
      </mesh>

      {/* Three stacked tiers, shrinking upward */}
      <Tier y={1.7} width={4.4} height={1.8} roofColor={COLORS.pink} />
      <Tier y={3.9} width={3.2} height={1.5} roofColor={COLORS.violet} />
      <Tier y={5.8} width={2.0} height={1.2} roofColor={COLORS.cyan} />

      {/* Finial spire */}
      <mesh position={[0, 7.2, 0]} castShadow>
        <coneGeometry args={[0.35, 1.4, 16]} />
        <meshStandardMaterial
          color={COLORS.cyan}
          emissive={COLORS.cyan}
          emissiveIntensity={1.2}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Scroll-triggered entrance doors on the lowest tier */}
      <Doors />

      {/* Cyan torches flanking the entrance */}
      <Torch position={[-2.6, 1, 3.2]} />
      <Torch position={[2.6, 1, 3.2]} />

      {/* Prayer flags strung across the front */}
      <PrayerFlags start={-2.6} end={2.6} y={4.6} />

      {/* Ground — receives the temple's shadow, fades into the void */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[40, 64]} />
        <meshStandardMaterial color="#070410" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

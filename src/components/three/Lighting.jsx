import { COLORS } from '../../constants/brand';

/**
 * Lighting rig that sells "shadowed by a black-hole sun":
 *   - faint cold ambient so blacks aren't pure void
 *   - a RED key from behind/above (the black-hole sun's direction, -Z)
 *     casting the temple into silhouette + shadow toward camera
 *   - a BLUE/violet rim from front-side to carve the foreground out of dark
 */
export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.12} color={COLORS.violet} />

      {/* Red key from the black-hole sun behind the temple */}
      <directionalLight
        position={[0, 9, -20]}
        intensity={2.4}
        color={COLORS.pink}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0004}
      />

      {/* Cool violet/blue fill rim from the front-left */}
      <directionalLight
        position={[-8, 5, 9]}
        intensity={0.9}
        color={COLORS.violet}
      />

      {/* Subtle cyan kick from the front-right (echoes the torches) */}
      <directionalLight
        position={[9, 3, 7]}
        intensity={0.5}
        color={COLORS.cyan}
      />
    </>
  );
}

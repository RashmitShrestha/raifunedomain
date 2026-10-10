import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from '../../constants/brand';
import { PROJECTS } from '../../constants/projects';
import { FRAME_SLOTS, HALL } from '../../constants/scene';
import { useStory } from '../../store/useStory';
import { drawPlaceholder } from '../../lib/placeholderArt';

/*
 * ============================================================================
 * Hallway — ACT 2: the corridor of project frames behind the temple doors.
 * ============================================================================
 *
 * Storyboard: "FULLY SCROLLED TO ENTRANCE" (hallway sketch) +
 *             "STARTING HALLWAY SCROLL -- CLICKING ON SOMETHING".
 *
 *   - Dark gray box corridor, its corners traced with white lines (the
 *     sketchy white outlines in the Figma).
 *   - Project frames on both walls, facing each other in pairs. The last
 *     project hangs on the back wall ("end of the hallway").
 *   - "red ball are lights on the wall" -> glowing pink orbs flank every
 *     frame. When you click a frame, the camera parks so close that the orbs
 *     sit half-off the edges of the screen — that's the pink half-circles on
 *     the left/right of the project-modal mockup.
 *   - Hovering a frame makes its white border flare; clicking it tells the
 *     store which project is active (CameraRig flies there, ProjectModal opens).
 *
 * "Bigger on the inside": the corridor is ~30 units long, far deeper than the
 * temple. You never see that contradiction because Experience.jsx hides the
 * exterior once the camera is through the doors, and the hallway until then.
 */

/**
 * Picks the frame's texture: the project's first screenshot if it has one,
 * otherwise the neon-squiggle placeholder (lib/placeholderArt.js), drawn on
 * a 2D <canvas> and uploaded to the GPU as a CanvasTexture. TextureLoader is used directly (instead of
 * drei's useTexture) so a missing/typo'd file just keeps the placeholder
 * rather than suspending or crashing the whole scene.
 */
function useFrameTexture(project, index) {
  const placeholder = useMemo(() => {
    const t = new THREE.CanvasTexture(drawPlaceholder(index + 1));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [index]);
  const [tex, setTex] = useState(placeholder);

  useEffect(() => {
    const src = project.images?.[0];
    if (!src) return;
    let alive = true;
    new THREE.TextureLoader().load(src, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      if (alive) setTex(t);
    });
    return () => {
      alive = false;
    };
  }, [project]);

  return tex;
}

// ---- A single project frame -------------------------------------------------
function ProjectFrame({ project, slot, index }) {
  const [w, h] = HALL.frameSize;
  const texture = useFrameTexture(project, index);
  const border = useRef();
  const [hovered, setHovered] = useState(false);

  // Hover glow: ease the border's brightness up/down. Colors above 1.0 cross
  // the bloom threshold, so the white frame visibly "lights up".
  useFrame(() => {
    if (!border.current) return;
    const target = hovered ? 3 : 1;
    const c = border.current.material.color;
    c.setScalar(THREE.MathUtils.lerp(c.r, target, 0.15));
  });

  const onOver = (e) => {
    e.stopPropagation();
    if (!useStory.getState().shoesOff) return; // not inside yet
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  const onOut = () => {
    setHovered(false);
    document.body.style.cursor = '';
  };
  const onClick = (e) => {
    e.stopPropagation();
    const s = useStory.getState();
    // Ignore clicks while another dialog is up or before we're inside.
    if (s.activeProject || s.modal || !s.shoesOff) return;
    document.body.style.cursor = '';
    s.openProject(project.id);
  };

  return (
    <group position={slot.position} rotation={slot.rotation}>
      {/* Clickable picture + its border */}
      <group onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        {/* White border = a slightly bigger white plane just behind the art */}
        <mesh ref={border} position={[0, 0, -0.005]}>
          <planeGeometry args={[w + 0.14, h + 0.14]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <mesh>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>

      {/* Dashed "caption" lines under the frame (from the hallway sketch) */}
      {[-0.75, -0.25, 0.25, 0.75].map((x, i) => (
        <mesh key={i} position={[x, -h / 2 - 0.22 - (i % 2) * 0.06, 0]}>
          <planeGeometry args={[0.32, 0.035]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Red wall lights flanking the frame */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (w / 2 + 0.38), 0.35, 0.05]}>
          <sphereGeometry args={[0.15, 24, 24]} />
          <meshBasicMaterial color={COLORS.uiPink} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// ---- The corridor ------------------------------------------------------------
export default function Hallway() {
  const length = HALL.zStart - HALL.zEnd;
  const height = HALL.ceiling - HALL.floor;
  const center = [0, (HALL.ceiling + HALL.floor) / 2, (HALL.zStart + HALL.zEnd) / 2];

  // One pink point light per pair of frames (cheaper than one per orb).
  const lightZs = [...new Set(FRAME_SLOTS.map((s) => s.position.z))];

  return (
    <group>
      {/* The shell: one big box seen from the INSIDE (BackSide). Its edges
          give us the white corner lines for free. The front face (behind the
          camera, at the doorway) is never in view while walking forward. */}
      <mesh position={center} receiveShadow>
        <boxGeometry args={[HALL.halfWidth * 2, height, length]} />
        <meshStandardMaterial color={COLORS.wall} roughness={0.95} side={THREE.BackSide} />
        <Edges color="#d9d9d9" threshold={15} />
      </mesh>

      {lightZs.map((z) => (
        <pointLight key={z} position={[0, HALL.frameY + 0.6, z]} color={COLORS.uiPink} intensity={3} distance={7} decay={2} />
      ))}
      {/* Faint cool fill so the walls aren't pure black between lights */}
      <pointLight position={[0, HALL.ceiling - 0.3, HALL.zStart - 1]} color={COLORS.violet} intensity={2} distance={12} decay={2} />

      {PROJECTS.map((project, i) => (
        <ProjectFrame key={project.id} project={project} slot={FRAME_SLOTS[i]} index={i} />
      ))}
    </group>
  );
}

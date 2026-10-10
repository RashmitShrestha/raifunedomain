import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { useStory } from '../../store/useStory';
import {
  BLACK_HOLE_POS,
  DISK_NORMAL,
  FOCUS_DISTANCE,
  FRAME_SLOTS,
  HALL,
  HALL_ENTRY,
  exteriorProgress,
  hallwayProgress,
} from '../../constants/scene';

/*
 * ============================================================================
 * CameraRig — the director's camera for the whole story.
 * ============================================================================
 *
 * HOW THE COOL PARALLAX SITES DO IT (the mental model)
 * ----------------------------------------------------
 * There are two flavors of "parallax", and it's worth knowing the difference:
 *
 *   1. FAKE / 2D parallax (most marketing sites):
 *      You have flat layers (background, midground, foreground) and you
 *      translate each one at a DIFFERENT speed as the user scrolls. The
 *      background moves slow, the foreground moves fast. Your brain reads the
 *      speed difference as depth. It's an illusion painted with 2D layers.
 *
 *   2. REAL / 3D parallax (what we're doing here):
 *      We have an actual 3D scene with a perspective camera. When the camera
 *      moves, near objects sweep across the view faster than far objects —
 *      for FREE, because that's literally how perspective works. The temple
 *      (near) will rush past while the black-hole sun (far) barely shifts.
 *      We don't fake the depth; we move a camera through real space.
 *
 * THE FOUR "SHOTS" (like a film shot list)
 * ----------------------------------------
 *   SHOT 1 · START GAME PAGE (phase 'start')
 *     Camera hovers directly above the black hole, looking straight down its
 *     spin axis. From there the tilted accretion disk is seen face-on, so it
 *     reads as flat pink + violet RINGS around a black void — exactly the
 *     Figma start screen, but it's secretly the real 3D object.
 *
 *   SHOT 2 · TRANSITION (phase 'intro', time-driven, ~4s)
 *     The camera swoops forward and down along a curved path. The rings tilt
 *     away and are revealed to be the black hole seen from above, with the
 *     temple sitting beneath it. This is the "reveal" from the storyboard.
 *
 *   SHOT 3 · EXTERIOR → HALLWAY (phase 'explore', SCROLL-driven)
 *     Scroll position (0→1) is mapped onto a flight path: approach the doors,
 *     step through, then walk the corridor. (Same idea as before, now with a
 *     second act after the gate — see constants/scene.js.)
 *
 *   SHOT 4 · FOCUS (a project frame was clicked)
 *     Overrides the scroll path: the camera turns and parks squarely in front
 *     of the clicked frame, so the wall lights flank the edges of the screen.
 *
 * THE SECRET SAUCE: never snap, always ease.
 * -------------------------------------------
 * We never set the camera directly to its target. Every frame we move it a
 * FRACTION of the remaining distance toward the target (this is called "lerp"
 * — linear interpolation — and when applied every frame it produces smooth,
 * springy "damping"). Switching between shots is therefore automatically a
 * smooth glide — we only ever change the TARGET.
 */

// ---- SHOT 1: the ring view ------------------------------------------------
// Distance chosen so the outer violet ring slightly overflows the screen
// vertically, like the Figma start page.
const RING_DISTANCE = 24;
const RING_POS = BLACK_HOLE_POS.clone().addScaledVector(DISK_NORMAL, RING_DISTANCE);

// ---- SHOT 3a: exterior keyframes (unchanged from v1) ----------------------
// offset = 0 (top of scroll): far back & high up, whole scene + sun in frame.
const START_POS = new THREE.Vector3(0, 10.5, 35);
const START_LOOK = new THREE.Vector3(0, 2, 0); // gaze at temple + sun behind

// end of exterior: right in front of the doors, lowered down.
const END_POS = new THREE.Vector3(0, 0.2, 6.2);
const END_LOOK = new THREE.Vector3(0, -0.4, 2.2); // gaze straight at the doors

// ---- SHOT 2: the intro swoop ----------------------------------------------
// A CatmullRom curve passes smoothly THROUGH every point you give it. Points:
// ring view -> up & forward over the temple -> sweeping down -> START_POS.
const INTRO_DURATION = 4.2; // seconds
const INTRO_PATH = new THREE.CatmullRomCurve3([
  RING_POS,
  new THREE.Vector3(0, 33, 4),
  new THREE.Vector3(0, 20, 26),
  START_POS,
]);

// ---- SHOT 3b: hallway keyframes -------------------------------------------
// Just inside the door, then walking until a few meters from the back wall.
const ENTRY_POS = new THREE.Vector3(0, HALL.eyeHeight, 1.4);
const HALL_END_POS = new THREE.Vector3(0, HALL.eyeHeight, HALL.zEnd + 5.5);
const HALL_LOOK_AHEAD = 10; // look this far down the corridor

// How far the mouse is allowed to nudge the camera (in world units).
// Keep this SMALL — parallax sway should be felt, not seen. Inside the
// narrow hallway (and when focused on a frame) we sway even less.
const SWAY = {
  outside: [0.7, 0.35],
  inside: [0.22, 0.1],
  focus: [0.06, 0.04],
};

// Smoothing factor. Lower = heavier/laggier, higher = snappier.
// 0.05–0.12 is the sweet spot for that luxurious, weighty feel.
const DAMPING = 0.08;
const FOCUS_DAMPING = 0.055; // focusing on a frame feels better a bit slower

/**
 * Easing: turns a linear 0→1 into an S-curve 0→1.
 * Linear motion feels mechanical; easing makes the camera "settle" into
 * each end of the journey (slow-fast-slow). This is `easeInOutCubic`.
 */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function CameraRig() {
  // The actual three.js camera the <Canvas> created for us.
  const { camera } = useThree();

  // useScroll() (from drei's <ScrollControls>) gives us a live scroll handle.
  // scroll.offset is a damped number from 0 (top) to 1 (bottom).
  const scroll = useScroll();

  // Scratch objects we reuse every frame. Allocating new Vector3s inside
  // useFrame would create garbage 60×/sec — reuse instead. (Perf habit.)
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const currentLook = useRef(BLACK_HOLE_POS.clone()); // where we're CURRENTLY looking
  const introStart = useRef(null); // clock time when the intro began
  const placed = useRef(false);

  // useFrame runs once per rendered frame (~60fps). This is our animation loop.
  useFrame((state) => {
    const { phase, activeProject, finishIntro } = useStory.getState();
    let sway = SWAY.outside;
    let damping = DAMPING;

    if (phase === 'start') {
      // ---- SHOT 1: hover above the black hole, look down its axis --------
      targetPos.current.copy(RING_POS);
      targetLook.current.copy(BLACK_HOLE_POS);
      sway = SWAY.inside; // a whisper of motion so it doesn't feel frozen
    } else if (phase === 'intro') {
      // ---- SHOT 2: time-driven swoop along the curve ---------------------
      if (introStart.current === null) introStart.current = state.clock.elapsedTime;
      const raw = (state.clock.elapsedTime - introStart.current) / INTRO_DURATION;
      const t = easeInOutCubic(Math.min(raw, 1));

      // getPointAt(t) samples the curve at an even DISTANCE along it (not an
      // even parameter), so the speed along the path stays consistent.
      INTRO_PATH.getPointAt(t, targetPos.current);
      // Keep staring at the black hole for the first part of the move, then
      // pan down onto the temple — that late pan is the "reveal".
      targetLook.current.lerpVectors(BLACK_HOLE_POS, START_LOOK, easeInOutCubic(Math.min(raw * 1.15, 1)));
      damping = 0.12; // follow the curve tightly so the shot reads clean

      if (raw >= 1) finishIntro();
    } else if (activeProject) {
      // ---- SHOT 4: park in front of the clicked frame --------------------
      const slot = FRAME_SLOTS.find((s) => s.id === activeProject);
      targetPos.current.copy(slot.position).addScaledVector(slot.normal, FOCUS_DISTANCE);
      targetLook.current.copy(slot.position);
      sway = SWAY.focus;
      damping = FOCUS_DAMPING;
    } else {
      // ---- SHOT 3: scroll-driven exterior + hallway ----------------------
      const hall = hallwayProgress(scroll.offset);

      if (hall <= 0) {
        // ACT 1 — exterior. Read + ease the scroll progress, then
        // lerpVectors(a, b, p) = a + (b - a) * p between the two keyframes.
        const p = easeInOutCubic(exteriorProgress(scroll.offset));
        targetPos.current.lerpVectors(START_POS, END_POS, p);
        targetLook.current.lerpVectors(START_LOOK, END_LOOK, p);
      } else if (hall < HALL_ENTRY) {
        // ACT 2a — step through the doorway, lowering our gaze to eye level.
        const p = easeInOutCubic(hall / HALL_ENTRY);
        targetPos.current.lerpVectors(END_POS, ENTRY_POS, p);
        targetLook.current
          .set(0, HALL.eyeHeight, ENTRY_POS.z - HALL_LOOK_AHEAD)
          .lerp(END_LOOK, 1 - p);
        sway = SWAY.inside;
      } else {
        // ACT 2b — walk the corridor. Linear (not eased) so the walking pace
        // matches your scroll speed 1:1, like actually walking.
        const p = (hall - HALL_ENTRY) / (1 - HALL_ENTRY);
        targetPos.current.lerpVectors(ENTRY_POS, HALL_END_POS, p);
        targetLook.current.set(0, HALL.eyeHeight, targetPos.current.z - HALL_LOOK_AHEAD);
        sway = SWAY.inside;
      }
    }

    // ---- MOUSE PARALLAX sway ---------------------------------------------
    // state.pointer is the cursor in "normalized device coords": x and y
    // each run from -1 (one edge) to +1 (the other). We offset the camera
    // a touch in the OPPOSITE direction of the cursor, which makes the
    // foreground appear to swing against your mouse = strong depth cue.
    targetPos.current.x += -state.pointer.x * sway[0];
    targetPos.current.y += -state.pointer.y * sway[1];

    // First frame: teleport instead of gliding in from the Canvas default.
    if (!placed.current) {
      camera.position.copy(targetPos.current);
      currentLook.current.copy(targetLook.current);
      placed.current = true;
    }

    // ---- DAMP toward the targets instead of snapping ---------------------
    // Vector3.lerp(target, alpha) moves the vector `alpha` of the way to
    // `target`. Doing this every frame = exponential smoothing (a spring).
    camera.position.lerp(targetPos.current, damping);
    currentLook.current.lerp(targetLook.current, damping);
    camera.lookAt(currentLook.current);
  });

  // This component renders nothing visible — it only drives the camera.
  return null;
}

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

/*
 * ============================================================================
 * CameraRig — the scroll-driven "fly toward the temple" camera.
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
 * So our job is simply: map the scroll position (a number from 0 → 1) onto a
 * camera position somewhere along a path. Everything else is physics.
 *
 * THE TWO INPUTS WE BLEND
 * -----------------------
 *   A) Scroll position  -> drives the big journey (far away -> at the door).
 *   B) Mouse position    -> adds a tiny, subtle sway so the scene feels alive
 *                           and 3D even when you're not scrolling. This is the
 *                           "premium" touch you feel on award-winning sites.
 *
 * THE SECRET SAUCE: never snap, always ease.
 * -------------------------------------------
 * We never set the camera directly to its target. Every frame we move it a
 * FRACTION of the remaining distance toward the target (this is called "lerp"
 * — linear interpolation — and when applied every frame it produces smooth,
 * springy "damping"). That lag is what makes motion feel buttery instead of
 * robotic.
 */

// ---- Keyframes: where the camera lives at the start and end of the scroll ---
// Think of these as two photographs. We interpolate between them.

// offset = 0 (top of scroll): far back & high up, whole scene + sun in frame.
const START_POS = new THREE.Vector3(0, 3, 16);
const START_LOOK = new THREE.Vector3(0, 2.5, 0); // gaze at temple + sun behind

// offset = 1 (bottom of scroll): right in front of the doors, lowered down.
const END_POS = new THREE.Vector3(0, 0.2, 6.2);
const END_LOOK = new THREE.Vector3(0, -0.4, 2.2); // gaze straight at the doors

// How far the mouse is allowed to nudge the camera (in world units).
// Keep this SMALL — parallax sway should be felt, not seen.
const MOUSE_SWAY_X = 0.7;
const MOUSE_SWAY_Y = 0.35;

// Smoothing factor. Lower = heavier/laggier, higher = snappier.
// 0.05–0.12 is the sweet spot for that luxurious, weighty feel.
const DAMPING = 0.08;

/**
 * Easing: turns a linear 0→1 into an S-curve 0→1.
 * Linear scrolling feels mechanical; easing makes the camera "settle" into
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
  const currentLook = useRef(START_LOOK.clone()); // where we're CURRENTLY looking

  // useFrame runs once per rendered frame (~60fps). This is our animation loop.
  useFrame((state) => {
    // 1) Read + ease the scroll progress. ----------------------------------
    const p = easeInOutCubic(scroll.offset); // 0 → 1, eased

    // 2) Compute the *target* camera position by interpolating the keyframes.
    //    lerpVectors(a, b, p) = a + (b - a) * p. At p=0 we're at START, at
    //    p=1 we're at END, and anywhere between is along the straight path.
    targetPos.current.lerpVectors(START_POS, END_POS, p);
    targetLook.current.lerpVectors(START_LOOK, END_LOOK, p);

    // 3) Add the subtle MOUSE PARALLAX sway. -------------------------------
    //    state.pointer is the cursor in "normalized device coords": x and y
    //    each run from -1 (one edge) to +1 (the other). We offset the camera
    //    a touch in the OPPOSITE direction of the cursor, which makes the
    //    foreground appear to swing against your mouse = strong depth cue.
    targetPos.current.x += -state.pointer.x * MOUSE_SWAY_X;
    targetPos.current.y += -state.pointer.y * MOUSE_SWAY_Y;

    // 4) DAMP toward the targets instead of snapping. ----------------------
    //    Vector3.lerp(target, alpha) moves the vector `alpha` of the way to
    //    `target`. Doing this every frame = exponential smoothing (a spring).
    camera.position.lerp(targetPos.current, DAMPING);

    //    Smooth the look-at point too, then aim the camera at it.
    currentLook.current.lerp(targetLook.current, DAMPING);
    camera.lookAt(currentLook.current);
  });

  // This component renders nothing visible — it only drives the camera.
  return null;
}

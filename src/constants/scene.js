import * as THREE from 'three';
import { PROJECTS } from './projects';

/*
 * ============================================================================
 * Scene layout — shared numbers that several 3D files need to agree on.
 * ============================================================================
 *
 * The whole site is ONE continuous scroll (drei <ScrollControls>), split into
 * two acts by a "gate":
 *
 *   offset 0 ─────────── GATE ─────────────────────────────── 1
 *   |  ACT 1: EXTERIOR    |  ACT 2: HALLWAY                    |
 *   |  fly to the temple, |  walk down the corridor of project |
 *   |  doors swing open   |  frames to the back wall           |
 *
 * At GATE the shoes modal appears and the scroll is physically clamped there
 * until you accept (see ScrollDirector.jsx). Coming back the other way, the
 * same clamp triggers the "GOING BACK? DON'T FORGET YOUR SHOES" modal.
 */

/** How many viewport-heights tall the invisible scroll div is. */
export const PAGES = 10;

/** Where on the 0→1 scroll the exterior ends and the hallway begins. */
export const GATE = 0.28;

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** 0→1 progress through ACT 1 (exterior), given drei's scroll.offset. */
export const exteriorProgress = (offset) => clamp01(offset / GATE);

/** 0→1 progress through ACT 2 (hallway), given drei's scroll.offset. */
export const hallwayProgress = (offset) => clamp01((offset - GATE) / (1 - GATE));

/** Fraction of the hallway scroll spent stepping through the doorway. */
export const HALL_ENTRY = 0.08;

// ---------------------------------------------------------------------------
// World positions of the big set pieces (Experience.jsx places them here).
// ---------------------------------------------------------------------------
export const BLACK_HOLE_POS = new THREE.Vector3(0, 12, -15);
export const TEMPLE_POS = new THREE.Vector3(0, -2.4, 0);

/**
 * The accretion disk is tilted by this X rotation (see BlackHoleSun.jsx).
 * A ring geometry's flat face points +Z; rotating it about X by this angle
 * swings that face to point (almost) straight down. So the disk's "up"
 * normal — the axis you'd look down to see it as perfect concentric rings —
 * is the inverse of that, computed here.
 */
export const DISK_TILT = Math.PI * 0.46;
export const DISK_NORMAL = new THREE.Vector3(0, 0, -1)
  .applyAxisAngle(new THREE.Vector3(1, 0, 0), DISK_TILT)
  .normalize();

// ---------------------------------------------------------------------------
// Hallway (ACT 2) — a corridor that's "bigger on the inside" than the temple.
// It starts right behind the door plane and runs down the -Z axis.
// ---------------------------------------------------------------------------
export const HALL = {
  halfWidth: 2.4,
  floor: -1.44, // matches the top of the temple's upper plinth
  ceiling: 1.9,
  zStart: 2.1, // just behind the doors (door plane is at z ≈ 2.21)
  firstFrameGap: 4, // distance from the door to the first pair of frames
  spacing: 5, // distance between frame pairs
  eyeHeight: -0.35, // camera height while walking
  frameY: 0.2, // vertical center of each project frame
  frameSize: [2.4, 1.5], // width, height of each frame (world units)
};

const sideCount = PROJECTS.length - 1; // last project goes on the back wall
const pairCount = Math.ceil(sideCount / 2);
HALL.zEnd = HALL.zStart - HALL.firstFrameGap - pairCount * HALL.spacing; // back wall

/**
 * Where every project frame hangs. Computed once so Hallway.jsx (which draws
 * them) and CameraRig.jsx (which flies to them on click) can't disagree.
 *
 * Frames alternate LEFT / RIGHT walls in pairs facing each other, and the
 * final project is centered on the back wall.
 *
 *   position  — world-space center of the frame
 *   rotation  — Euler so the frame's face points into the corridor
 *   normal    — unit vector the frame faces (camera parks along this)
 */
export const FRAME_SLOTS = PROJECTS.map((project, i) => {
  const isBack = i === PROJECTS.length - 1;
  if (isBack) {
    return {
      id: project.id,
      wall: 'back',
      position: new THREE.Vector3(0, HALL.frameY, HALL.zEnd + 0.02),
      rotation: [0, 0, 0],
      normal: new THREE.Vector3(0, 0, 1),
    };
  }
  const left = i % 2 === 0;
  const z = HALL.zStart - HALL.firstFrameGap - Math.floor(i / 2) * HALL.spacing;
  return {
    id: project.id,
    wall: left ? 'left' : 'right',
    position: new THREE.Vector3(left ? -HALL.halfWidth + 0.02 : HALL.halfWidth - 0.02, HALL.frameY, z),
    rotation: [0, left ? Math.PI / 2 : -Math.PI / 2, 0],
    normal: new THREE.Vector3(left ? 1 : -1, 0, 0),
  };
});

/**
 * How far in front of a frame the camera parks when you click it. Tuned so
 * the two pink wall orbs land right on the left/right screen edges (the
 * half-circles in the Figma project-modal mockup) on a 16:9 screen.
 */
export const FOCUS_DISTANCE = 2.3;

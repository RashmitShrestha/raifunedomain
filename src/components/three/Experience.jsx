import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, AdaptiveDpr } from '@react-three/drei';
import { COLORS } from '../../constants/brand';
import { BLACK_HOLE_POS, HALL, PAGES, TEMPLE_POS } from '../../constants/scene';
import { useStory } from '../../store/useStory';
import BlackHoleSun from './BlackHoleSun.jsx';
import Temple from './Temple.jsx';
import Hallway from './Hallway.jsx';
import Starfield from './Starfield.jsx';
import Lighting from './Lighting.jsx';
import Effects from './Effects.jsx';
import CameraRig from './CameraRig.jsx';
import ScrollDirector from './ScrollDirector.jsx';

/**
 * Combined Scene (per personalBrand.md), now a full SCROLL-DRIVEN STORY:
 *   - START: the black hole's accretion disk, seen face-on as rings
 *   - INTRO: camera swoops down, revealing the temple beneath the black hole
 *   - ACT 1: scroll toward the temple, doors open onto a dark room
 *   - GATE:  "take off your shoes" (DOM modal, scroll clamped)
 *   - ACT 2: walk the hallway of project frames, click one to focus it
 *
 * ----------------------------------------------------------------------------
 * WHAT <ScrollControls> ACTUALLY DOES (this is the trick behind scroll sites)
 * ----------------------------------------------------------------------------
 * A WebGL <canvas> can't be "scrolled" — it's one fixed rectangle of pixels.
 * So drei's <ScrollControls> quietly creates a REAL, invisible, scrollable
 * <div> on top of the canvas, made tall by the `pages` prop (here: PAGES
 * screens of height). The browser scrolls that div natively (great for
 * touch/trackpad momentum), and drei converts its scrollTop into a
 * normalized 0→1 number.
 *
 * Any component inside <ScrollControls> can then read that number with the
 * useScroll() hook (see CameraRig.jsx and Temple.jsx). That single 0→1 value
 * is the "playhead" that drives the whole experience.
 */

/*
 * ActSwitch — shows its children only on one side of the temple doors.
 *
 * The hallway is physically longer than the temple, so if both were visible
 * at once the corridor would poke out the back of the building. Instead we
 * check, every frame, which side of the door plane the CAMERA is on and
 * flip `visible` (no re-render, no unmount — just skip drawing).
 */
function ActSwitch({ act, children }) {
  const ref = useRef();
  useFrame(({ camera }) => {
    if (!ref.current) return;
    const inside = useStory.getState().phase === 'explore' && camera.position.z < HALL.zStart - 0.15;
    ref.current.visible = act === 'interior' ? inside : !inside;
  });
  return <group ref={ref}>{children}</group>;
}

/*
 * HiddenOnStart — on the START screen the temple peeks in at the top edge of
 * the ring shot and spoils the surprise. Keep it hidden until START is
 * pressed; the intro swoop then reveals it.
 */
function HiddenOnStart({ children }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) ref.current.visible = useStory.getState().phase !== 'start';
  });
  return <group ref={ref}>{children}</group>;
}

export default function Experience() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]} // clamp pixel ratio: crisp on retina, not wasteful
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      // Initial camera; CameraRig takes over its position every frame.
      camera={{ position: [0, 10, 30], fov: 42, near: 0.1, far: 200 }}
    >
      {/* Solid void background + distance fog so far things melt into black. */}
      <color attach="background" args={[COLORS.void]} />
      <fog attach="fog" args={[COLORS.void, 18, 85]} />

      {/* Lights & the starfield don't care about scroll — mount them freely. */}
      <Lighting />
      <Starfield />

      {/*
        Everything that READS the scroll must live inside <ScrollControls>.
        pages      -> how many viewport-heights tall the scroll is
        damping    -> how much the scroll value lags behind the raw scrollbar
                      (adds inertia; pairs with the camera's own damping)
      */}
      <ScrollControls pages={PAGES} damping={0.25}>
        {/* Enforces the story rules on the scroll (locks + the shoes gate). */}
        <ScrollDirector />

        <ActSwitch act="exterior">
          {/* Background subject: the black-hole sun, far down the -Z axis. */}
          <BlackHoleSun position={BLACK_HOLE_POS.toArray()} />

          {/* Foreground subject: the temple, grounded near the origin. */}
          <HiddenOnStart>
            <Temple position={TEMPLE_POS.toArray()} />
          </HiddenOnStart>
        </ActSwitch>

        <ActSwitch act="interior">
          <Hallway />
        </ActSwitch>

        {/* Reads useScroll() + the story phase and drives the camera. */}
        <CameraRig />
      </ScrollControls>

      {/* Post-processing (bloom/vignette) sits at the canvas root, post-scroll. */}
      <Effects />

      {/* Drop resolution during heavy frames, restore it when idle. */}
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}

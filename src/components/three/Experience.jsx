import { Canvas } from '@react-three/fiber';
import { ScrollControls, AdaptiveDpr } from '@react-three/drei';
import { COLORS } from '../../constants/brand';
import BlackHoleSun from './BlackHoleSun.jsx';
import Temple from './Temple.jsx';
import Starfield from './Starfield.jsx';
import Lighting from './Lighting.jsx';
import Effects from './Effects.jsx';
import CameraRig from './CameraRig.jsx';

/**
 * Combined Scene (per personalBrand.md), now SCROLL-DRIVEN:
 *   - futuristic nepali temple in the FOREGROUND
 *   - black-hole "sun" in the BACKGROUND, shedding red & blue light
 *   - scrolling DOWN flies the camera toward the temple until the doors open.
 *
 * ----------------------------------------------------------------------------
 * WHAT <ScrollControls> ACTUALLY DOES (this is the trick behind scroll sites)
 * ----------------------------------------------------------------------------
 * A WebGL <canvas> can't be "scrolled" — it's one fixed rectangle of pixels.
 * So drei's <ScrollControls> quietly creates a REAL, invisible, scrollable
 * <div> on top of the canvas, made tall by the `pages` prop (here: 3 screens
 * of height). The browser scrolls that div natively (great for touch/trackpad
 * momentum), and drei converts its scrollTop into a normalized 0→1 number.
 *
 * Any component inside <ScrollControls> can then read that number with the
 * useScroll() hook (see CameraRig.jsx and Temple.jsx). That single 0→1 value
 * is the "playhead" that drives the whole experience.
 */
export default function Experience() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]} // clamp pixel ratio: crisp on retina, not wasteful
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      // Initial camera; CameraRig takes over its position every frame.
      camera={{ position: [0, 3, 16], fov: 42, near: 0.1, far: 200 }}
    >
      {/* Solid void background + distance fog so far things melt into black. */}
      <color attach="background" args={[COLORS.void]} />
      <fog attach="fog" args={[COLORS.void, 18, 70]} />

      {/* Lights & the starfield don't care about scroll — mount them freely. */}
      <Lighting />
      <Starfield />

      {/*
        Everything that READS the scroll must live inside <ScrollControls>.
        pages={3}  -> the page is 3 viewport-heights tall (3 "screens" to scroll)
        damping    -> how much the scroll value lags behind the raw scrollbar
                      (adds inertia; pairs with the camera's own damping)
      */}
      <ScrollControls pages={3} damping={0.25}>
        {/* Background subject: the black-hole sun, far down the -Z axis. */}
        <BlackHoleSun position={[0, 6, -34]} />

        {/* Foreground subject: the temple, grounded near the origin. */}
        <Temple position={[0, -2.4, 0]} />

        {/* Reads useScroll() and drives the camera along its flight path. */}
        <CameraRig />
      </ScrollControls>

      {/* Post-processing (bloom/vignette) sits at the canvas root, post-scroll. */}
      <Effects />

      {/* Drop resolution during heavy frames, restore it when idle. */}
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}

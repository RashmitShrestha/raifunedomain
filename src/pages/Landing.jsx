import { Suspense } from 'react';
import Experience from '../components/three/Experience.jsx';
import Loader from '../components/ui/Loader.jsx';
import StartScreen from '../components/ui/StartScreen.jsx';
import EntranceHUD from '../components/ui/EntranceHUD.jsx';
import ScrollCue from '../components/ui/ScrollCue.jsx';
import GateModal from '../components/ui/GateModal.jsx';
import ProjectModal from '../components/ui/ProjectModal.jsx';
import { useSoundtrack } from '../lib/audio';

/*
 * Two stacked layers:
 *   scene-layer  the <Canvas> (+ drei's invisible scroll div on top of it)
 *   ui-layer     DOM overlays from the Figma storyboard, in story order.
 *
 * The ui-layer has pointer-events: none so the mouse wheel falls through to
 * the scroll div and clicks reach the 3D frames; individual buttons/modals
 * turn pointer events back on.
 *
 * (Navbar.jsx and Hero.jsx aren't in the storyboard, so they're no longer
 * rendered. The files are kept in case you want them back.)
 */
export default function Landing() {
  useSoundtrack();

  return (
    <>
      <div className="scene-layer">
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </div>

      <div className="ui-layer">
        <StartScreen />
        <EntranceHUD />
        <ScrollCue />
        <GateModal />
        <ProjectModal />
      </div>

      {/* DOM overlay loader, fades while three.js assets warm up */}
      <Loader />
    </>
  );
}

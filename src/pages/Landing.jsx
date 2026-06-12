import { Suspense } from 'react';
import Experience from '../components/three/Experience.jsx';
import Navbar from '../components/ui/Navbar.jsx';
import Hero from '../components/ui/Hero.jsx';
import Loader from '../components/ui/Loader.jsx';

export default function Landing() {
  return (
    <>
      <div className="scene-layer">
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </div>

      <div className="ui-layer">
        <Navbar />
        <Hero />
      </div>

      {/* DOM overlay loader, fades while three.js assets warm up */}
      <Loader />
    </>
  );
}

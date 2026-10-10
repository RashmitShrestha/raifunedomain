import { useEffect, useMemo, useState } from 'react';
import { useStory } from '../../store/useStory';
import { PROJECTS } from '../../constants/projects';
import { drawPlaceholder } from '../../lib/placeholderArt';
import { playSfx } from '../../lib/audio';
import { useScramble } from './GlitchText.jsx';

/*
 * PROJECT MODAL (Figma: "STARTING HALLWAY SCROLL -- CLICKING ON SOMETHING"
 *                and "... CLICKING ON SOMETHING, SLIDES")
 *
 * Opens after a hallway frame is clicked. The camera has already flown to
 * the frame (CameraRig SHOT 4); this overlay fades in ~0.45s later, on a
 * translucent backdrop so the 3D pink wall orbs still glow at the edges.
 *
 * Storyboard behaviors:
 *   - "as it focuses the words under unscramble in that glitch effect ...
 *      and reveal the title of the site, as well as a short description"
 *      -> title, description and tech pills all run useScramble on open.
 *   - "hovering on the frame will show a visit site popup, and then clicking
 *      again will send you to the site" -> .visit-pop on hover, click opens
 *      project.url in a new tab.
 *   - "some frames will be a collection of images so there will be a next
 *      and previous carousel" -> 2+ images = arrows + dots (also ← / → keys).
 *   - X / "esc" closes. Scrolling the wheel also closes and hands you back
 *      to the hallway (the "scroll ▽" cue in the mockup).
 */

const OPEN_DELAY = 450; // ms — matches the CSS fade-in delay

function Scrambled({ text, run, delay = OPEN_DELAY, duration = 800 }) {
  return useScramble(text, run, { delay, duration });
}

export default function ProjectModal() {
  const activeId = useStory((s) => s.activeProject);
  const closeProject = useStory((s) => s.closeProject);
  const project = PROJECTS.find((p) => p.id === activeId);
  const index = PROJECTS.findIndex((p) => p.id === activeId);
  const [slide, setSlide] = useState(0);

  // Placeholder art when there are no screenshots yet (same doodle as the
  // 3D frame, so the modal matches the thing you clicked).
  const images = useMemo(() => {
    if (!project) return [];
    if (project.images.length) return project.images;
    return [drawPlaceholder(index + 1, 1139, 503).toDataURL()];
  }, [project, index]);

  const isCarousel = images.length > 1;

  // Reset to first slide + play the glitch sting whenever a project opens.
  useEffect(() => {
    setSlide(0);
    if (activeId) playSfx('glitch', 0.5);
  }, [activeId]);

  // Keyboard: Esc closes, arrows page the carousel.
  useEffect(() => {
    if (!project) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (isCarousel && e.key === 'ArrowRight') step(1);
      if (isCarousel && e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!project) return null;

  function close() {
    playSfx('click', 0.5);
    closeProject();
  }
  function step(dir) {
    playSfx('click', 0.4);
    setSlide((s) => (s + dir + images.length) % images.length);
  }
  function visit() {
    if (project.url) window.open(project.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="story">
      {/* Wheel anywhere = close and keep walking. */}
      <div className="project-backdrop" onWheel={close} role="dialog" aria-modal="true" aria-label={project.title}>
        <button className="project-close" onClick={close} aria-label="Close project">
          {/* The X is two hand-drawn strokes from the Figma, layered. */}
          <span className="x">
            <img src="/ui/close-a.svg" alt="" style={{ left: 0, top: '0.8%', width: '100%' }} />
            <img src="/ui/close-b.svg" alt="" style={{ left: '15.5%', top: 0, width: '81.6%' }} />
          </span>
          esc
        </button>

        <div className="project-body">
          <h2 className="project-title">
            <Scrambled text={project.title} run={activeId} />
          </h2>

          <div className="project-stage">
            {isCarousel && (
              <button className="carousel-arrow" onClick={() => step(-1)} aria-label="Previous image">
                <img src="/ui/arrow-left.svg" alt="" />
              </button>
            )}

            <button
              className={`project-shot ${isCarousel ? 'carousel' : ''}`}
              onClick={visit}
              aria-label={project.url ? `Visit ${project.title}` : `${project.title} (site coming soon)`}
            >
              <img src={images[slide]} alt="" />
              <span className="visit-pop">
                <span>{project.url ? 'VISIT SITE >>>' : 'COMING SOON'}</span>
              </span>
            </button>

            {isCarousel && (
              <button className="carousel-arrow" onClick={() => step(1)} aria-label="Next image">
                <img src="/ui/arrow-right.svg" alt="" />
              </button>
            )}
          </div>

          {isCarousel && (
            <div className="carousel-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={i === slide ? 'active' : ''}
                  onClick={() => setSlide(i)}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}

          <p className="project-desc">
            <Scrambled text={project.description} run={activeId} duration={1200} />
          </p>

          {project.tech.length > 0 && (
            <ul className="project-tech">
              {project.tech.map((t, i) => (
                <li key={t}>
                  <Scrambled text={t} run={activeId} delay={OPEN_DELAY + 300 + i * 90} duration={400} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

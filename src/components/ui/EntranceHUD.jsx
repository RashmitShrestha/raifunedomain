import { useStory } from '../../store/useStory';
import { startHeadTracking, stopHeadTracking } from '../../lib/headTracking';

/*
 * Eye-tracking toggle. Turning it on asks for the front camera; the scene
 * then drifts with your head instead of the mouse (see lib/headTracking.js).
 * Camera access needs HTTPS (or localhost) and a tap, so this can't auto-start.
 */
function TrackingToggle() {
  const tracking = useStory((s) => s.tracking);
  const setTracking = useStory((s) => s.setTracking);

  const onClick = async () => {
    if (tracking === 'on' || tracking === 'loading') {
      stopHeadTracking();
      setTracking('off');
      return;
    }
    setTracking('loading');
    try {
      await startHeadTracking();
      // Only flip to 'on' if the user didn't cancel while it was loading.
      if (useStory.getState().tracking === 'loading') setTracking('on');
    } catch (err) {
      console.warn('[head tracking]', err);
      setTracking('error');
    }
  };

  const label = {
    off: 'Turn on eye tracking',
    loading: 'Starting eye tracking…',
    on: 'Turn off eye tracking',
    error: 'Eye tracking unavailable (camera blocked?). Tap to retry',
  }[tracking];

  return (
    <button
      className={`sound-corner track-toggle track-${tracking}`}
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={tracking === 'on'}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  );
}

/*
 * MAIN ENTRANCE (Figma: "MAIN ENTERANCE")
 * "> SCROLL TO ENTER" in the top-right corner, shown only while you're
 * sitting at the very top of the scroll after the intro lands. It fades as
 * soon as you start moving toward the temple.
 *
 * Also hosts a small persistent sound toggle (bottom-left) so visitors can
 * mute after the start screen is gone. Not in the Figma — remove if unwanted.
 */
export default function EntranceHUD() {
  const phase = useStory((s) => s.phase);
  const atTop = useStory((s) => s.zone === 'top' && !s.shoesOff);
  const soundOn = useStory((s) => s.soundOn);
  const toggleSound = useStory((s) => s.toggleSound);
  const exploring = phase === 'explore';

  return (
    <div className={`story story-fade ${exploring ? '' : 'story-hidden'}`}>
      <p className={`hud-enter story-fade ${atTop ? '' : 'story-hidden'}`}>
        <span className="caret">&gt;</span> SCROLL
        <br />
        TO ENTER
      </p>

      <button
        className={`sound-corner start-sound ${soundOn ? '' : 'muted'}`}
        style={{ top: 'auto', left: '1.6vw', transform: 'none' }}
        onClick={toggleSound}
        aria-label={soundOn ? 'Mute sound' : 'Turn sound on'}
        aria-pressed={soundOn}
      >
        <span className="icon" />
      </button>

      <TrackingToggle />
    </div>
  );
}

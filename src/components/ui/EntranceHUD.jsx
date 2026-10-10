import { useStory } from '../../store/useStory';

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
    </div>
  );
}

import { useState } from 'react';
import { useStory } from '../../store/useStory';
import { playSfx } from '../../lib/audio';
import { GlitchText } from './GlitchText.jsx';

/*
 * START GAME PAGE (Figma: "START GAME PAGE")
 *
 * Only the TEXT lives here. The pink/violet rings behind it are NOT an image
 * — they're the real 3D black hole, viewed straight down its axis (see
 * CameraRig SHOT 1). That's what makes the transition possible: when START
 * is pressed this overlay fades out and the camera swoops away, revealing
 * the rings were the black hole all along.
 *
 *   - speaker icon (top)    toggles sound before you even begin
 *   - title                 glitches now and then; more on hover (GlitchText)
 *   - check + START >>>     begins the story (also unlocks browser audio)
 */
export default function StartScreen() {
  const phase = useStory((s) => s.phase);
  const soundOn = useStory((s) => s.soundOn);
  const toggleSound = useStory((s) => s.toggleSound);
  const begin = useStory((s) => s.begin);
  const [hover, setHover] = useState(false);

  const onStart = () => {
    playSfx('whoosh');
    begin();
  };

  return (
    <div className={`story story-fade ${phase === 'start' ? '' : 'story-hidden'}`}>
      <button
        className={`start-sound ${soundOn ? '' : 'muted'}`}
        onClick={toggleSound}
        aria-label={soundOn ? 'Mute sound' : 'Turn sound on'}
        aria-pressed={soundOn}
      >
        <span className="icon" />
      </button>

      <div className="start-center">
        <h1 className="start-title" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <GlitchText hovered={hover} segments={[{ text: 'READY TO ENTER' }]} />
          <br />
          <GlitchText
            hovered={hover}
            segments={[
              { text: 'RASH’S ' },
              { text: 'DOMAIN', color: 'var(--ui-pink)' },
              { text: '???', color: 'var(--ui-violet)' },
            ]}
          />
        </h1>

        <img className="start-check" src="/ui/check.svg" alt="" />
        <button className="start-button" onClick={onStart}>
          {'START\n>>>'}
        </button>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useStory } from '../store/useStory';

/*
 * ============================================================================
 * Audio — ambient loop + one-shot sound effects.
 * ============================================================================
 *
 * Files live in /public/audio/ (see the list below). Any file that's missing
 * just fails silently, so the site works with no audio at all until you add
 * the files.
 *
 * WHY NOTHING PLAYS UNTIL "START" IS CLICKED
 * Browsers block audio until the user interacts with the page. The START
 * button is that interaction, which is exactly why the storyboard opens with
 * a "game" start screen — it doubles as the audio unlock.
 */
const SOURCES = {
  ambient: '/audio/ambient.mp3', // long, seamless drone loop (the void)
  whoosh: '/audio/whoosh.mp3', // START pressed -> camera swoop
  door: '/audio/door.mp3', // shoes accepted -> heavy temple doors
  glitch: '/audio/glitch.mp3', // a project frame opens / text unscrambles
  click: '/audio/click.mp3', // small UI clicks (carousel, close)
};

const AMBIENT_VOLUME = 0.45;
const cache = {};

function get(name) {
  if (!cache[name]) {
    const a = new Audio(SOURCES[name]);
    a.preload = 'auto';
    if (name === 'ambient') {
      a.loop = true;
      a.volume = AMBIENT_VOLUME;
    }
    cache[name] = a;
  }
  return cache[name];
}

/** Fire-and-forget a sound effect (respects the sound toggle). */
export function playSfx(name, volume = 0.7) {
  if (!useStory.getState().soundOn) return;
  const a = get(name).cloneNode(); // clone so rapid repeats can overlap
  a.volume = volume;
  a.play().catch(() => {}); // missing file / blocked -> ignore
}

/**
 * Mount once (Landing.jsx). Starts the ambient loop when the story begins
 * and pauses/resumes it whenever the sound toggle flips.
 */
export function useSoundtrack() {
  useEffect(() => {
    const sync = (s) => {
      const ambient = get('ambient');
      const shouldPlay = s.soundOn && s.phase !== 'start';
      if (shouldPlay && ambient.paused) ambient.play().catch(() => {});
      if (!shouldPlay && !ambient.paused) ambient.pause();
    };
    sync(useStory.getState());
    return useStory.subscribe(sync);
  }, []);
}

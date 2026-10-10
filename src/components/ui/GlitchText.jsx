import { useEffect, useRef, useState } from 'react';

/*
 * ============================================================================
 * GlitchText + useScramble — the two text effects from the storyboard.
 * ============================================================================
 *
 * 1) GLITCH (start screen title)
 *    "the text in this layer has some text glitch effect as it mutates to a
 *     different character every now and then, but not enough to constrict
 *     visibility. also when mouse is on the text, the glitching happens more
 *     often"
 *
 *    How: a timer ticks every ~70ms. On each tick, with a small probability,
 *    1–2 random letters are swapped for a junk glyph for a split second, then
 *    restored. Hovering raises the probability. Only a couple of letters are
 *    ever wrong at once, so the words stay readable.
 *
 * 2) SCRAMBLE / UNSCRAMBLE (project modal)
 *    "as it focuses the words under unscramble in that glitch effect ...
 *     and reveal the title of the site, as well as a short description"
 *
 *    How: every letter starts as random junk; over `duration` ms they lock
 *    into the real text left-to-right, with the not-yet-locked ones still
 *    flickering. (Classic "decoder" effect.)
 *
 * Junk glyphs are plain ASCII on purpose: the font is monospaced, so swapping
 * a letter for "#" never changes the line width (no layout jitter).
 */
const GLYPHS = '!<>-_\\/[]{}=+*^?#%&@$~|01';
const randomGlyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

const TICK_MS = 70;
const IDLE_CHANCE = 0.08; // chance per tick that a glitch fires (idle)
const HOVER_CHANCE = 0.55; // ...while hovered
const GLITCH_HOLD_MS = 110; // how long a wrong letter stays wrong

/**
 * <GlitchText segments={[{ text: 'RASH’S ' }, { text: 'DOMAIN', color: 'pink' }]} />
 * Segments let differently colored words share one glitch timer.
 * `hovered` can be passed in by a parent so the whole block reacts.
 */
export function GlitchText({ segments, hovered = false }) {
  const full = segments.map((s) => s.text).join('');
  const [chars, setChars] = useState(() => full.split(''));
  const hoverRef = useRef(hovered);
  hoverRef.current = hovered;

  useEffect(() => {
    setChars(full.split(''));
    const timers = new Set();

    const interval = setInterval(() => {
      const chance = hoverRef.current ? HOVER_CHANCE : IDLE_CHANCE;
      if (Math.random() > chance) return;

      const count = hoverRef.current ? 2 : 1;
      for (let n = 0; n < count; n++) {
        const i = (Math.random() * full.length) | 0;
        if (full[i] === ' ' || full[i] === '\n') continue;
        setChars((prev) => {
          const next = prev.slice();
          next[i] = randomGlyph();
          return next;
        });
        const t = setTimeout(() => {
          timers.delete(t);
          setChars((prev) => {
            const next = prev.slice();
            next[i] = full[i];
            return next;
          });
        }, GLITCH_HOLD_MS);
        timers.add(t);
      }
    }, TICK_MS);

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [full]);

  // Slice the (possibly glitched) characters back into colored segments.
  let cursor = 0;
  return (
    <>
      {segments.map((seg, i) => {
        const text = chars.slice(cursor, cursor + seg.text.length).join('');
        cursor += seg.text.length;
        return seg.color ? (
          <span key={i} style={{ color: seg.color }}>
            {text}
          </span>
        ) : (
          <span key={i}>{text}</span>
        );
      })}
    </>
  );
}

/**
 * const shown = useScramble('TRACT - ...', isOpen, { duration: 900, delay: 400 })
 * Returns the in-progress string. Re-runs whenever `text` or `run` changes.
 */
export function useScramble(text, run, { duration = 900, delay = 0 } = {}) {
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (!run) return;
    let raf;
    let start = null;
    const scrambled = () => text.replace(/\S/g, () => randomGlyph());
    setOut(scrambled());

    const step = (now) => {
      if (start === null) start = now + delay;
      const p = Math.max(0, Math.min(1, (now - start) / duration));
      const locked = Math.floor(p * text.length);
      let s = '';
      for (let i = 0; i < text.length; i++) {
        s += i < locked || text[i] === ' ' ? text[i] : randomGlyph();
      }
      setOut(s);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [text, run, duration, delay]);

  return out;
}

import { useEffect } from 'react';
import { useScroll } from '@react-three/drei';
import { useStory } from '../../store/useStory';
import { GATE, HALL_ENTRY } from '../../constants/scene';

/*
 * ============================================================================
 * ScrollDirector — the "stage manager" for the scroll.
 * ============================================================================
 *
 * Renders nothing. It reaches into the invisible scroll <div> that drei's
 * <ScrollControls> created (scroll.el) and enforces the story rules:
 *
 *   1. LOCK — during the start screen, the intro flight, any modal, or while
 *      a project is open, the div gets overflow:hidden so the wheel does
 *      nothing. (drei's own `enabled` prop only stops *reading* the scroll;
 *      the div would still move and the camera would jump when re-enabled.)
 *
 *   2. THE GATE — the scroll position is physically clamped at GATE:
 *        - outside (shoes on):  can't scroll PAST it. Arriving there opens
 *                               "TO ENTER YOU MUST TAKE OFF YOUR SHOES."
 *        - inside  (shoes off): can't scroll BACK past it. Sitting there for
 *                               a moment opens "GOING BACK? DON'T FORGET
 *                               YOUR SHOES".
 *
 *   3. ZONE — publishes a coarse 'top' | 'mid' | 'end' to the store so the DOM
 *      HUD knows when to show "> SCROLL TO ENTER" and the scroll cue.
 *
 *   4. AUTO-WALK — after accepting, we smooth-scroll a little for the user so
 *      the camera glides through the doorway (or back out of it) on its own.
 *      That one unprompted move is what makes it feel cinematic.
 */

// How long you have to linger at the gate (from inside) before the "going
// back?" prompt appears. Prevents it popping up on a quick scroll bounce.
const LEAVE_DWELL_MS = 900;

export default function ScrollDirector() {
  const scroll = useScroll();

  useEffect(() => {
    const el = scroll.el;
    let dwellTimer = null;

    // Pixel helpers: convert a 0→1 offset into scrollTop and back.
    const maxTop = () => el.scrollHeight - el.clientHeight;
    const toPx = (offset) => offset * maxTop();
    const gatePx = () => toPx(GATE);

    const onScroll = () => {
      const { phase, shoesOff, modal, zone, setZone } = useStory.getState();
      const offset = el.scrollTop / maxTop();
      const nextZone = offset < 0.015 ? 'top' : offset > 0.995 ? 'end' : 'mid';
      if (nextZone !== zone) setZone(nextZone);

      if (phase !== 'explore' || modal) return;
      const top = el.scrollTop;
      const g = gatePx();

      if (!shoesOff) {
        // OUTSIDE: clamp at the gate, ask for shoes once you reach it.
        if (top >= g - 2) {
          if (top > g) el.scrollTop = g;
          useStory.getState().openModal('shoes');
        }
      } else {
        // INSIDE: clamp at the gate, ask "going back?" after a short dwell.
        if (top < g) el.scrollTop = g;
        if (top <= g + 4) {
          if (!dwellTimer) {
            dwellTimer = setTimeout(() => {
              dwellTimer = null;
              const s = useStory.getState();
              if (s.shoesOff && !s.modal && el.scrollTop <= gatePx() + 4) s.openModal('leaving');
            }, LEAVE_DWELL_MS);
          }
        } else if (dwellTimer) {
          clearTimeout(dwellTimer);
          dwellTimer = null;
        }
      }
    };

    // Lock/unlock + auto-walk react to store changes (not scroll events).
    const applyLock = (s) => {
      const locked = s.phase !== 'explore' || s.modal || s.activeProject;
      el.style.overflowY = locked ? 'hidden' : 'auto';
    };
    applyLock(useStory.getState());

    const unsubscribe = useStory.subscribe((s, prev) => {
      applyLock(s);

      // Just accepted the shoes modal -> glide through the doors.
      if (s.shoesOff && !prev.shoesOff) {
        el.scrollTo({ top: toPx(GATE + (1 - GATE) * HALL_ENTRY * 1.4), behavior: 'smooth' });
      }
      // Just accepted the "going back" modal -> glide back out, away from the doors.
      if (!s.shoesOff && prev.shoesOff) {
        el.scrollTo({ top: toPx(GATE * 0.82), behavior: 'smooth' });
      }
      // Dismissed a gate modal WITHOUT accepting (Esc / X) -> back off from
      // the gate so it doesn't immediately re-trigger on the next scroll tick.
      if (prev.modal && !s.modal && s.shoesOff === prev.shoesOff) {
        const backOff = s.shoesOff ? GATE + (1 - GATE) * HALL_ENTRY * 1.4 : GATE * 0.9;
        el.scrollTo({ top: toPx(backOff), behavior: 'smooth' });
      }
    });

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      unsubscribe();
      clearTimeout(dwellTimer);
    };
  }, [scroll]);

  return null;
}


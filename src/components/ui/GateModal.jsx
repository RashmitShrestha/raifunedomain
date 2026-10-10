import { useEffect } from 'react';
import { useStory } from '../../store/useStory';
import { playSfx } from '../../lib/audio';

/*
 * THE SHOES GATE (Figma: "FULLY SCROLLED TO ENTERANCE" and
 *                 "FULLY SCROLLED BACK TO ENTERANCE (and stayed for a bit)")
 *
 * One component, two messages:
 *   'shoes'   — reached the open doors from outside
 *   'leaving' — lingered at the doors from inside, heading back out
 *
 * ScrollDirector opens it (and clamps the scroll so you can't slip past).
 * ACCEPT flips `shoesOff` and the director auto-glides the camera through
 * the doorway. Esc dismisses without accepting (you back away from the door).
 * Taking your shoes off before entering a temple is a real Nepali custom —
 * a nice cultural beat for the story.
 */
const COPY = {
  shoes: 'TO ENTER YOU MUST TAKE OFF YOUR SHOES.',
  leaving: 'GOING BACK? DON’T FORGET YOUR SHOES',
};

export default function GateModal() {
  const modal = useStory((s) => s.modal);
  const acceptGate = useStory((s) => s.acceptGate);
  const closeModal = useStory((s) => s.closeModal);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'Enter') onAccept();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!modal) return null;

  function onAccept() {
    playSfx('door');
    acceptGate();
  }

  return (
    <div className="story">
      <div className="gate-backdrop" onClick={(e) => e.target === e.currentTarget && closeModal()}>
        <div className="gate-card" role="dialog" aria-modal="true" aria-labelledby="gate-msg">
          <p id="gate-msg" className="gate-warning">
            {COPY[modal]}
          </p>
          <img className="gate-check" src="/ui/check-small.svg" alt="" />
          <button className="gate-accept" onClick={onAccept} autoFocus>
            ACCEPT?
            <br />
            &gt;&gt;&gt;
          </button>
        </div>
      </div>
    </div>
  );
}

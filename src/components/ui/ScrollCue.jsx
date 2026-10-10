import { useStory } from '../../store/useStory';

/*
 * The little "scroll ▽" at the bottom of every scroll-driven screen.
 * Hidden on the start screen, during the intro, while any dialog is open,
 * and once you've reached the very end of the hallway.
 */
export default function ScrollCue() {
  const show = useStory(
    (s) => s.phase === 'explore' && !s.modal && !s.activeProject && s.zone !== 'end'
  );
  return (
    <div className={`story story-fade ${show ? '' : 'story-hidden'}`} aria-hidden="true">
      <div className="scroll-cue">
        <span>scroll</span>
        <img src="/ui/scroll-chevron.svg" alt="" />
      </div>
    </div>
  );
}

import { create } from 'zustand';

/*
 * ============================================================================
 * useStory — the global "where are we in the story" store.
 * ============================================================================
 *
 * The 3D scene (inside <Canvas>) and the DOM overlays (outside it) live in
 * two different React trees, so they can't share state through props. A tiny
 * zustand store bridges them: any component can read/write it.
 *
 *   phase
 *     'start'    — START GAME PAGE. Camera stares straight down the black
 *                  hole's axis so the accretion disk reads as flat rings.
 *                  Scrolling is locked.
 *     'intro'    — TRANSITION. Camera swings around ~4s, revealing the rings
 *                  were the black hole seen from above, with the temple below.
 *     'explore'  — the scroll-driven experience (exterior + hallway).
 *
 *   modal       — which blocking dialog is open (null | 'shoes' | 'leaving')
 *   shoesOff    — true once you've accepted at the gate (you're "inside").
 *   activeProject — id of the frame you clicked, or null. Drives both the
 *                  camera focus move and the ProjectModal.
 *   zone        — coarse scroll position for the DOM HUD, which can't read
 *                  drei's scroll directly: 'top' | 'mid' | 'end'.
 *
 * Inside useFrame (60×/sec) read with useStory.getState() instead of the hook,
 * so the 3D components don't re-render every time something changes.
 */
export const useStory = create((set) => ({
  phase: 'start',
  soundOn: true,
  modal: null,
  shoesOff: false,
  activeProject: null,
  zone: 'top',

  begin: () => set({ phase: 'intro' }),
  finishIntro: () => set({ phase: 'explore' }),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),

  openModal: (modal) => set({ modal }),
  /** Accept at the gate: flips whether you're inside or outside. */
  acceptGate: () => set((s) => ({ modal: null, shoesOff: !s.shoesOff })),
  closeModal: () => set({ modal: null }),

  openProject: (id) => set({ activeProject: id }),
  closeProject: () => set({ activeProject: null }),

  setZone: (zone) => set({ zone }),
}));

/*
 * ============================================================================
 * Projects — the content that lines the hallway.
 * ============================================================================
 *
 * Mirrors docs/projects.md. Each entry becomes ONE glowing frame on the
 * hallway walls (see Hallway.jsx) and ONE project modal (ProjectModal.jsx).
 * The LAST entry is hung on the back wall — "the end of the hallway".
 *
 * Fields:
 *   id          unique slug (used as a React key + store id)
 *   title       shown above the frame in the modal (unscrambles on open)
 *   description pink text under the frame (unscrambles on open)
 *   tech        list of pills under the description
 *   url         where "VISIT SITE" goes. Leave '' to hide the popup.
 *   images      screenshots, served from /public. e.g. '/projects/tract-1.png'
 *               - 0 images  -> a procedural neon-squiggle placeholder is drawn
 *               - 1 image   -> single framed screenshot
 *               - 2+ images -> carousel with < > arrows and dots
 *               The FIRST image is also used as the frame texture in 3D.
 *
 * TODO(rash): fill in the blanks + drop screenshots into public/projects/.
 */
export const PROJECTS = [
  {
    id: 'tract',
    title: 'TRACT - Transportation Research Action Cooperative Tracker',
    description:
      'A website connecting automated legislative transportation data in a responsive dashboard, demystifying policy for researchers at UC ITS (the University of California, Institute of Transportation Studies)',
    tech: ['javascript', 'python', 'react.js', 'next.js', 'airtable', 'google cloud platform'],
    url: '',
    images: [],
  },
  { id: 'orbit', title: 'Orbit', description: 'Description coming soon.', tech: [], url: '', images: [] },
  { id: 'uvaurem', title: 'Uvaurem', description: 'Description coming soon.', tech: [], url: '', images: [] },
  { id: 'revenue-route', title: 'Revenue Route', description: 'Description coming soon.', tech: [], url: '', images: [] },
  { id: 'goatvzn', title: 'GOATvzn', description: 'Description coming soon.', tech: [], url: '', images: [] },
  { id: 'gmo', title: 'GMO', description: 'Description coming soon.', tech: [], url: '', images: [] },
  { id: 'pioneer', title: 'Pioneer', description: 'Description coming soon.', tech: [], url: '', images: [] },
  { id: 'uc-its', title: 'UC ITS Site', description: 'Description coming soon.', tech: [], url: '', images: [] },
  { id: 'stylizer', title: 'The Stylizer', description: 'Description coming soon.', tech: [], url: '', images: [] },
  // Last entry = back wall at the end of the hallway.
  { id: 'roc', title: 'ROC Studios', description: 'Description coming soon.', tech: [], url: '', images: [] },
];

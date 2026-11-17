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
 *   tech        "technologies" pills under the description
 *   tags        "tags" pills under the tech. Colors for both: pillColors.js
 *   url         where "VISIT SITE" goes. Leave '' to hide the popup.
 *   images      screenshots, served from /public. e.g. '/projects/tract_1.png'
 *               - 0 images  -> a procedural neon-squiggle placeholder is drawn
 *               - 1 image   -> single framed screenshot
 *               - 2+ images -> carousel with < > arrows and dots
 *               The FIRST image (the `_1` file) is also the frame texture in 3D.
 *               Only list files that actually exist — a missing path
 *               shows up as a blank slide in the carousel.
 *
 * TODO(rash): fill in the blanks + drop screenshots into public/projects/.
 */
export const PROJECTS = [
  {
    id: 'tract',
    title: 'TRACT - Transportation Research Action Cooperative Tracker',
    description:
      'A transportation-based legislative tracker dashboard created for researchers at UC ITS (the University of California, Institute of Transportation Studies).',
    tech: ['javascript', 'python', 'react.js', 'next.js', 'airtable', 'google cloud platform'],
    tags: ['web development', 'cloud platforming', 'machine learning'],
    url: 'https://legbilltracking.vercel.app/',
    images: ['/projects/tract_1.png', '/projects/tract_2.png', '/projects/tract_3.png', '/projects/tract_4.png'],
  },
  {
    id: 'orbit',
    title: 'Orbit',
    description:
      'A social activity discovery platform for college students. Orbit connects students through shared interests by combining scheduled events (set missions), spontaneous hangouts (flex missions), and small-group coordination through pods — all wrapped in a galaxy-themed interface.',
    tech: ['swift', 'python', 'xcode', 'google cloud platform', 'firestore', 'adobe suite'],
    tags: ['group', 'design', 'web development', 'mobile development', 'machine learning'],
    url: 'https://orbitgalaxy-dusky.vercel.app/',
    images: ['/projects/orbit_1.png', '/projects/orbit_2.png', '/projects/orbit_3.png', '/projects/orbit_4.png'],
  },
  {
    id: 'uvaurem',
    title: 'Uvaurem',
    description:
      'A productivity timer based on psychology research on focus and efficiency. Utilizes phase-based time setting, advanced task management systems, and machine learning-based progress tracking.',
    tech: ['next.js', 'typescript'],
    tags: ['web development', 'design'],
    url: 'https://uvaurem.vercel.app/',
    images: [],
  },
  {
    id: 'goatvzn',
    title: 'GOATvzn',
    description:
      'A dashboard used by the American Dairy Goat Association to train goat appraisers on dairy goat mammary systems, working towards a consistent and normalized distribution of mammary metrics.',
    tech: ['r', 'shiny', 'tidyverse', 'magick'],
    tags: ['group', 'web development'],
    url: 'https://github.com/datalab-dev/2026_startup_goats',
    images: ['/projects/goatvzn_1.png', '/projects/goatvzn_2.png', '/projects/goatvzn_3.png'],
  },
  {
    id: 'gmo',
    title: 'GMO',
    description:
      "For UCD's course ECS 179, a top-down third-person slasher game built on wave-based upgrades and a fully functional elemental system. Complete with a trailer kit, music/sound effects, and custom character sprites.",
    tech: ['godot', 'gdscript', 'fl studio', 'adobe suite'],
    tags: ['group', 'game development', 'design', 'music'],
    // TODO(rash): docs had the GOATvzn repo link here — add GMO's real link.
    url: '',
    images: ['/projects/gmo_1.png', '/projects/gmo_2.png', '/projects/gmo_3.png', '/projects/gmo_4.png'],
  },
  {
    id: 'pioneer',
    title: 'Pioneer',
    description:
      'A student-run startup focused on providing a platform where college students can share, discover, and post about hidden spots in their area. I worked on the app development and utilizing GIS-based methodologies.',
    tech: ['react native', 'typescript', 'figma', 'expo', 'mapbox api'],
    tags: ['group', 'mobile development', 'web development'],
    url: 'https://pioneer-davis.vercel.app/',
    images: ['/projects/pioneer_1.jpg', '/projects/pioneer_2.jpg', '/projects/pioneer_3.jpg', '/projects/pioneer_4.jpg'],
  },
  {
    id: 'uc-its',
    title: 'UC ITS Site',
    description:
      'An informational website for the UC Institute of Transportation Studies. Collaborated with a web-design agency over Figma to discuss optimal UI/UX strategies for the official UC ITS website.',
    tech: ['wordpress', 'figma'],
    tags: ['group', 'web development', 'design'],
    url: 'https://ucits.org/',
    images: [],
  },
  {
    id: 'stylizer',
    title: 'The Stylizer',
    description:
      'For ECS 164, the human-computer interaction course at UC Davis, my group and I designed an AI-powered wardrobe app, analyzing its UI/UX designs and conducting rounds of user interviews. We presented a video of the project with a demo, and engaged in Q&A with the audience.',
    tech: ['figma', 'adobe illustrator', 'adobe after effects'],
    tags: ['group', 'design'],
    url: '',
    images: [],
  },
  // Last entry = back wall at the end of the hallway.
  {
    id: 'roc',
    title: 'ROC Studios',
    description:
      'My design studio; creating works of wearable, viewable, hearable art, depicting the innate human quality of living to create a legacy through art and self-expression.',
    tech: ['adobe suite', 'fl studio'],
    tags: ['design', 'music'],
    url: '',
    images: [],
  },
];

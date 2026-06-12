# raifune — three.js portfolio

A React + three.js portfolio piece. The landing page renders the **Combined
Scene** from [`docs/personalBrand.md`](docs/personalBrand.md): a futuristic
ancient Nepali temple in the foreground, silhouetted by a black-hole "sun" in
the background that bleeds red & blue light across the void.

## Stack

- **React 18** + **Vite** — app shell & tooling
- **@react-three/fiber** — React renderer for three.js
- **@react-three/drei** — helpers (OrbitControls, Stars, Edges, useProgress…)
- **@react-three/postprocessing** — bloom + vignette for the neon glow

## Getting started

```bash
npm install
npm run dev     # http://localhost:5173
```

```bash
npm run build   # production bundle into dist/
npm run preview # serve the production build
```

## Project layout

```
src/
  main.jsx                 app entry
  App.jsx                  routes to the Landing page
  constants/brand.js       palette + motifs lifted from personalBrand.md
  styles/                  global.css + theme.js (DOM tokens)
  pages/Landing.jsx        scene layer + UI layer composition
  components/
    ui/                    Navbar, Hero, Loader (DOM, sits over the canvas)
    three/
      Experience.jsx       <Canvas>: camera, fog, controls, composition
      BlackHoleSun.jsx     event horizon + glowing accretion disk (background)
      Temple.jsx           tiered pagoda, neon edges, torches, prayer flags
      Starfield.jsx        sparkle-star void
      Lighting.jsx         red key (the sun) + blue/cyan rim lights
      Effects.jsx          bloom + vignette
```

## Brand palette

| token  | hex       | use                        |
| ------ | --------- | -------------------------- |
| pink   | `#ff075e` | accretion disk, hero glow  |
| maroon | `#7f0000` | corona                     |
| violet | `#5900ff` | outer disk, fill light     |
| cyan   | `#4cffe7` | torches, spire, finial     |

## Status

Template / scaffold. The scene is fully procedural (no external 3D assets yet)
so it runs out of the box. Future passes: dithering on interaction, hanging
masks, GLTF temple model, scroll-driven sections.

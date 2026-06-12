# Frontend / 3D Pipeline Notes

How to take the procedural scaffold from "simple primitives" to a polished,
complex three.js portfolio piece. "Complex" comes from **four layers stacking
up** — not just the 3D model. Yes, Blender is part of it, but it's only layer 1.

---

## 1. Geometry — Blender → glTF

This is where Blender comes in. Model the temple (or buy/remix one), then export
as **`.glb`** (glTF binary — the web-native 3D format). You don't hand-write
geometry like the current `Temple.jsx` does with boxes.

R3F-specific trick: run the `.glb` through **`gltfjsx`**, which auto-generates a
React component from the model:

```bash
npx gltfjsx temple.glb --transform
```

- `--transform` also compresses it (Draco / meshopt) so a 40 MB model ships as
  ~2 MB.
- Then `useGLTF('/temple.glb')` drops it into the existing scene — `Temple.jsx`
  becomes a thin wrapper around the loaded mesh.

**You don't have to model from scratch.** Most portfolio pieces remix assets,
then tweak in Blender:

- **Sketchfab** — huge model library (check license).
- **Quixel Megascans** — free with an Epic account.
- **Poly Haven** — CC0 models + HDRIs + textures, no attribution required.

## 2. Materials & texturing — the biggest visual jump

A box with a flat color reads as "simple" no matter how good the lighting is.
Real surfaces use **PBR texture sets**:

- color / albedo
- normal
- roughness
- metalness
- ambient occlusion (AO)

A weathered-stone-with-neon-inlay temple is ~90% texturing, ~10% geometry.

- Bake maps in Blender, paint in **Substance Painter**, or grab tileable sets
  from Poly Haven.
- An **HDRI environment map** (also Poly Haven) for image-based lighting is the
  single highest-leverage upgrade — it makes metal and stone read as real
  instantly. In R3F: `<Environment />` from drei.

## 3. Custom shaders — where the black hole gets its "wow"

The current disk is just additive rings. A _real_ black hole needs a **GLSL
shader**:

- raymarched accretion disk
- gravitational lensing (light bending around the horizon)
- Doppler beaming (one side brighter than the other)

In R3F, write these with:

- raw `shaderMaterial`, or — more pleasantly —
- **TSL** (Three's node-based shader language), or
- `@react-three/lamina` for layered materials.

Highest-effort / highest-payoff item for this specific scene.

## 4. Post-processing & detail passes

Already have **bloom + vignette**. Complex scenes layer on more, all via the
`@react-three/postprocessing` stack already installed:

- **dithering** (it's in `personalBrand.md` — it's a postprocessing shader pass)
- depth-of-field
- chromatic aberration
- film grain
- god-rays from the sun

---

## Recommended priority for this piece

| Goal              | Tool                                       | Effort                       |
| ----------------- | ------------------------------------------ | ---------------------------- |
| Detailed temple   | Blender (model/remix) → `.glb` → `gltfjsx` | high, but assets exist       |
| Realistic surface | HDRI + PBR textures (Poly Haven)           | **low effort, huge payoff**  |
| Killer black hole | Custom GLSL / TSL shader                   | high, but it's the signature |
| Dithering, masks, eyes | postprocessing shader passes          | medium                       |

**Suggested order:** start with the **HDRI + shader-based black hole** before
the Blender model. They transform the _mood_ (which is what `personalBrand.md`
is about) faster than a high-poly temple does, and they don't require leaving
the codebase.

---

## Concrete next steps (codebase)

- **A) `useGLTF` loading slot** — so a Blender `.glb` drops in and renders; keep
  the procedural temple as fallback.
- **B) Raymarched black-hole shader** — replace the additive rings in
  `BlackHoleSun.jsx`.
- **C) HDRI environment + PBR material pass** — upgrade the existing temple's
  surfaces.

## Asset sources (quick reference)

- **Poly Haven** — CC0 HDRIs, textures, models. Best default.
- **Quixel Megascans** — photoscanned assets, free w/ Epic account.
- **Sketchfab** — community models (check license per asset).
- **ambientCG** — CC0 PBR material library.

## Tooling reference

- `@react-three/fiber` — React renderer for three.js (installed)
- `@react-three/drei` — helpers: `useGLTF`, `Environment`, `OrbitControls`,
  `Stars`, `Edges`, `useProgress` (installed)
- `@react-three/postprocessing` — bloom, vignette, DOF, etc. (installed)
- `gltfjsx` — `npx gltfjsx model.glb --transform` (no install needed)
- **Blender** — modeling + map baking + glTF export
- **Substance Painter** — texture painting (optional, paid)
- **TSL / `@react-three/lamina`** — node-based / layered shader authoring

import { theme } from '../../styles/theme';

export default function Hero() {
  return (
    <header
      style={{
        position: 'absolute',
        left: '2.4rem',
        bottom: '3rem',
        maxWidth: '34rem',
      }}
    >
      <p
        style={{
          fontFamily: theme.font.mono,
          fontSize: '0.78rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: theme.colors.cyan,
          marginBottom: '1rem',
          textShadow: theme.glow.cyan,
        }}
      >
        ancient · future · divine
      </p>

      <h1
        style={{
          fontFamily: theme.font.display,
          fontWeight: 700,
          fontSize: 'clamp(2.4rem, 6vw, 4.6rem)',
          lineHeight: 0.98,
          textShadow: theme.glow.pink,
        }}
      >
        divinity
        <br />
        in the dark.
      </h1>

      <p
        style={{
          marginTop: '1.2rem',
          fontSize: '1rem',
          lineHeight: 1.55,
          opacity: 0.82,
          maxWidth: '28rem',
        }}
      >
        A temple at the edge of a collapsing sun — neon prayer, Y2K horror, and
        the quiet pull of the void.
      </p>

      {/* Scroll cue — the journey is scroll-driven (see CameraRig.jsx). */}
      <div
        style={{
          marginTop: '1.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.7rem',
          fontFamily: theme.font.mono,
          fontSize: '0.8rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: theme.colors.cyan,
          textShadow: theme.glow.cyan,
        }}
      >
        <span>scroll to enter</span>
        <span style={{ animation: 'bob 1.6s ease-in-out infinite' }}>↓</span>
      </div>
    </header>
  );
}

import { theme } from '../../styles/theme';

const links = ['work', 'about', 'contact'];

export default function Navbar() {
  return (
    <nav
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.6rem 2.4rem',
        mixBlendMode: 'screen',
      }}
    >
      <a
        href="#"
        style={{
          fontFamily: theme.font.mono,
          fontWeight: 700,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          fontSize: '0.95rem',
          textShadow: theme.glow.cyan,
        }}
      >
        raifune
      </a>

      <ul
        style={{
          display: 'flex',
          gap: '1.8rem',
          listStyle: 'none',
          fontFamily: theme.font.mono,
          fontSize: '0.8rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        {links.map((l) => (
          <li key={l}>
            <a href={`#${l}`} style={{ opacity: 0.8 }}>
              {l}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

import { useProgress } from '@react-three/drei';
import { theme } from '../../styles/theme';

/**
 * DOM overlay loader driven by drei's global asset-load progress.
 * Fades out (and stops blocking pointer events) once everything is ready.
 */
export default function Loader() {
  const { active, progress } = useProgress();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.colors.void,
        gap: '1rem',
        opacity: active ? 1 : 0,
        pointerEvents: active ? 'auto' : 'none',
        transition: 'opacity 0.8s ease 0.2s',
      }}
    >
      <span
        style={{
          fontFamily: theme.font.mono,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          fontSize: '0.8rem',
          color: theme.colors.cyan,
          textShadow: theme.glow.cyan,
        }}
      >
        summoning the void
      </span>

      <div
        style={{
          width: '180px',
          height: '2px',
          background: '#ffffff14',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: theme.colors.pink,
            boxShadow: theme.glow.pink,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}

import type { CSSProperties } from 'react';
import jeyFox from '../assets/jey-fox.png';
import './JeyCelebration.css';

type JeyCelebrationProps = {
  message: string;
  onDone: () => void;
};

const confettiPieces = Array.from({ length: 18 }, (_, index) => index);

type ConfettiStyle = CSSProperties & {
  '--hue': number;
  '--spin': string;
  '--x': string;
  '--y': string;
};

function createConfettiStyle(piece: number): ConfettiStyle {
  return {
    '--hue': piece * 38,
    '--spin': `${piece * 55}deg`,
    '--x': `${(piece - 8.5) * 20}px`,
    '--y': `${-92 - (piece % 5) * 12}px`,
  };
}

export function JeyCelebration({ message, onDone }: JeyCelebrationProps) {
  return (
    <section className="jey-celebration" aria-label={message}>
      <div
        className="jey-celebration__stage"
        onAnimationEnd={(event) => {
          if (event.animationName === 'celebration-leave') onDone();
        }}
      >
        <div className="jey-celebration__popper" aria-hidden="true">
          {confettiPieces.map((piece) => (
            <span key={piece} style={createConfettiStyle(piece)} />
          ))}
        </div>
        <p className="jey-celebration__bubble">{message}</p>
        <img alt="Jey celebrates registration" src={jeyFox} />
      </div>
    </section>
  );
}

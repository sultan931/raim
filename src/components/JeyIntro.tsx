import jeyFox from '../assets/jey-fox.png';
import './JeyIntro.css';

type JeyIntroProps = {
  onDone: () => void;
};

export function JeyIntro({ onDone }: JeyIntroProps) {
  return (
    <section
      className="jey-intro"
      aria-label="Jey welcome screen"
      onAnimationEnd={(event) => {
        if (event.currentTarget === event.target) onDone();
      }}
    >
      <div className="jey-intro__stage">
        <img alt="Jey" className="jey-intro__image" src={jeyFox} />
        <div className="jey-intro__bubble">hello</div>
      </div>
    </section>
  );
}

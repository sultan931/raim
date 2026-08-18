import jeyFox from '../assets/jey-fox.png';
import './GrowthCard.css';

const traits = [
  { label: 'Ум', icon: '?', tone: 'mind' },
  { label: 'Душа', icon: '✦', tone: 'soul' },
  { label: 'Тело', icon: '歩', tone: 'body' },
];

export function GrowthCard() {
  return (
    <section className="growth-card" aria-label="Fox progress">
      <h1>Фокс растёт</h1>
      <p>уровень 6</p>

      <div className="growth-orbit" aria-hidden="true">
        <span className="growth-orbit__arc growth-orbit__arc--mind" />
        <span className="growth-orbit__arc growth-orbit__arc--soul" />
        <span className="growth-orbit__arc growth-orbit__arc--body" />
        <span className="growth-orbit__dot growth-orbit__dot--mind" />
        <span className="growth-orbit__dot growth-orbit__dot--soul" />
        <span className="growth-orbit__dot growth-orbit__dot--body" />
        <img alt="Jey fox avatar" src={jeyFox} />
      </div>

      <div className="trait-grid">
        {traits.map((trait) => (
          <div className={`trait trait--${trait.tone}`} key={trait.label}>
            <div className="trait__orb" aria-hidden="true">{trait.icon}</div>
            <strong>{trait.label}</strong>
            <span aria-label={`${trait.label}: zero stars`}>★★★★★</span>
          </div>
        ))}
      </div>

      <button className="mission-button" type="button">
        <span className="mission-button__flag" aria-hidden="true" />
        Выбрать задание
      </button>
    </section>
  );
}

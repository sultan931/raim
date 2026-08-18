import './WeeklyMission.css';

export function WeeklyMission() {
  return (
    <section className="weekly-mission" aria-label="Weekly mission">
      <div className="weekly-mission__badge" aria-hidden="true" />
      <div>
        <p>Миссия недели</p>
        <strong>Расскажи о моменте, которым ты гордишься</strong>
      </div>
    </section>
  );
}

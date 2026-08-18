import './DashboardStats.css';

const stats = [
  { value: '725', label: 'монеты', hint: 'на награды', tone: 'coins' },
  { value: '1', label: 'серия', hint: 'день', tone: 'streak' },
  { value: '0', label: 'за неделю', hint: 'квестов', tone: 'week' },
];

export function DashboardStats() {
  return (
    <section className="dashboard-stats" aria-label="Progress statistics">
      {stats.map((stat) => (
        <article className={`stat-tile stat-tile--${stat.tone}`} key={stat.label}>
          <span className="stat-tile__icon" aria-hidden="true" />
          <strong>{stat.value}</strong>
          <p>{stat.label}</p>
          <small>{stat.hint}</small>
        </article>
      ))}
    </section>
  );
}

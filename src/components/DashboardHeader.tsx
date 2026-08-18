import './DashboardHeader.css';

type DashboardHeaderProps = {
  name: string;
};

export function DashboardHeader({ name }: DashboardHeaderProps) {
  return (
    <header className="dashboard-header" aria-label="Dashboard header">
      <div className="dashboard-header__profile" aria-hidden="true">R</div>
      <p>Привет, {name}</p>
      <div className="dashboard-header__actions">
        <button className="dashboard-header__button" type="button" aria-label="Notifications">
          <span className="dashboard-header__bell" />
        </button>
        <button className="dashboard-header__button" type="button" aria-label="Sound">
          <span className="dashboard-header__sound" />
        </button>
      </div>
    </header>
  );
}

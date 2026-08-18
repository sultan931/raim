import { DashboardHeader } from './DashboardHeader';
import { DashboardStats } from './DashboardStats';
import { GrowthCard } from './GrowthCard';
import { WeeklyMission } from './WeeklyMission';

export function HomeDashboard() {
  return (
    <section className="dashboard-shell" aria-label="Jey dashboard">
      <DashboardHeader name="Rayimbek" />
      <GrowthCard />
      <DashboardStats />
      <WeeklyMission />
    </section>
  );
}

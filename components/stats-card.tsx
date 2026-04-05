import { UiIcon, type IconName } from "./ui-icon";

type StatsCardProps = {
  label: string;
  value: string;
  helper: string;
  icon?: IconName;
};

export function StatsCard({ label, value, helper, icon = "dashboard" }: StatsCardProps) {
  return (
    <article className="stats-card">
      <div className="stats-card-top">
        <span className="stats-icon">
          <UiIcon height={18} name={icon} width={18} />
        </span>
        <p>{label}</p>
      </div>
      <strong>{value}</strong>
      <span>{helper}</span>
    </article>
  );
}

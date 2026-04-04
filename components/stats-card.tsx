type StatsCardProps = {
  label: string;
  value: string;
  helper: string;
};

export function StatsCard({ label, value, helper }: StatsCardProps) {
  return (
    <article className="stats-card">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{helper}</span>
    </article>
  );
}

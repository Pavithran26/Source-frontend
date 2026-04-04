type HeaderProps = {
  title: string;
  subtitle: string;
};

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="hero-card">
      <p className="eyebrow">Attendance Control Center</p>
      <h1>{title}</h1>
      <p className="hero-copy">{subtitle}</p>
    </div>
  );
}

import Link from "next/link";

import { UiIcon, type IconName } from "./ui-icon";

type ModuleItem = {
  title: string;
  description: string;
  icon: IconName;
  href?: string;
  status?: "ready" | "planned";
};

type ModuleGridProps = {
  items: ModuleItem[];
};

export function ModuleGrid({ items }: ModuleGridProps) {
  return (
    <div className="module-grid">
      {items.map((item) => {
        const status = item.status ?? (item.href ? "ready" : "planned");
        const content = (
          <>
            <span className="module-icon">
              <UiIcon height={22} name={item.icon} width={22} />
            </span>
            <div className="module-copy">
              <div className="module-meta">
                <h3>{item.title}</h3>
                <span className={`module-status module-status-${status}`}>{status === "ready" ? "Live" : "Planned"}</span>
              </div>
              <p>{item.description}</p>
            </div>
          </>
        );

        if (item.href) {
          return (
            <Link key={item.title} className="module-card" href={item.href}>
              {content}
            </Link>
          );
        }

        return (
          <article key={item.title} className="module-card is-muted">
            {content}
          </article>
        );
      })}
    </div>
  );
}

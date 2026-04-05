"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SectionTab = {
  href: string;
  label: string;
};

type SectionTabsProps = {
  tabs: SectionTab[];
};

export function SectionTabs({ tabs }: SectionTabsProps) {
  const pathname = usePathname();

  return (
    <nav className="section-tabs" aria-label="Section navigation">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          className={pathname === tab.href ? "section-tab is-active" : "section-tab"}
          href={tab.href}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

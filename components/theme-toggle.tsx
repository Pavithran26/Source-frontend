"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MdLightMode, MdDarkMode, MdSettingsSuggest } from "react-icons/md";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="icon-button" type="button" aria-label="Toggle theme">
        <MdLightMode size={20} />
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getIcon = () => {
    if (theme === "light") return <MdLightMode size={20} />;
    if (theme === "dark") return <MdDarkMode size={20} />;
    return <MdSettingsSuggest size={20} />;
  };

  const getLabel = () => {
    if (theme === "light") return "Switch to Dark Mode";
    if (theme === "dark") return "Switch to System Mode";
    return "Switch to Light Mode";
  };

  return (
    <button
      className="icon-button"
      type="button"
      onClick={cycleTheme}
      title={getLabel()}
      aria-label={getLabel()}
      style={{ color: "var(--brand)" }}
    >
      {getIcon()}
    </button>
  );
}

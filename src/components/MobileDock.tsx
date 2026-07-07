import type { ReactNode } from "react";
import { useTheme } from "../context/ThemeContext";
import { getThemeTokens } from "../lib/themeToken";
import { mono } from "./BlogLayout";

export interface DockItem {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// Floating bottom navigation for small screens only — each page hands it
// the actions that make sense there (the desktop top nav does these jobs
// on wide screens, so the dock never renders there).
export default function MobileDock({ items }: { items: DockItem[] }) {
  const { theme } = useTheme();
  const { border, navBg, subtext } = getThemeTokens(theme);

  return (
    <nav
      aria-label="Quick navigation"
      className={`sm:hidden fixed bottom-4 inset-x-4 z-50 rounded-2xl border ${border} ${navBg} backdrop-blur shadow-lg`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around">
        {items.map((it) => (
          <button
            key={it.label}
            onClick={it.onClick}
            disabled={it.disabled}
            aria-label={it.label}
            className={`flex flex-1 flex-col items-center gap-1 px-2 py-2.5 ${subtext} transition-colors active:text-emerald-500 disabled:opacity-30`}
          >
            {it.icon}
            <span className="text-[9px] uppercase tracking-wide" style={mono}>
              {it.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}

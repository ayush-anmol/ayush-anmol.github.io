export function getThemeTokens(theme: "light" | "dark") {
  const isDark = theme === "dark";
  return {
    isDark,
    bg: isDark ? "bg-neutral-900" : "bg-[#FAF6ED]",
    text: isDark ? "text-neutral-100" : "text-stone-900",
    subtext: isDark ? "text-neutral-400" : "text-stone-600",
    border: isDark ? "border-neutral-700" : "border-stone-200",
    accentText: isDark ? "text-emerald-400" : "text-emerald-700",
    accentHover: isDark ? "hover:text-emerald-400" : "hover:text-emerald-700",
    cardHover: isDark ? "hover:bg-neutral-800" : "hover:bg-stone-100",
    navBg: isDark ? "bg-neutral-900/80" : "bg-[#FAF6ED]/80",
    pill: isDark
      ? "bg-neutral-800 text-neutral-300 border-neutral-700"
      : "bg-stone-100 text-stone-600 border-stone-200",
  };
}
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, ArrowLeft, ArrowUp, Search } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getThemeTokens } from "../lib/themeToken";

export const serif = { fontFamily: "'Source Serif 4', Georgia, serif" };
export const mono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };
export const openSans = { fontFamily: "'Open Sans', 'Segoe UI', sans-serif" };

interface BlogLayoutProps {
  backTo: string;
  backLabel?: string;
  // when set, a search icon appears in the nav (the blog list wires this
  // to its grep panel; posts don't need it)
  onSearch?: () => void;
  children: ReactNode;
}

export default function BlogLayout({ backTo, backLabel = "back", onSearch, children }: BlogLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { isDark, bg, text, subtext, border, cardHover, navBg } = getThemeTokens(theme);

  // show the back-to-top button once the reader has scrolled a screen or so
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${bg} ${text}`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&family=JetBrains+Mono:wght@400;500;600&family=Open+Sans:ital,wght@0,400..700;1,400..700&display=swap');`}</style>

      <header className={`fixed top-0 inset-x-0 z-40 backdrop-blur border-b ${border} ${navBg}`}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-base font-semibold tracking-tight" style={serif}>
            Ayush Anmol
          </Link>

          <div className="flex items-center gap-2">
            {onSearch && (
              <button
                aria-label="Search posts"
                onClick={onSearch}
                className={`p-2 rounded-full border ${border} ${cardHover} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              >
                <Search size={15} />
              </button>
            )}
            <button
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className={`p-2 rounded-full border ${border} ${cardHover} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Link
              to={backTo}
              className={`flex items-center gap-1.5 text-xs uppercase tracking-wide px-3 py-2 rounded-full border ${border} ${cardHover} ${subtext} transition-colors`}
              style={mono}
            >
              <ArrowLeft size={13} /> {backLabel}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-32 pb-24">{children}</main>

      {/* back to top — same corner pill as the home page's terminal toggle;
          hidden on mobile, where the dock owns "top" */}
      {showTop && (
        <button
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="hidden sm:block fixed bottom-6 right-6 z-50 p-3 rounded-full bg-emerald-700 text-white shadow-lg hover:bg-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <ArrowUp size={16} />
        </button>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Home, Search, ArrowUp } from "lucide-react";
import { posts, categories, formatDate } from "../lib/blog";
import BlogLayout, { serif, mono, openSans } from "../components/BlogLayout";
import MobileDock from "../components/MobileDock";
import { useTheme } from "../context/ThemeContext";
import { getThemeTokens } from "../lib/themeToken";

export default function BlogList() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { subtext, pill, isDark, border, accentText } = getThemeTokens(theme);
  const [active, setActive] = useState<string | null>(null);

  // grep panel — a tiny one-line cli that drops down under the nav
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" opens it, Esc closes and clears — same habit as the home terminal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const q = query.trim().toLowerCase();
  const shown = posts.filter(
    (p) =>
      (!active || p.category === active) &&
      (!q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))),
  );

  const activePill = isDark
    ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
    : "border-emerald-600 text-emerald-700 bg-emerald-600/10";

  return (
    <BlogLayout backTo="/" backLabel="home" onSearch={() => setSearchOpen(true)}>
      {searchOpen && (
        <div
          className={`fixed top-[4.5rem] right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] max-w-sm rounded-lg border shadow-lg ${border} ${
            isDark ? "bg-neutral-900" : "bg-[#FAF6ED]"
          }`}
          role="search"
        >
          <div className="flex items-center gap-1.5 px-3 py-2.5 text-xs" style={mono}>
            <span className={accentText}>cli@blog</span>
            <span className={subtext}>:~$</span>
            <span>grep</span>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="keyword…"
              aria-label="Search posts"
              className="flex-1 min-w-0 bg-transparent outline-none placeholder:opacity-50"
              style={mono}
            />
            <button
              aria-label="Close search"
              onClick={() => {
                setSearchOpen(false);
                setQuery("");
              }}
              className={subtext}
            >
              <X size={13} />
            </button>
          </div>
          {q && (
            <p className={`px-3 pb-2 text-[10px] ${subtext}`} style={mono}>
              {shown.length} {shown.length === 1 ? "post matches" : "posts match"} · Esc to clear
            </p>
          )}
        </div>
      )}

      <h1 className="mt-2 text-3xl font-semibold mb-1" style={serif}>
        Blogs
      </h1>
      <p className={`text-xs uppercase tracking-wide ${subtext}`} style={mono}>
        Logging my learnings for my present and future self
      </p>

      {categories.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => setActive(null)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              active === null ? activePill : pill
            }`}
            style={mono}
          >
            all
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat === active ? null : cat)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                active === cat ? activePill : pill
              }`}
              style={mono}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8">
        {shown.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="relative block py-5 first:pt-0 hover:opacity-70 transition-opacity"
          >
            {/* date sits in the left gutter on wide screens, above the title on small ones */}
            <div className="lg:absolute lg:-left-40 lg:w-32 lg:text-center">
              <p className={`text-xs ${subtext} lg:leading-7`} style={openSans}>
                {formatDate(post.date)}
                <span className="lg:hidden"> · {post.minutes} min</span>
              </p>
              {/* <p className={`hidden lg:block text-[10px] ${subtext} opacity-70`} style={openSans}>
                {post.minutes} min read
              </p> */}
            </div>
            <h2 className="mt-1 lg:mt-0 text-xl font-semibold" style={serif}>
              {post.title}
              <sup
                className={`relative -top-2.5 ml-2 text-[12px] font-normal uppercase tracking-wide whitespace-nowrap ${accentText}`}
                style={mono}
              >
                {post.category}
              </sup>
            </h2>
            <p className={`mt-1 text-sm leading-relaxed line-clamp-2 ${subtext}`} style={serif}>
              {post.summary}
            </p>

          </Link>
        ))}
      </div>

      {shown.length === 0 && (
        <p className={`mt-8 ${subtext}`} style={serif}>
          {q ? (
            <>
              grep: no posts match <span style={mono}>"{query.trim()}"</span> — try another keyword.
            </>
          ) : (
            "Nothing here yet — first post coming soon."
          )}
        </p>
      )}

      <MobileDock
        items={[
          { icon: <Home size={17} />, label: "home", onClick: () => navigate("/") },
          { icon: <Search size={17} />, label: "search", onClick: () => setSearchOpen(true) },
          {
            icon: <ArrowUp size={17} />,
            label: "top",
            onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
          },
        ]}
      />
    </BlogLayout>
  );
}

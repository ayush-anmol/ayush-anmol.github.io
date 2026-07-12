import { useEffect, useRef, useState } from "react";
import { Mail, Cat as CatIcon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getThemeTokens } from "../lib/themeToken";
import { mono } from "./BlogLayout";
import { SOCIALS } from "../content/home";

/* A small cat that wanders the viewport, sits for a while, and strolls
   somewhere else. Hovering (or focusing, or clicking) makes it sit and opens
   a speech bubble with the social links. Drawn as an original SVG so it
   matches the site's palette — no emoji, no stock sprite. Home page only
   (it would be distracting next to blog text) and desktop-only: on phones
   the dock owns the bottom edge and there's no hover. */

const SPEED = 60; // px per second — a stroll, not a chase
const CLOSE_GRACE_MS = 350; // bubble lingers so the pointer can reach it

function GitHubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.42.36.78 1.07.78 2.16 0 1.56-.02 2.81-.02 3.19 0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}
function LinkedInIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

// two hand-drawn poses; `currentColor` fills so the cat follows the theme
function CatSvg({ pose, eye, collar }: { pose: "walk" | "sit"; eye: string; collar: string }) {
  if (pose === "walk") {
    return (
      <svg viewBox="0 0 96 64" width="72" height="48" aria-hidden="true" className="cat-walk-bob block">
        {/* tail */}
        <path className="cat-tail" d="M11 30 C2 28 -1 18 6 10" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
        {/* legs — a/b pairs swing in opposite phase */}
        <rect className="cat-leg-a" x="16" y="42" width="5" height="20" rx="2.5" fill="currentColor" />
        <rect className="cat-leg-b" x="26" y="42" width="5" height="20" rx="2.5" fill="currentColor" />
        <rect className="cat-leg-b" x="46" y="42" width="5" height="20" rx="2.5" fill="currentColor" />
        <rect className="cat-leg-a" x="55" y="42" width="5" height="20" rx="2.5" fill="currentColor" />
        {/* body + head + ears (the collar only shows on the sitting pose,
            where the chest is upright and it reads as a band, not a scarf) */}
        <rect x="10" y="26" width="52" height="20" rx="10" fill="currentColor" />
        <circle cx="68" cy="23" r="11" fill="currentColor" />
        <path d="M58.5 18 L60 3.5 L67.5 10 Z" fill="currentColor" />
        <path d="M70 9.5 L75.5 1 L79.5 12.5 Z" fill="currentColor" />
        <circle cx="71.5" cy="21" r="1.7" fill={eye} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 96 64" width="72" height="48" aria-hidden="true" className="block">
      {/* tail curled on the ground, tip flicking */}
      <path className="cat-tail-sit" d="M18 60.5 C6 61 2 55 6 48" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* haunches + back */}
      <path d="M44 62 L18 62 C10 62 8 50 12 42 C15 33 24 26 34 26 C42 26 46 32 46 40 L46 62 Z" fill="currentColor" />
      {/* front legs */}
      <rect x="40" y="36" width="5.5" height="26" rx="2.5" fill="currentColor" />
      <rect x="46.5" y="38" width="5" height="24" rx="2.5" fill="currentColor" />
      {/* head + ears */}
      <circle cx="48" cy="18" r="10.5" fill="currentColor" />
      <path d="M41 12 L39 2 L47 7 Z" fill="currentColor" />
      <path d="M51 6 L56 0 L59 10 Z" fill="currentColor" />
      {/* collar + eye */}
      <path d="M41.5 25 Q48 30.5 55 24.5" stroke={collar} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="51" cy="15.5" r="1.6" fill={eye} />
    </svg>
  );
}

export default function SiteCat() {
  const { theme } = useTheme();
  const { isDark, border, subtext, accentText, cardHover } = getThemeTokens(theme);

  // mobile: the feature is off entirely — no overlay and no animation work,
  // not just visually hidden (tracks live resizes across the breakpoint)
  const [desktop, setDesktop] = useState(() => window.matchMedia("(min-width: 640px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const onChange = (e: MediaQueryListEvent) => setDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // visitors can switch the cat off; the choice sticks across visits
  const [enabled, setEnabled] = useState(() => localStorage.getItem("site-cat") !== "off");
  const toggleCat = () => {
    setEnabled((on) => {
      const next = !on;
      localStorage.setItem("site-cat", next ? "on" : "off");
      return next;
    });
    hoverRef.current = false;
    setBubble(false);
  };

  const [pose, setPose] = useState<"walk" | "sit">("sit");
  const [facing, setFacing] = useState<1 | -1>(1);
  const [bubble, setBubble] = useState(false);
  const hoverRef = useRef(false);
  const closeTimer = useRef<number | null>(null);
  const walkRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    x: 120,
    y: Math.max(window.innerHeight - 170, 160),
    tx: 0,
    ty: 0,
    mode: "sit" as "sit" | "walk",
    waitUntil: 0,
  });

  useEffect(() => {
    if (!desktop || !enabled) return;
    const s = stateRef.current;
    const place = () => {
      if (walkRef.current) walkRef.current.style.transform = `translate(${s.x}px, ${s.y}px)`;
    };
    place();

    // reduced motion: the cat just sits in its corner; the bubble still works
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf: number;
    let last = performance.now();
    s.waitUntil = last + 1800;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!hoverRef.current) {
        if (s.mode === "sit" && now >= s.waitUntil) {
          // wander anywhere in the viewport, with a gentle vertical drift so
          // hops still read as strolling; margins keep the bubble on-screen
          // and stay clear of the navbar and the corner terminal pill
          const maxX = Math.max(window.innerWidth - 180, 140);
          const minY = 160;
          const maxY = Math.max(window.innerHeight - 140, minY + 40);
          s.tx = 100 + Math.random() * (maxX - 100);
          s.ty = Math.min(maxY, Math.max(minY, s.y + (Math.random() * 400 - 200)));
          s.mode = "walk";
          setPose("walk");
          setFacing(s.tx > s.x ? 1 : -1);
        } else if (s.mode === "walk") {
          const dx = s.tx - s.x;
          const dy = s.ty - s.y;
          const dist = Math.hypot(dx, dy);
          const step = SPEED * dt;
          if (dist <= step) {
            s.x = s.tx;
            s.y = s.ty;
            s.mode = "sit";
            setPose("sit");
            s.waitUntil = now + 2500 + Math.random() * 5000;
          } else {
            s.x += (dx / dist) * step;
            s.y += (dy / dist) * step;
          }
          place();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [desktop, enabled]);

  // hovering (or focusing) the cat makes it sit and opens the bubble;
  // closing waits a beat so the pointer can travel up into the bubble
  const settle = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    hoverRef.current = true;
    stateRef.current.mode = "sit";
    setPose("sit");
    setBubble(true);
  };
  const release = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      hoverRef.current = false;
      stateRef.current.waitUntil = performance.now() + 1500;
      setBubble(false);
    }, CLOSE_GRACE_MS);
  };

  const catColor = isDark ? "#D6D3D1" : "#292524";
  const eyeColor = isDark ? "#171717" : "#FAF6ED";
  const collarColor = isDark ? "#34D399" : "#047857";
  const panelBg = isDark ? "bg-neutral-900" : "bg-[#FAF6ED]";

  const links = [
    { label: "github", href: SOCIALS.github, icon: <GitHubIcon /> },
    { label: "linkedin", href: SOCIALS.linkedin, icon: <LinkedInIcon /> },
    { label: "email", href: `mailto:${SOCIALS.email}`, icon: <Mail size={14} /> },
  ];

  if (!desktop) return null;

  return (
    <>
      {/* corner switch — mirrors the terminal pill's spot on the other side */}
      <button
        aria-label={enabled ? "Hide the cat" : "Let the cat out"}
        aria-pressed={enabled}
        title={enabled ? "Hide the cat" : "Let the cat out"}
        onClick={toggleCat}
        className={`fixed bottom-6 left-6 z-40 hidden sm:flex p-2.5 rounded-full border shadow-lg ${border} ${panelBg} ${cardHover} ${
          enabled ? accentText : isDark ? "text-neutral-500" : "text-stone-400"
        } transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500`}
      >
        <CatIcon size={16} />
      </button>
      {enabled && (
        <div className="fixed inset-0 z-40 hidden sm:block pointer-events-none">
          <div
            ref={walkRef}
            className="absolute left-0 top-0 will-change-transform"
            style={{ transform: `translate(${stateRef.current.x}px, ${stateRef.current.y}px)` }}
          >
            <div
              className="relative pointer-events-auto"
              onMouseEnter={settle}
              onMouseLeave={release}
            >
              {bubble && (
                /* padded wrapper (not margin) so the pointer never crosses a
                   dead gap between the cat and the bubble */
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2.5 w-44">
                  <div className={`relative rounded-lg border shadow-lg py-1.5 ${border} ${panelBg}`} style={mono}>
                    <p className={`px-3 pt-1 pb-1.5 text-[10px] tracking-wide ${subtext}`}>
                      Meow~
                    </p>
                    {links.map((l) => (
                      <a
                        key={l.label}
                        href={l.href}
                        target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2.5 px-3 py-1.5 text-xs ${subtext} ${cardHover} hover:text-emerald-500 transition-colors`}
                      >
                        {l.icon}
                        {l.label}
                      </a>
                    ))}
                    {/* bubble tail */}
                    <span
                      className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-b border-r ${border} ${panelBg}`}
                    />
                  </div>
                </div>
              )}
              <button
                aria-label="Say hi — GitHub, LinkedIn, email"
                aria-expanded={bubble}
                onFocus={settle}
                onBlur={(e) => {
                  // keep the bubble open while tabbing through its links
                  if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) release();
                }}
                onClick={() => (bubble ? release() : settle())}
                onKeyDown={(e) => e.key === "Escape" && release()}
                className="block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                style={{ color: catColor }}
              >
                <span className="block" style={{ transform: facing === -1 ? "scaleX(-1)" : undefined }}>
                  <CatSvg pose={pose} eye={eyeColor} collar={collarColor} />
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

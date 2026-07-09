import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Mail, FileText, Terminal, X, ArrowUpRight, Menu, User, Wrench, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";
import { getThemeTokens } from "./lib/themeToken";
import ContactForm from "./components/ContactForm";
import MobileDock from "./components/MobileDock";
import {
  NAME,
  HANDLE,
  TAGLINE,
  BIO_P1,
  BIO_P2,
  BIO_P2_BEFORE,
  BIO_P2_LINK,
  BIO_P2_AFTER,
  CURRENTLY,
  CURRENT_ROLE,
  PREVIOUSLY,
  SKILLS,
  EDUCATION,
  PROJECTS,
  PUBLICATIONS,
  NOTES,
  SOCIALS,
} from "./content/home";

function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.42.36.78 1.07.78 2.16 0 1.56-.02 2.81-.02 3.19 0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}
function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type SectionKey = "top" | "about" | "projects" | "research" | "notes" | "contact";

interface ConsoleLine {
  type: "input" | "output";
  text: string;
}

const PROMPT = `cli@${HANDLE}`;

const HELP_LINES = [
  "Available commands:",
  "  help : show this list",
  "  about : a little about me",
  "  projects : things I've built",
  "  research : publications",
  "  skills : tools & languages I use",
  "  notes : what I've been up to lately",
  "  blog : read my writing",
  "  contact : how to reach me",
  "  mail : write to me right here",
  "  social : links to my profiles",
  "  resume : open my résumé",
  "  theme [dark|light] : switch themes",
  "  cd <section> : jump to a section",
  "  clear : clear the terminal",
  "  exit : close the terminal",
];

// what a fresh terminal shows: a ghost-typed `help` and its output
const WELCOME_LINES: ConsoleLine[] = [
  { type: "output", text: `Welcome to ${NAME}'s terminal.` },
  { type: "input", text: "help" },
  ...HELP_LINES.map((t) => ({ type: "output", text: t } as ConsoleLine)),
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Portfolio() {
  const navigate = useNavigate();
  const { theme, setTheme, toggleTheme } = useTheme();
  const { isDark, bg, text, subtext, border, accentText, accentHover, cardHover, navBg, pill } = getThemeTokens(theme);

  const [terminalOpen, setTerminalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [portraitFlipped, setPortraitFlipped] = useState(false);
  // open with a ghost-typed `help` so first-time visitors see what the
  // terminal can do instead of an empty box
  const [lines, setLines] = useState<ConsoleLine[]>(WELCOME_LINES);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const aboutRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const researchRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const scrollTo = (key: SectionKey) => {
    if (key === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const map: Record<Exclude<SectionKey, "top">, React.RefObject<HTMLDivElement | null>> = {
      about: aboutRef,
      projects: projectsRef,
      research: researchRef,
      notes: notesRef,
      contact: contactRef,
    };
    map[key]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (terminalOpen) inputRef.current?.focus();
  }, [terminalOpen]);

  useEffect(() => {
    // a fresh terminal reads top-down from the welcome line; only follow
    // the tail once the visitor has actually run a command
    if (lines === WELCOME_LINES) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [lines, terminalOpen]);

  // "/" opens the terminal, "Esc" closes it — like a docs search box
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        setTerminalOpen(true);
      } else if (e.key === "Escape" && !contactOpen) {
        // when the mail composer is up, Esc should close it (ContactForm
        // handles that), not the terminal behind it
        setTerminalOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [contactOpen]);

  const print = (text: string | string[]) => {
    const arr = Array.isArray(text) ? text : [text];
    setLines((prev) => [...prev, ...arr.map((t) => ({ type: "output", text: t } as ConsoleLine))]);
  };

  const runCommand = (raw: string) => {
    const trimmed = raw.trim();
    setLines((prev) => [...prev, { type: "input", text: trimmed }]);
    if (!trimmed) return;

    setCmdHistory((prev) => [...prev, trimmed]);
    setHistIndex(null);

    const [cmdRaw, ...rest] = trimmed.split(/\s+/);
    const cmd = cmdRaw.toLowerCase();
    const arg = rest.join(" ").toLowerCase();

    switch (cmd) {
      case "help":
        print(HELP_LINES);
        break;

      case "about":
      case "whoami":
        print([BIO_P1, BIO_P2]);
        scrollTo("about");
        break;

      case "projects":
        print(PROJECTS.map((p) => `- ${p.name}: ${p.description}`));
        scrollTo("projects");
        break;

      case "research":
      case "publications":
        print(PUBLICATIONS.map((pub) => `- ${pub.title} (${pub.venue})`));
        scrollTo("research");
        break;

      case "skills":
        print(SKILLS.join(", "));
        break;

      case "notes":
        print(NOTES.map((n) => `${n.date} — ${n.text}`));
        scrollTo("notes");
        break;

      case "contact":
      case "email":
        print([`Email: ${SOCIALS.email}`, "or use the contact section below."]);
        scrollTo("contact");
        break;

      case "mail":
      case "message":
        print("Opening the mail composer…");
        setContactOpen(true);
        break;

      case "social":
        print([
          `github     ${SOCIALS.github}`,
          `linkedin   ${SOCIALS.linkedin}`,
          `leetcode   ${SOCIALS.leetcode}`,
          `email      ${SOCIALS.email}`,
        ]);
        break;

      case "resume":
        if (SOCIALS.resume === "#") {
          print("Résumé link not set yet — add yours to the SOCIALS object in the code.");
        } else {
          print(`Opening résumé → ${SOCIALS.resume}`);
          window.open(SOCIALS.resume, "_blank", "noopener,noreferrer");
        }
        break;

      case "theme":
        if (arg === "dark") {
          setTheme("dark");
          print("Switched to dark mode.");
        } else if (arg === "light") {
          setTheme("light");
          print("Switched to light mode.");
        } else if (arg === "" || arg === "toggle") {
          toggleTheme();
          print("Toggled theme.");
        } else {
          print("Usage: theme [dark|light]");
        }
        break;

      case "cd": {
        const map: Record<string, SectionKey> = {
          about: "about",
          projects: "projects",
          research: "research",
          notes: "notes",
          contact: "contact",
          top: "top",
          home: "top",
        };
        if (!arg) {
          print("Usage: cd <about|projects|research|notes|contact|top>");
        } else if (arg === "..") {
          print("You're already at the top, nice try.");
        } else if (map[arg]) {
          scrollTo(map[arg]);
          print(`Navigating to ${arg}...`);
        } else {
          print(`cd: no such section: ${arg}`);
        }
        break;
      }

      case "date":
        print(new Date().toString());
        break;

      case "echo":
        print(rest.join(" "));
        break;

      case "sudo":
        print("Permission denied: you're not root here. Nice try though.");
        break;

      case "clear":
      case "cls":
        setLines([]);
        break;

      case "blog":
        print("Opening blog...");
        navigate("/blog");
        break;

      case "exit":
      case "close":
      case "quit":
        setTerminalOpen(false);
        break;

      default:
        print(`command not found: ${cmd}. Type 'help' to see available commands.`);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      runCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const newIndex = histIndex === null ? cmdHistory.length - 1 : Math.max(0, histIndex - 1);
      setHistIndex(newIndex);
      setInput(cmdHistory[newIndex]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIndex === null) return;
      const newIndex = histIndex + 1;
      if (newIndex >= cmdHistory.length) {
        setHistIndex(null);
        setInput("");
      } else {
        setHistIndex(newIndex);
        setInput(cmdHistory[newIndex]);
      }
    }
  };

  const serif = { fontFamily: "'Source Serif 4', Georgia, serif" };
  const mono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${bg} ${text}`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&family=JetBrains+Mono:wght@400;500;600&family=Playwrite+AU+TAS:wght@400&display=swap');`}</style>

      {/* ---------- nav ---------- */}
      <header className={`fixed top-0 inset-x-0 z-40 backdrop-blur border-b ${border} ${navBg}`}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => scrollTo("top")}
            className="text-base font-semibold tracking-tight"
            style={serif}
          >
            {NAME}
          </button>

          <nav className="hidden sm:flex items-center gap-5" style={mono}>
            {(["about", "projects", "research", "notes", "contact"] as SectionKey[]).map((key) => (
              <button
                key={key}
                onClick={() => scrollTo(key)}
                className={`text-xs uppercase tracking-wide ${subtext} ${accentHover} transition-colors`}
              >
                {key}
              </button>
            ))}
            <Link
              to="/blog"
              className={`text-xs uppercase tracking-wide ${subtext} ${accentHover} transition-colors`}
            >
              blog
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className={`p-2 rounded-full border ${border} ${cardHover} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              aria-label="Open terminal"
              onClick={() => setTerminalOpen(true)}
              className={`hidden sm:block p-2 rounded-full border ${border} ${cardHover} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            >
              <Terminal size={15} />
            </button>
            <button
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
              className={`sm:hidden p-2 rounded-full border ${border} ${cardHover} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            >
              {menuOpen ? <X size={15} /> : <Menu size={15} />}
            </button>
          </div>
        </div>

        {/* mobile dropdown — the nav links, stacked */}
        {menuOpen && (
          <nav className={`sm:hidden border-t ${border}`} style={mono}>
            <div className="max-w-2xl mx-auto px-6 py-4 flex flex-col gap-4">
              {(["about", "projects", "research", "notes", "contact"] as SectionKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setMenuOpen(false);
                    scrollTo(key);
                  }}
                  className={`text-left text-xs uppercase tracking-wide ${subtext} ${accentHover} transition-colors`}
                >
                  {key}
                </button>
              ))}
              <Link
                to="/blog"
                onClick={() => setMenuOpen(false)}
                className={`text-xs uppercase tracking-wide ${subtext} ${accentHover} transition-colors`}
              >
                blog
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* ---------- banner ---------- */}
      <div className="pt-16">
        <div className="relative h-48 sm:h-60 w-full overflow-hidden">
          <img
            src="/banner.jpg"
            alt=""
            className="h-full w-full object-cover"
          />
          {isDark && <div className="absolute inset-0 bg-black/30" />}
          {/* fade the artwork's hard edges into the page so it reads as a
              scene the site emerges from, not a pasted strip */}
          <div
            className={`absolute inset-x-0 top-0 h-10 bg-gradient-to-b to-transparent ${
              isDark ? "from-neutral-900/80" : "from-[#FAF6ED]/60"
            }`}
          />
          <div
            className={`absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t to-transparent ${
              isDark ? "from-neutral-900" : "from-[#FAF6ED]"
            }`}
          />
        </div>
        {/* portrait — its horizontal midline sits on the banner's bottom edge; click to coin-flip */}
        <div className="relative max-w-2xl mx-auto px-6">
          <button
            type="button"
            onClick={() => setPortraitFlipped((f) => !f)}
            aria-label="Flip portrait"
            className="coin-flip absolute left-6 top-0 -translate-y-1/2 w-32 h-32 sm:w-40 sm:h-40 cursor-pointer rounded-full"
          >
            <div className={`coin-flip-inner ${portraitFlipped ? "is-flipped" : ""}`}>
              <img
                src="/ayush_anmol_watercolor.png"
                alt="Ayush Anmol (watercolor portrait)"
                className={`coin-face w-full h-full rounded-full object-cover object-top border-4 ${
                  isDark ? "border-neutral-900 bg-neutral-800" : "border-[#FAF6ED] bg-white"
                }`}
              />
              <img
                src="/ayush_anmol.png"
                alt="Ayush Anmol"
                className={`coin-face coin-face-back w-full h-full rounded-full object-cover border-4 ${
                  isDark ? "border-neutral-900 bg-neutral-800" : "border-[#FAF6ED] bg-white"
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* ---------- hero / about ---------- */}
      <main className="max-w-2xl mx-auto px-6 pt-24 pb-24">
        <div ref={aboutRef} className="scroll-mt-24">
          <h1 className="text-3xl sm:text-4xl font-semibold leading-snug" style={serif}>
            Hi, I'm {NAME}.{" "}
            {/* <span className={`${accentText} animate-pulse`}>,</span> */}
          </h1>
          <p
            className={`mt-2 text-base leading-relaxed ${isDark ? "text-rose-400" : "text-amber-700"}`}
            style={{ fontFamily: "'Playwrite AU TAS', cursive", fontWeight: 400 }}
          >
            {TAGLINE}
          </p>

          <p className="mt-6 leading-relaxed" style={serif}>
            {BIO_P1}
          </p>
          <p className="mt-4 leading-relaxed" style={serif}>
            {BIO_P2_BEFORE}
            <button
              onClick={() => scrollTo("research")}
              className={`cursor-pointer ${accentText} hover:underline`}
            >
              {BIO_P2_LINK}
            </button>
            {BIO_P2_AFTER}
          </p>

          {CURRENT_ROLE && (
            <div className="mt-6">
              <p className={`flex items-center gap-2 text-xs uppercase tracking-wide ${subtext}`} style={mono}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
                Working as
              </p>
              <ul className="mt-2 space-y-1.5">
                <li className="flex gap-2 leading-relaxed">
                  <span className={accentText}>›</span>
                  <span style={serif}>
                    <span className="font-semibold">
                      {CURRENT_ROLE.post} @ {CURRENT_ROLE.company}
                    </span>{" "}
                    — {CURRENT_ROLE.work}
                  </span>
                </li>
              </ul>
            </div>
          )}

          <div className="mt-8">
            <p className={`flex items-center gap-2 text-sm uppercase tracking-wide ${subtext}`} style={mono}>
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              Currently
            </p>
            <ul className="mt-2 space-y-1.5">
              {CURRENTLY.map((item) => (
                <li key={item} className="flex gap-2 leading-relaxed">
                  <span className={accentText}>›</span>
                  <span style={serif}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <p className={`text-sm uppercase tracking-wide ${subtext}`} style={mono}>
              Previously
            </p>
            <ul className="mt-2 space-y-1.5">
              {PREVIOUSLY.map((item) => (
                <li key={item.company} className="flex gap-2 leading-relaxed">
                  <span className={subtext}>›</span>
                  <span style={serif}>
                    <span className="font-semibold">
                      {item.post} @ {item.company}
                    </span>{" "}
                    — {item.work}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <p className={`text-sm uppercase tracking-wide ${subtext}`} style={mono}>
              Education
            </p>
            <ul className="mt-2 space-y-1.5">
              {EDUCATION.map((item) => (
                <li key={item.school} className="flex gap-2 leading-relaxed">
                  <span className={subtext}>›</span>
                  <span style={serif}>
                    Graduated from {item.school} in {item.degree} ({item.period}) with a CGPA of {item.cgpa} / 10.
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {SKILLS.map((s) => (
              <span key={s} className={`text-xs px-2.5 py-1 rounded-full border ${pill}`} style={mono}>
                {s}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <a
              href={SOCIALS.github}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-sm ${subtext} ${accentHover} transition-colors`}
            >
              <GitHubIcon size={20} /> GitHub
            </a>
            <a
              href={SOCIALS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-sm ${subtext} ${accentHover} transition-colors`}
            >
              <LinkedInIcon size={20} /> LinkedIn
            </a>
            <button
              onClick={() => setContactOpen(true)}
              className={`flex items-center gap-1.5 text-sm ${subtext} ${accentHover} transition-colors`}
            >
              <Mail size={20} /> Email
            </button>
            <a
              href={SOCIALS.resume}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-sm ${subtext} ${accentHover} transition-colors`}
            >
              <FileText size={20} /> Résumé
            </a>
          </div>
        </div>

        <div className={`border-t ${border} my-14`} />

        {/* ---------- projects ---------- */}
        <div ref={projectsRef} className="scroll-mt-24">
          <p className={`text-sm uppercase tracking-wide ${subtext}`} style={mono}>
            Projects
          </p>
          <h2 className="mt-2 text-2xl font-semibold" style={serif}>
            Things I've built
          </h2>

          <div className={`mt-6 divide-y ${border}`}>
            {PROJECTS.map((p) => (
              <div key={p.name} className="py-5 first:pt-0 group">
                <div className="flex items-start justify-between gap-4">
                  <h3
                    className={`text-base font-semibold transition-colors ${
                      isDark ? "group-hover:text-emerald-400" : "group-hover:text-emerald-700"
                    }`}
                    style={serif}
                  >
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-3 shrink-0">
                    {p.github && (
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${p.name} on GitHub`}
                        className={`${subtext} ${accentHover} transition-colors`}
                      >
                        <GitHubIcon size={18} />
                      </a>
                    )}
                    {p.live && (
                      <a
                        href={p.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${p.name} live demo`}
                        className={`${subtext} ${accentHover} transition-colors`}
                      >
                        <ArrowUpRight size={18} />
                      </a>
                    )}
                  </div>
                </div>
                <p className={`mt-1.5 text-sm leading-relaxed ${subtext}`} style={serif}>
                  {p.description}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {p.tags.map((tag) => (
                    <span key={tag} className={`text-xs px-2 py-0.5 rounded-full border ${pill}`} style={mono}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <a
            href={SOCIALS.github}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-6 inline-flex items-center gap-1.5 text-sm font-medium ${accentText} hover:underline`}
            style={mono}
          >
            Visit my GitHub for more <ArrowUpRight size={18} />
          </a>
        </div>

        <div className={`border-t ${border} my-14`} />

        {/* ---------- research ---------- */}
        <div ref={researchRef} className="scroll-mt-24">
          <p className={`text-sm uppercase tracking-wide ${subtext}`} style={mono}>
            Research
          </p>
          <h2 className="mt-2 text-2xl font-semibold" style={serif}>
            Publications
          </h2>

          <div className={`mt-6 divide-y ${border}`}>
            {PUBLICATIONS.map((pub) => (
              <div key={pub.title} className="py-5 first:pt-0">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-semibold" style={serif}>
                    {pub.title}
                  </h3>
                  <a
                    href={pub.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Read "${pub.title}"`}
                    className={`${subtext} ${accentHover} transition-colors shrink-0`}
                  >
                    <ArrowUpRight size={16} />
                  </a>
                </div>
                <p className={`mt-1.5 text-xs ${subtext}`} style={mono}>
                  {pub.venue} · {pub.year}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className={`border-t ${border} my-14`} />

        {/* ---------- notes ---------- */}
        <div ref={notesRef} className="scroll-mt-24">
          <p className={`text-sm uppercase tracking-wide ${subtext}`} style={mono}>
            Notes
          </p>
          <h2 className="mt-2 text-2xl font-semibold" style={serif}>
            What I've been up to
          </h2>

          <ul className={`mt-6 space-y-3 max-h-80 overflow-y-auto pr-2 ${isDark ? "scrollbar-dark" : "scrollbar-light"}`}>
            {NOTES.map((n, i) => (
              <li key={`${n.date}-${i}`} className="flex gap-4">
                <span className={`text-xs shrink-0 w-16 pt-0.5 ${subtext}`} style={mono}>
                  {n.date}
                </span>
                <span className="leading-relaxed" style={serif}>
                  {n.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`border-t ${border} my-14`} />

        {/* ---------- contact ---------- */}
        <div ref={contactRef} className="scroll-mt-24">
          <p className={`text-sm uppercase tracking-wide ${subtext}`} style={mono}>
            Get in touch
          </p>
          <h2 className="mt-2 text-2xl font-semibold" style={serif}>
            Let's talk
          </h2>
          <p className={`mt-3 leading-relaxed ${subtext}`} style={serif}>
            I'm open to interesting work in applied or research AI — part-time, contract, or a full-time role
            that's the right fit — and always happy to chat about AI systems, ML, software
            engineering, or things you've recently broken and fixed. Email is the fastest way to
            reach me; LinkedIn works too.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <button
              onClick={() => setContactOpen(true)}
              className={`inline-flex items-center gap-2 text-lg font-medium ${accentText}`}
              style={serif}
            >
              {SOCIALS.email} <ArrowUpRight size={18} />
            </button>
            <a
              href={SOCIALS.linkedin}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 text-lg font-medium ${accentText}`}
              style={serif}
            >
              <LinkedInIcon size={18} /> LinkedIn <ArrowUpRight size={18} />
            </a>
          </div>

          <p className={`mt-8 hidden sm:block text-xs ${subtext}`} style={mono}>
            psst — this site has a CLI. Press <kbd className={`px-1.5 py-0.5 rounded border ${border}`}>/</kbd> or
            click the terminal icon, then type <span className={accentText}>help</span>.
          </p>
        </div>
      </main>

      <footer className={`border-t ${border} pt-8 pb-24 sm:pb-8`}>
        <p className={`text-center text-xs ${subtext}`} style={mono}>
          © {new Date().getFullYear()} {NAME}
        </p>
      </footer>

      <ContactForm open={contactOpen} onClose={() => setContactOpen(false)} email={SOCIALS.email} />

      {/* mobile dock hides while the terminal panel owns the bottom edge */}
      {!terminalOpen && (
        <MobileDock
          items={[
            { icon: <User size={17} />, label: "about", onClick: () => scrollTo("about") },
            { icon: <Wrench size={17} />, label: "projects", onClick: () => scrollTo("projects") },
            { icon: <Mail size={17} />, label: "contact", onClick: () => scrollTo("contact") },
            { icon: <BookOpen size={17} />, label: "blog", onClick: () => navigate("/blog") },
          ]}
        />
      )}

      {/* ---------- floating terminal toggle ---------- */}
      {!terminalOpen && (
        <button
          aria-label="Open terminal"
          onClick={() => setTerminalOpen(true)}
          className="fixed bottom-6 right-6 z-50 hidden sm:flex items-center gap-2 rounded-full bg-emerald-700 text-white px-4 py-3 shadow-lg hover:bg-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
          style={mono}
        >
          <Terminal size={16} />
          <span className="text-xs hidden sm:inline">press /</span>
        </button>
      )}

      {/* ---------- terminal panel ---------- */}
      {terminalOpen && (
        <div
          className="fixed z-50 inset-x-4 bottom-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96 h-96 flex flex-col rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-200 shadow-2xl overflow-hidden"
          style={mono}
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-900">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="ml-2 text-xs text-neutral-400">{PROMPT}: ~</span>
            </div>
            <button
              aria-label="Close terminal"
              onClick={() => setTerminalOpen(false)}
              className="text-neutral-400 hover:text-neutral-100"
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-1 text-sm">
            {lines.map((l, i) => (
              <div key={i} className="whitespace-pre-wrap break-words">
                {l.type === "input" ? (
                  <span>
                    <span className="text-emerald-400">{PROMPT}:~$</span>{" "}
                    <span className="text-neutral-100">{l.text}</span>
                  </span>
                ) : (
                  <span className="text-neutral-400">{l.text}</span>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 border-t border-neutral-800">
            <span className="text-emerald-400">❯</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoComplete="off"
              className="flex-1 bg-transparent outline-none text-neutral-100 placeholder-neutral-600 caret-emerald-400 text-sm"
              placeholder="type 'help'"
            />
          </div>
        </div>
      )}
    </div>
  );
}
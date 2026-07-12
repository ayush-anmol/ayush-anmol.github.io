import { isValidElement, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUp, Check, ChevronDown, Copy, List } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getPostBySlug, getAdjacentPosts, formatDate } from "../lib/blog";
import BlogLayout, { serif, mono, openSans } from "../components/BlogLayout";
import ContactForm from "../components/ContactForm";
import MobileDock from "../components/MobileDock";
import { useTheme } from "../context/ThemeContext";
import { getThemeTokens } from "../lib/themeToken";

/* ------------------------------------------------------------------ */
/*  Table of contents helpers                                          */
/* ------------------------------------------------------------------ */

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Plain text of a rendered heading, so its id matches the one we
// computed from the markdown source
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

interface TocEntry {
  id: string;
  text: string;
}

// `##` sections only — keeps the rail small; skips fenced code blocks
function extractHeadings(markdown: string): TocEntry[] {
  const entries: TocEntry[] = [];
  let inCode = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const match = /^##\s+(.+)/.exec(line);
    if (!match) continue;
    const text = match[1]
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[`*_]/g, "")
      .trim();
    entries.push({ id: slugify(text), text });
  }
  return entries;
}

/* ------------------------------------------------------------------ */
/*  Code blocks — hover reveals a copy button in the corner            */
/* ------------------------------------------------------------------ */

function PreWithCopy({ children }: { children?: ReactNode }) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const code = preRef.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable (e.g. non-https) — quietly do nothing
    }
  };

  return (
    <div className="relative group">
      <pre ref={preRef}>{children}</pre>
      <button
        aria-label={copied ? "Copied" : "Copy code"}
        onClick={copy}
        className="absolute top-2 right-2 p-1.5 rounded-md border transition-opacity opacity-50 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
        style={{
          borderColor: "var(--md-border)",
          background: "var(--md-code-bg)",
          color: copied ? "var(--md-accent)" : "inherit",
        }}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = getPostBySlug(slug ?? "");
  const { theme } = useTheme();
  const { isDark, subtext, accentText, accentHover, border, pill } = getThemeTokens(theme);

  const { older, newer } = getAdjacentPosts(slug ?? "");
  const headings = useMemo(() => (post ? extractHeadings(post.content) : []), [post]);

  // start at the top when moving between posts via prev/next links —
  // unless the URL carries a #section anchor someone shared
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      requestAnimationFrame(() =>
        document.getElementById(hash)?.scrollIntoView({ block: "start" }),
      );
    } else {
      window.scrollTo(0, 0);
    }
    setTocOpen(false);
    setFeedbackOpen(false);
  }, [slug]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tocOpen, setTocOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    if (headings.length === 0) return;
    const onScroll = () => {
      let current = headings[0].id;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= 120) current = h.id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  const markdownVars = {
    "--md-accent": isDark ? "#34D399" : "#047857",
    "--md-code-bg": isDark ? "#262626" : "#EFEAE0",
    "--md-border": isDark ? "#404040" : "#E7E5E4",
    // syntax highlighting palette (highlight.js token classes in index.css)
    "--hl-comment": isDark ? "#8A8A8A" : "#78716C",
    "--hl-keyword": isDark ? "#34D399" : "#047857",
    "--hl-string": isDark ? "#FCD34D" : "#B45309",
    "--hl-number": isDark ? "#F472B6" : "#BE185D",
    "--hl-func": isDark ? "#60A5FA" : "#1D4ED8",
    "--hl-attr": isDark ? "#A5B4FC" : "#4338CA",
  } as CSSProperties;

  if (!post) {
    return (
      <BlogLayout backTo="/blog" backLabel="blog">
        <p style={serif}>Post not found.</p>
        <Link to="/blog" viewTransition className={`mt-4 inline-block text-sm ${accentText}`} style={mono}>
          ← back to blog
        </Link>
      </BlogLayout>
    );
  }

  return (
    <BlogLayout backTo="/blog" backLabel="blog">
      <article className="relative">
        {/* table of contents — lives in the left gutter on wide screens */}
        {headings.length > 1 && (
          <nav
            aria-label="Table of contents"
            className="hidden xl:block absolute top-0 bottom-0"
            /* span the gutter between the viewport edge and the article column
               (article content box is 672px − 2×24px padding = 624px) */
            style={{ right: "100%", width: "calc((100vw - 624px) / 2)" }}
          >
            <div className="sticky top-28 flex justify-center">
              <div className="w-52">
                <p className={`text-xs uppercase tracking-wide ${subtext}`} style={mono}>
                  Contents
                </p>
                <ul className={`mt-3 space-y-2 border-l ${border} pl-3`}>
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className={`block text-xs leading-snug transition-colors ${
                          activeId === h.id ? accentText : `${subtext} ${accentHover}`
                        }`}
                        style={mono}
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>
        )}

        <p className={`text-sm ${subtext}`} style={openSans}>
          {formatDate(post.date)} · {post.minutes} min read
        </p>
        <h1 className="mt-2 text-3xl font-semibold leading-snug" style={serif}>
          {post.title}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${pill} ${accentText}`} style={mono}>
            {post.category}
          </span>
          {post.tags.filter((tag) => tag !== post.category).map((tag) => (
            <span key={tag} className={`text-xs px-2 py-0.5 rounded-full border ${pill}`} style={mono}>
              {tag}
            </span>
          ))}
        </div>

        {/* table of contents — collapsible dropdown under the title on narrow screens */}
        {headings.length > 1 && (
          <div id="mobile-toc" className={`xl:hidden mt-6 rounded-lg border ${border} scroll-mt-24`}>
            <button
              onClick={() => setTocOpen((open) => !open)}
              aria-expanded={tocOpen}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-xs uppercase tracking-wide ${subtext}`}
              style={mono}
            >
              Contents
              <ChevronDown
                size={14}
                className={`transition-transform ${tocOpen ? "rotate-180" : ""}`}
              />
            </button>
            {tocOpen && (
              <ul className={`px-4 pt-3 pb-4 space-y-2.5 border-t ${border}`}>
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setTocOpen(false);
                        document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className={`block text-xs leading-snug transition-colors ${subtext} ${accentHover}`}
                      style={mono}
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className={`markdown mt-8 ${isDark ? "markdown-dark" : ""}`} style={{ ...serif, ...markdownVars }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              // scroll-mt keeps anchored headings clear of the fixed nav;
              // the # link copies a shareable URL for the section
              h2: ({ children }) => {
                const id = slugify(textOf(children));
                return (
                  <h2 id={id} className="group scroll-mt-24">
                    {children}
                    <a
                      href={`#${id}`}
                      aria-label="Link to this section"
                      onClick={() => {
                        const url = `${window.location.origin}${window.location.pathname}#${id}`;
                        navigator.clipboard?.writeText(url).catch(() => {});
                      }}
                      className="ml-2 opacity-0 group-hover:opacity-60 hover:!opacity-100 focus-visible:opacity-100 transition-opacity"
                      style={{ color: "var(--md-accent)", textDecoration: "none" }}
                    >
                      #
                    </a>
                  </h2>
                );
              },
              pre: ({ children }) => <PreWithCopy>{children}</PreWithCopy>,
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* prev/next — same category, chronological: previous = older post, next = newer.
            Hidden on mobile, where the dock's side arrows take over */}
        {(older || newer) && (
          <nav aria-label="Adjacent posts" className={`mt-14 pt-8 border-t ${border} hidden sm:flex justify-between gap-6`}>
            {older ? (
              <Link to={`/blog/${older.slug}`} viewTransition className="max-w-[45%]">
                <p className={`text-xs uppercase tracking-wide ${subtext}`} style={mono}>
                  ← Previous
                </p>
                <p className={`mt-1 text-sm font-semibold line-clamp-2 ${accentHover} transition-colors`} style={serif}>
                  {older.title}
                </p>
              </Link>
            ) : (
              <span />
            )}
            {newer ? (
              <Link to={`/blog/${newer.slug}`} viewTransition className="max-w-[45%] text-right">
                <p className={`text-xs uppercase tracking-wide ${subtext}`} style={mono}>
                  Next →
                </p>
                <p className={`mt-1 text-sm font-semibold line-clamp-2 ${accentHover} transition-colors`} style={serif}>
                  {newer.title}
                </p>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}

        {/* reader feedback — the form tags the mail with this post's title + category */}
        <div className={`mt-12 pt-6 border-t ${border} text-center`}>
          <p className={`text-sm ${subtext}`} style={serif}>
            Spotted a mistake, or know a better approach?{" "}
            <button
              onClick={() => setFeedbackOpen(true)}
              className={`font-semibold ${accentText} hover:underline underline-offset-2`}
            >
              Tell me →
            </button>
          </p>
        </div>
      </article>

      <ContactForm
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        post={{ title: post.title, category: post.category }}
      />

      <MobileDock
        items={[
          {
            icon: <ArrowLeft size={17} />,
            label: "older",
            disabled: !older,
            onClick: () => older && navigate(`/blog/${older.slug}`, { viewTransition: true }),
          },
          {
            icon: <List size={17} />,
            label: "contents",
            disabled: headings.length <= 1,
            onClick: () => {
              setTocOpen(true);
              document.getElementById("mobile-toc")?.scrollIntoView({ behavior: "smooth", block: "start" });
            },
          },
          {
            icon: <ArrowUp size={17} />,
            label: "top",
            onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
          },
          {
            icon: <ArrowRight size={17} />,
            label: "newer",
            disabled: !newer,
            onClick: () => newer && navigate(`/blog/${newer.slug}`, { viewTransition: true }),
          },
        ]}
      />
    </BlogLayout>
  );
}

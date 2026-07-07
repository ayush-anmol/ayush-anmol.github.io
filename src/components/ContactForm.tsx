import { useEffect, useRef, useState, type FormEvent } from "react";
import { X, Send } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getThemeTokens } from "../lib/themeToken";
import { serif, mono } from "./BlogLayout";

// Get a free access key at https://web3forms.com — enter your email there and
// the key is mailed to you. It's safe to ship in client code: it only tells
// Web3Forms which inbox receives the submissions.
const WEB3FORMS_ACCESS_KEY = "79f31adf-1bed-4edc-a413-eb1932943e2e";

type Status = "idle" | "sending" | "sent" | "error";

export const CONTACT_EMAIL = "aanmol.connect@gmail.com";

interface ContactFormProps {
  open: boolean;
  onClose: () => void;
  email?: string; // fallback mailto if the relay is down
  // when set, the submission is tagged as feedback on this blog post
  post?: { title: string; category: string };
}

export default function ContactForm({ open, onClose, email = CONTACT_EMAIL, post }: ContactFormProps) {
  const { theme } = useTheme();
  const { isDark, bg, text, subtext, border, accentText } = getThemeTokens(theme);

  const [status, setStatus] = useState<Status>("idle");
  const nameRef = useRef<HTMLInputElement>(null);

  // fresh form each time it opens; focus the first field
  useEffect(() => {
    if (!open) return;
    setStatus("idle");
    nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("botcheck")) return; // honeypot tripped — silently drop
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: post
            ? `Blog feedback: ${post.title} [${post.category}]`
            : `Portfolio message from ${data.get("name")}`,
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          ...(post && { post: post.title, category: post.category }),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const field = `w-full rounded-lg border ${border} bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Contact form"
    >
      <div
        className={`w-full max-w-md rounded-xl border ${border} ${bg} ${text} p-6 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-xs uppercase tracking-wide ${subtext}`} style={mono}>
              {post ? "Post feedback" : "Get in touch"}
            </p>
            <h2 className="mt-1 text-lg font-semibold" style={serif}>
              {post ? "Send me feedback" : "Send me a message"}
            </h2>
            {post && (
              <p className={`mt-1 text-xs ${subtext}`} style={mono}>
                re: {post.title}
              </p>
            )}
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className={`p-1.5 rounded-full ${subtext} ${isDark ? "hover:bg-neutral-800" : "hover:bg-stone-100"}`}
          >
            <X size={16} />
          </button>
        </div>

        {status === "sent" ? (
          <div className="mt-6 text-center">
            <p className={`text-2xl ${accentText}`}>✓</p>
            <p className="mt-2 font-semibold" style={serif}>
              Message sent!
            </p>
            <p className={`mt-1 text-sm ${subtext}`} style={serif}>
              Thanks for reaching out — I'll get back to you soon.
            </p>
            <button
              onClick={onClose}
              className="mt-5 rounded-full bg-emerald-700 px-5 py-2 text-sm text-white hover:bg-emerald-600 transition-colors"
              style={mono}
            >
              Close
            </button>
          </div>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            {/* honeypot — real visitors never see or fill this */}
            <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" />

            <div>
              <label htmlFor="cf-name" className={`block text-xs ${subtext}`} style={mono}>
                Name
              </label>
              <input id="cf-name" name="name" required ref={nameRef} className={`mt-1 ${field}`} style={serif} />
            </div>
            <div>
              <label htmlFor="cf-email" className={`block text-xs ${subtext}`} style={mono}>
                Email
              </label>
              <input id="cf-email" name="email" type="email" required className={`mt-1 ${field}`} style={serif} />
            </div>
            <div>
              <label htmlFor="cf-message" className={`block text-xs ${subtext}`} style={mono}>
                Message
              </label>
              <textarea
                id="cf-message"
                name="message"
                required
                rows={5}
                placeholder={
                  post
                    ? "Tip: hover a section heading and click the # to copy its link — paste it here so I know exactly which part you mean."
                    : undefined
                }
                className={`mt-1 resize-y ${field} placeholder:text-sm placeholder:opacity-60`}
                style={serif}
              />
            </div>

            {status === "error" && (
              <p className="text-xs text-red-500" style={mono}>
                Couldn't send — please try again, or{" "}
                <a href={`mailto:${email}`} className="underline">
                  email me directly
                </a>
                .
              </p>
            )}

            <div className="flex items-center justify-between gap-4">
              <a href={`mailto:${email}`} className={`text-xs ${subtext} underline-offset-2 hover:underline`} style={mono}>
                prefer your mail app?
              </a>
              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2 text-sm text-white hover:bg-emerald-600 transition-colors disabled:opacity-60"
                style={mono}
              >
                <Send size={14} /> {status === "sending" ? "Sending…" : "Send"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

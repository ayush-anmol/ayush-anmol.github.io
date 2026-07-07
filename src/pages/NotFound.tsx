import { Link } from "react-router-dom";
import BlogLayout, { serif, mono } from "../components/BlogLayout";
import { useTheme } from "../context/ThemeContext";
import { getThemeTokens } from "../lib/themeToken";

export default function NotFound() {
  const { theme } = useTheme();
  const { subtext, accentText } = getThemeTokens(theme);

  return (
    <BlogLayout backTo="/" backLabel="home">
      <p className={`text-xs uppercase tracking-wide ${subtext}`} style={mono}>
        404
      </p>
      <h1 className="mt-2 text-3xl font-semibold" style={serif}>
        Nothing here.
      </h1>
      <p className={`mt-3 leading-relaxed ${subtext}`} style={serif}>
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/" className={`mt-6 inline-flex items-center gap-1.5 text-sm font-medium ${accentText} hover:underline`} style={mono}>
        ← back home
      </Link>
    </BlogLayout>
  );
}

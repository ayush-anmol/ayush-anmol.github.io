import matter from "gray-matter";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  category: string;
  content: string;
  minutes: number; // estimated reading time
}

const modules = import.meta.glob("../content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function slugFromPath(path: string) {
  return path.split("/").pop()!.replace(/\.md$/, "");
}

export const posts: BlogPost[] = Object.entries(modules)
  .map(([path, raw]) => {
    const { data, content } = matter(raw);
    return {
      slug: slugFromPath(path),
      title: data.title as string,
      date: data.date as string,
      summary: data.summary as string,
      tags: (data.tags as string[]) ?? [],
      category: (data.category as string) ?? "writing",
      content,
      // ~220 wpm is a fair reading pace for technical prose with code
      minutes: Math.max(1, Math.round(content.split(/\s+/).length / 220)),
    };
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export const categories: string[] = Array.from(
  new Set(posts.map((p) => p.category)),
).sort();

export function getPostBySlug(slug: string) {
  return posts.find((p) => p.slug === slug);
}

// prev/next stay within the current post's category; the list is sorted
// newest-first, so index-1 is the newer neighbour
export function getAdjacentPosts(slug: string) {
  const post = getPostBySlug(slug);
  if (!post) return { older: undefined, newer: undefined };
  const series = posts.filter((p) => p.category === post.category);
  const i = series.findIndex((p) => p.slug === slug);
  return { older: series[i + 1], newer: series[i - 1] };
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// "2026-07-03" → "03 July, 2026" (dates stay ISO in frontmatter for sorting)
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d || m > 12) return iso;
  return `${MONTHS[m - 1]} ${String(d).padStart(2, "0")}, ${y}`;
}
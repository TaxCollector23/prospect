import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conditional logic. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date (or ISO string / ms) as e.g. "Mar 14, 2026". */
export function formatDate(value: string | number | Date | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Human-readable "time until" a deadline, e.g. "in 12 days", "Today", "Closed". */
export function deadlineLabel(value: string | number | Date | null | undefined) {
  if (!value) return { label: "Rolling", tone: "muted" as const };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { label: "Rolling", tone: "muted" as const };
  const now = new Date();
  const ms = d.getTime() - now.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Closed", tone: "error" as const };
  if (days === 0) return { label: "Due today", tone: "error" as const };
  if (days === 1) return { label: "Due tomorrow", tone: "warning" as const };
  if (days <= 7) return { label: `${days} days left`, tone: "warning" as const };
  if (days <= 30) return { label: `${days} days left`, tone: "muted" as const };
  return { label: formatDate(d), tone: "muted" as const };
}

/** Stable pseudo-random number in [0,1) from a string seed. */
export function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^= h >>> 16) >>> 0) / 4294967296;
}

/** Clamp a number between min and max. */
export function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

/** Title-case a slug or word. */
export function titleCase(s: string) {
  return s
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Get initials from a name. */
export function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Truncate text to n chars on a word boundary. */
export function truncate(text: string, n = 160) {
  if (text.length <= n) return text;
  return text.slice(0, text.lastIndexOf(" ", n)).trimEnd() + "…";
}

/** Simple absolute URL builder using NEXT_PUBLIC_APP_URL. */
export function absoluteUrl(path = "") {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Debounce a function. */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  delay = 250,
) {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

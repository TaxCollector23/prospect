import Link from "next/link";
import { cn } from "@/lib/utils";

/** The Prospect compass mark — an arrow pointing forward and up. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-7 w-7", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#38BDF8" />
      <circle cx="16" cy="16" r="9.5" stroke="#06283D" strokeWidth="1.6" opacity="0.35" />
      {/* Compass needle pointing forward and slightly up (NE) */}
      <path
        d="M22.5 9.5L13.8 14.2L11 21L19.7 16.3L22.5 9.5Z"
        fill="#06283D"
      />
      <path d="M13.8 14.2L19.7 16.3L11 21L13.8 14.2Z" fill="#06283D" opacity="0.45" />
      <circle cx="16" cy="16" r="1.6" fill="#38BDF8" />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  showWordmark = true,
}: {
  className?: string;
  href?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight",
        className,
      )}
      aria-label="Prospect home"
    >
      <LogoMark />
      {showWordmark && <span className="text-lg">Prospect</span>}
    </Link>
  );
}

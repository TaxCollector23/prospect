import { ArrowUpRight } from "lucide-react";

/** Discord logo glyph. */
function DiscordGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3c-.2.36-.43.84-.59 1.23-1.78-.27-3.55-.27-5.3 0-.16-.39-.39-.87-.59-1.23a19.7 19.7 0 0 0-3.76 1.37C3.6 7.84 2.94 11.2 3.17 14.51a19.9 19.9 0 0 0 6.06 3.06c.49-.66.92-1.36 1.29-2.09-.71-.27-1.39-.6-2.03-.99.17-.13.34-.26.5-.4 3.92 1.81 8.18 1.81 12.05 0 .16.14.33.27.5.4-.64.39-1.32.72-2.03.99.37.73.8 1.43 1.29 2.09a19.87 19.87 0 0 0 6.06-3.06c.3-3.81-.51-7.14-2.55-10.14ZM9.68 12.65c-.95 0-1.73-.87-1.73-1.94 0-1.07.76-1.94 1.73-1.94.97 0 1.75.88 1.73 1.94 0 1.07-.76 1.94-1.73 1.94Zm4.64 0c-.95 0-1.73-.87-1.73-1.94 0-1.07.76-1.94 1.73-1.94.97 0 1.75.88 1.73 1.94 0 1.07-.76 1.94-1.73 1.94Z" />
    </svg>
  );
}

export function DiscordCard({
  serverName,
  serverUrl,
}: {
  serverName: string;
  serverUrl: string;
}) {
  return (
    <a
      href={serverUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-[#5865F2]/5 p-4 transition-colors hover:border-[#5865F2]/40 hover:bg-[#5865F2]/10"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5865F2] text-white">
          <DiscordGlyph className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Community
          </p>
          <p className="font-medium leading-tight">{serverName}</p>
        </div>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

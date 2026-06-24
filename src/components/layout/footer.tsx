import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { APP_TAGLINE } from "@/lib/constants";

const LINKS = {
  Product: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/saved", label: "Saved" },
    { href: "/onboarding", label: "Get started" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            {APP_TAGLINE}
          </p>
        </div>
        {Object.entries(LINKS).map(([group, items]) => (
          <div key={group}>
            <h3 className="text-sm font-semibold">{group}</h3>
            <ul className="mt-3 space-y-2">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Prospect. All rights reserved.</p>
          <p>Discover opportunities tailored to your future.</p>
        </div>
      </div>
    </footer>
  );
}

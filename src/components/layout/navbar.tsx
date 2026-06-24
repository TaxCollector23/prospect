"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Bookmark,
  Settings,
  User as UserIcon,
  LogOut,
  Menu,
  Shield,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth/auth-provider";
import { NAV_LINKS } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  "/dashboard": LayoutDashboard,
  "/saved": Bookmark,
  "/settings": Settings,
  "/profile": UserIcon,
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useAuth();
  const [q, setQ] = React.useState("");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/dashboard?q=${encodeURIComponent(q.trim())}`);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-4">
        <Logo className="shrink-0" href="/dashboard" />

        {/* Center search */}
        <form
          onSubmit={onSearch}
          className="relative ml-2 hidden max-w-md flex-1 md:block"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search opportunities…"
            className="pl-9"
            aria-label="Search opportunities"
          />
        </form>

        <div className="ml-auto flex items-center gap-1">
          {/* Desktop nav links */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const Icon = ICONS[link.href] ?? UserIcon;
              const active = pathname === link.href;
              return (
                <Button
                  key={link.href}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                >
                  <Link href={link.href}>
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </Button>
              );
            })}
          </nav>

          <ThemeToggle />

          {/* Profile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Account menu"
              >
                <Avatar>
                  {profile?.photoURL && (
                    <AvatarImage src={profile.photoURL} alt={profile.name} />
                  )}
                  <AvatarFallback>{initials(profile?.name)}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-sm font-normal text-foreground">
                <div className="font-medium">{profile?.name ?? "Explorer"}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {profile?.email}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserIcon className="h-4 w-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/saved">
                  <Bookmark className="h-4 w-4" /> Saved
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
              </DropdownMenuItem>
              {profile?.isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <Shield className="h-4 w-4" /> Admin
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await logout();
                  router.replace("/onboarding");
                }}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-3 lg:hidden">
          <form onSubmit={onSearch} className="relative mb-3 md:hidden">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search opportunities…"
              className="pl-9"
            />
          </form>
          <nav className="grid gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = ICONS[link.href] ?? UserIcon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent",
                    pathname === link.href && "bg-secondary font-medium",
                  )}
                >
                  <Icon className="h-4 w-4" /> {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

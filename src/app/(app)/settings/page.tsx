"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, Loader2, LogOut, Moon, Sun, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { NotificationPreferences } from "@/types";

const NOTIFICATION_OPTIONS: {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}[] = [
  { key: "emailAlerts", label: "Email alerts", description: "Important account and opportunity updates." },
  { key: "weeklyDigest", label: "Weekly digest", description: "A weekly roundup of top opportunities for you." },
  { key: "newOpportunities", label: "New opportunities", description: "When fresh opportunities match your interests." },
  { key: "deadlineReminders", label: "Deadline reminders", description: "Before saved opportunities close." },
  { key: "applicationReminders", label: "Application reminders", description: "Nudges to finish applications you've started." },
];

export default function SettingsPage() {
  const router = useRouter();
  const { profile, updateUserProfile, logout, demoMode } = useAuth();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = React.useState(false);
  const [prefs, setPrefs] = React.useState<NotificationPreferences | null>(
    profile?.notifications ?? null,
  );

  React.useEffect(() => {
    if (profile?.notifications) setPrefs(profile.notifications);
  }, [profile]);

  const toggle = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!prefs) return;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setSaving(true);
    try {
      await updateUserProfile({ notifications: next });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-page max-w-3xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage notifications, appearance, and your account.
        </p>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Notifications
            {saving && (
              <Loader2 className="ml-auto h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </CardTitle>
          <CardDescription>
            Choose what Prospect emails you about.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {NOTIFICATION_OPTIONS.map((opt, i) => (
            <React.Fragment key={opt.key}>
              {i > 0 && <Separator />}
              <div className="flex items-center justify-between py-3">
                <div className="pr-4">
                  <Label htmlFor={opt.key} className="cursor-pointer">
                    {opt.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {opt.description}
                  </p>
                </div>
                <Switch
                  id={opt.key}
                  checked={prefs?.[opt.key] ?? false}
                  onCheckedChange={(v) => toggle(opt.key, v)}
                />
              </div>
            </React.Fragment>
          ))}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Switch between light and dark mode.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {theme === "dark" ? "Dark" : "Light"} mode
              </span>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
              aria-label="Toggle dark mode"
            />
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            {profile?.email}
            {demoMode && " · Demo mode"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={async () => {
              await logout();
              router.replace("/onboarding");
            }}
          >
            <LogOut className="h-4 w-4" /> Log out
          </Button>
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() =>
              toast("Delete account", {
                description:
                  "Account deletion will be available soon. Contact support to remove your data.",
              })
            }
          >
            <Trash2 className="h-4 w-4" /> Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

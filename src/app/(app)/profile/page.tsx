"use client";

import * as React from "react";
import { Check, Loader2, MapPin, Pencil, Target } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES, INTERESTS } from "@/lib/constants";
import { computeProfileCompletion } from "@/lib/data/profile";
import { regionForCountry } from "@/lib/geo";
import { initials, cn } from "@/lib/utils";

export default function ProfilePage() {
  const { profile, updateUserProfile } = useAuth();
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [name, setName] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");
  const [careerGoals, setCareerGoals] = React.useState("");
  const [interests, setInterests] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (profile) {
      setName(profile.name);
      setCountry(profile.country);
      setPostalCode(profile.postalCode ?? "");
      setCareerGoals(profile.careerGoals);
      setInterests(profile.interests);
    }
  }, [profile]);

  if (!profile) return null;

  const completion = computeProfileCompletion({
    ...profile,
    name,
    country,
    careerGoals,
    interests,
    postalCode,
  });

  const toggleInterest = (i: string) =>
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );

  const save = async () => {
    setSaving(true);
    try {
      await updateUserProfile({
        name,
        country,
        postalCode,
        careerGoals,
        interests,
        region: regionForCountry(country),
      });
      toast.success("Profile updated");
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-page max-w-3xl py-8">
      {/* Header card */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
          <Avatar className="h-20 w-20 text-xl">
            {profile.photoURL && (
              <AvatarImage src={profile.photoURL} alt={profile.name} />
            )}
            <AvatarFallback className="text-xl">
              {initials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">
              {profile.name}
            </h1>
            <p className="text-muted-foreground">{profile.email}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground sm:justify-start">
              {profile.country && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[profile.city, profile.state, profile.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
              {profile.careerGoals && (
                <span className="inline-flex items-center gap-1">
                  <Target className="h-3.5 w-3.5" />
                  {profile.careerGoals}
                </span>
              )}
            </div>
          </div>
          {!editing && (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Completion */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            Profile strength
            <span className="text-sm font-normal text-muted-foreground">
              {completion}%
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={completion} />
          <p className="mt-2 text-sm text-muted-foreground">
            {completion >= 100
              ? "Your profile is complete — recommendations are fully tailored."
              : "Complete your profile for sharper recommendations."}
          </p>
        </CardContent>
      </Card>

      {/* Details / edit */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>
            These shape the opportunities we recommend.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {editing ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="career">Career goal</Label>
                  <Input
                    id="career"
                    value={careerGoals}
                    onChange={(e) => setCareerGoals(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="postal">ZIP / Postal code</Label>
                  <Input
                    id="postal"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((i) => {
                    const active = interests.includes(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleInterest(i)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:bg-accent",
                        )}
                      >
                        {active && <Check className="h-3 w-3" />}
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={save} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save changes
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Interests
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.interests.length ? (
                    profile.interests.map((i) => (
                      <Badge key={i} variant="secondary">
                        {i}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No interests yet.
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Referral source
                </p>
                <p className="mt-1 text-sm">{profile.referralSource || "—"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

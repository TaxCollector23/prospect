"use client";

import * as React from "react";
import {
  BadgeCheck,
  Database,
  Eye,
  Loader2,
  Plus,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useOpportunities } from "@/hooks/use-opportunities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OPPORTUNITY_TYPES, COUNTRIES } from "@/lib/constants";
import { qualityTier, computeQualityScore } from "@/lib/quality";
import { formatDate } from "@/lib/utils";
import type { Opportunity, OpportunityType } from "@/types";

export default function AdminPage() {
  const { opportunities, loading } = useOpportunities();
  const [items, setItems] = React.useState<Opportunity[]>([]);
  const [createOpen, setCreateOpen] = React.useState(false);

  React.useEffect(() => {
    if (opportunities.length) setItems(opportunities);
  }, [opportunities]);

  const stats = React.useMemo(() => {
    const total = items.length;
    const verified = items.filter((o) => o.verified).length;
    const featured = items.filter((o) => o.featured).length;
    const avgQuality = total
      ? Math.round(items.reduce((s, o) => s + o.qualityScore, 0) / total)
      : 0;
    return { total, verified, featured, avgQuality };
  }, [items]);

  const update = (id: string, patch: Partial<Opportunity>) => {
    setItems((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    );
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((o) => o.id !== id));
    toast.success("Opportunity deleted");
  };

  const addItem = (o: Opportunity) => {
    setItems((prev) => [o, ...prev]);
    setCreateOpen(false);
    toast.success("Opportunity created");
  };

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage opportunities, verification, and view analytics.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> New opportunity
            </Button>
          </DialogTrigger>
          <CreateDialog onCreate={addItem} />
        </Dialog>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Database} label="Total" value={stats.total} />
        <StatCard icon={BadgeCheck} label="Verified" value={stats.verified} />
        <StatCard icon={Star} label="Featured" value={stats.featured} />
        <StatCard
          icon={TrendingUp}
          label="Avg. quality"
          value={`${stats.avgQuality}`}
        />
      </div>

      <Tabs defaultValue="opportunities">
        <TabsList>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Title</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Quality</th>
                        <th className="px-4 py-3 font-medium">Deadline</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 text-right font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((o) => {
                        const tier = qualityTier(o.qualityScore);
                        return (
                          <tr
                            key={o.id}
                            className="border-b border-border last:border-0 hover:bg-secondary/40"
                          >
                            <td className="max-w-xs px-4 py-3">
                              <p className="truncate font-medium">{o.title}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {o.organization}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary">
                                {
                                  OPPORTUNITY_TYPES.find(
                                    (t) => t.value === o.opportunityType,
                                  )?.label
                                }
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={tier.tone}>
                                {o.qualityScore} · {tier.label}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {o.deadline ? formatDate(o.deadline) : "Rolling"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                {o.verified && (
                                  <Badge variant="success">Verified</Badge>
                                )}
                                {o.featured && (
                                  <Badge variant="default">Featured</Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    update(o.id, { verified: !o.verified })
                                  }
                                  title="Toggle verified"
                                >
                                  <BadgeCheck
                                    className={
                                      o.verified ? "text-success" : ""
                                    }
                                  />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    update(o.id, { featured: !o.featured })
                                  }
                                  title="Toggle featured"
                                >
                                  <Star
                                    className={
                                      o.featured
                                        ? "fill-primary text-primary"
                                        : ""
                                    }
                                  />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => remove(o.id)}
                                  className="text-destructive hover:text-destructive"
                                  title="Delete"
                                >
                                  <Trash2 />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnalyticsCard
              icon={Eye}
              label="Tracked events"
              value="Views · Saves · Applies · Shares"
              note="Streaming to PostHog when configured."
            />
            <AnalyticsCard
              icon={Database}
              label="Ingestion"
              value="Manual · CSV · API"
              note="Crawler integration ready (see /api/ingest)."
            />
            <AnalyticsCard
              icon={TrendingUp}
              label="Recommendation"
              value="7 weighted signals"
              note="Interest, career, location, behavior, freshness, quality, popularity."
            />
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Connect PostHog (<code>NEXT_PUBLIC_POSTHOG_KEY</code>) to view live
            dashboards for views, clicks, applications, saves, shares,
            recommendation performance, search queries, and retention.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-5 w-5 text-primary" /> {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-medium">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

function CreateDialog({ onCreate }: { onCreate: (o: Opportunity) => void }) {
  const [title, setTitle] = React.useState("");
  const [organization, setOrganization] = React.useState("");
  const [type, setType] = React.useState<OpportunityType>("scholarship");
  const [country, setCountry] = React.useState("United States");
  const [shortDescription, setShortDescription] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [applicationUrl, setApplicationUrl] = React.useState("");
  const [deadline, setDeadline] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !organization || !applicationUrl) {
      toast.error("Title, organization, and application URL are required.");
      return;
    }
    const now = new Date().toISOString();
    const base: Opportunity = {
      id: `new-${Date.now()}`,
      title,
      organization,
      organizationLogo: null,
      description: description || shortDescription,
      shortDescription: shortDescription || description.slice(0, 200),
      requirements: [],
      eligibility: [],
      opportunityType: type,
      location: country,
      remote: country === "Remote / Global",
      country,
      tags: [],
      deadline: deadline || null,
      applicationUrl,
      websiteUrl: null,
      discordServerName: null,
      discordServerUrl: null,
      verified: false,
      featured: false,
      qualityScore: 0,
      popularity: 0,
      amount: null,
      createdAt: now,
      updatedAt: now,
    };
    base.qualityScore = computeQualityScore(base);
    onCreate(base);
  };

  return (
    <DialogContent className="max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create opportunity</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="t">Title *</Label>
          <Input id="t" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="org">Organization *</Label>
          <Input
            id="org"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as OpportunityType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPPORTUNITY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue />
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
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="short">Short description</Label>
          <Input
            id="short"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="url">Application URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://"
              value={applicationUrl}
              onChange={(e) => setApplicationUrl(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dl">Deadline</Label>
            <Input
              id="dl"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Create</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

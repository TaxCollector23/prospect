"use client";

import * as React from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useSavedStore } from "@/stores/saved-store";
import { useAuth } from "@/components/auth/auth-provider";
import { logActivity } from "@/lib/data/activity";
import { cn } from "@/lib/utils";

export function SaveButton({
  opportunityId,
  variant = "outline",
  size = "icon",
  withLabel = false,
  className,
}: {
  opportunityId: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  withLabel?: boolean;
  className?: string;
}) {
  const { user } = useAuth();
  const toggle = useSavedStore((s) => s.toggle);
  const ids = useSavedStore((s) => s.ids);
  const saved = ids.includes(opportunityId);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggle(opportunityId, user?.uid ?? null);
    await logActivity(user?.uid ?? null, opportunityId, saved ? "unsave" : "save");
    toast(saved ? "Removed from saved" : "Saved", {
      description: saved
        ? "This opportunity was removed from your list."
        : "Find it later on your Saved page.",
    });
  };

  return (
    <Button
      variant={saved ? "secondary" : variant}
      size={withLabel ? "default" : size}
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save opportunity"}
      className={className}
    >
      <Bookmark
        className={cn("h-4 w-4", saved && "fill-primary text-primary")}
      />
      {withLabel && <span>{saved ? "Saved" : "Save"}</span>}
    </Button>
  );
}

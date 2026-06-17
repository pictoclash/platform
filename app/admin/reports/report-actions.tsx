"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resolveReport } from "@/app/report/actions";
import { banUser, sendNotification } from "@/app/admin/actions";

type Report = {
  id: string;
  user_id: string | null;
  strike_id: string | null;
  character_id: string | null;
  description: string | null;
};

export function ReportActions({
  report,
  isAdmin,
}: {
  report: Report;
  isAdmin: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"resolve" | "dismiss" | "warn" | "ban">("resolve");
  const [note, setNote] = useState("");

  const openDialog = (type: "resolve" | "dismiss" | "warn" | "ban") => {
    setDialogType(type);
    setNote("");
    setDialogOpen(true);
  };

  const handleResolve = () => {
    startTransition(async () => {
      await resolveReport(report.id, "resolved", note);
      setDialogOpen(false);
    });
  };

  const handleDismiss = () => {
    startTransition(async () => {
      await resolveReport(report.id, "dismissed", note);
      setDialogOpen(false);
    });
  };

  const handleWarn = () => {
    if (!report.user_id) return;
    startTransition(async () => {
      const message = note || "You have received a warning regarding your recent activity. Please review our community guidelines.";
      await sendNotification(report.user_id!, message, "system");
      await resolveReport(report.id, "resolved", `Warned user: ${note || "Standard warning"}`);
      setDialogOpen(false);
    });
  };

  const handleBan = () => {
    if (!report.user_id) return;
    startTransition(async () => {
      await banUser(report.user_id!);
      await resolveReport(report.id, "resolved", `Banned user: ${note || "No additional notes"}`);
      setDialogOpen(false);
    });
  };

  const dialogConfig = {
    resolve: {
      title: "Resolve Report",
      description: "Mark this report as resolved. Add an optional note for your records.",
      action: handleResolve,
      actionLabel: "Resolve",
      variant: "default" as const,
    },
    dismiss: {
      title: "Dismiss Report",
      description: "Dismiss this report as invalid or not actionable.",
      action: handleDismiss,
      actionLabel: "Dismiss",
      variant: "secondary" as const,
    },
    warn: {
      title: "Warn User",
      description: "Send a warning notification to the reported user and resolve this report.",
      action: handleWarn,
      actionLabel: "Send Warning",
      variant: "default" as const,
    },
    ban: {
      title: "Ban User",
      description: "Ban the reported user and resolve this report. This action can be reversed from the user management page.",
      action: handleBan,
      actionLabel: "Ban User",
      variant: "destructive" as const,
    },
  };

  const config = dialogConfig[dialogType];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending}>
            {isPending ? "..." : "Actions"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Resolution</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => openDialog("resolve")}>
            Mark Resolved
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog("dismiss")}>
            Dismiss
          </DropdownMenuItem>

          {report.user_id && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>User Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openDialog("warn")}>
                Warn User
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem
                  onClick={() => openDialog("ban")}
                  className="text-red-600"
                >
                  Ban User
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{config.title}</DialogTitle>
            <DialogDescription>{config.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">
                {dialogType === "warn" ? "Warning Message" : "Note"}{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  dialogType === "warn"
                    ? "Enter the warning message to send..."
                    : "Add a note for your records..."
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={config.variant === "destructive" ? "destructive" : "default"}
              onClick={config.action}
              disabled={isPending}
            >
              {isPending ? "Processing..." : config.actionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitReport, type ReportTarget } from "@/app/report/actions";
import { REPORT_REASONS } from "@/app/report/constants";

export function ReportButton({
  target,
  targetName,
}: {
  target: ReportTarget;
  targetName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason) {
      setError("Please select a reason");
      return;
    }

    startTransition(async () => {
      const result = await submitReport(target, reason, description);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setReason("");
          setDescription("");
        }, 1500);
      }
    });
  };

  const targetTypeLabel =
    target.type === "strike"
      ? "strike"
      : target.type === "character"
      ? "character"
      : "user";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="font-medium">Report submitted</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Thank you for helping keep our community safe.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Report {targetTypeLabel}</DialogTitle>
              <DialogDescription>
                Report &quot;{targetName}&quot; for violating community guidelines.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Details <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any additional context..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

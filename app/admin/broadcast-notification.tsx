"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { sendBroadcastNotification } from "./actions";

export function BroadcastNotification() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; count?: number; error?: string } | null>(null);

  const handleSend = () => {
    if (!message.trim()) return;
    startTransition(async () => {
      const res = await sendBroadcastNotification(message);
      setResult(res);
      if (res.success) {
        setMessage("");
        setTimeout(() => {
          setOpen(false);
          setResult(null);
        }, 2000);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Broadcast Notification</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Broadcast Notification</DialogTitle>
          <DialogDescription>
            Send a notification to all users. Use this for important announcements.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="broadcast-message">Message</Label>
            <Textarea
              id="broadcast-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your announcement..."
              rows={4}
            />
          </div>
          {result?.error && (
            <p className="text-sm text-destructive">{result.error}</p>
          )}
          {result?.success && (
            <p className="text-sm text-green-600">Sent to {result.count} users!</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!message.trim() || isPending}>
            {isPending ? "Sending..." : "Send to All Users"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

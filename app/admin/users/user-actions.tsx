"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  setUserRole,
  adjustPictoCash,
  setUserTeam,
  banUser,
  unbanUser,
  deleteUser,
  sendNotification,
  resetUserStats,
} from "../actions";

export function UserActions({
  userId,
  username,
  isAdmin,
  isModerator,
  isActive,
  currentUserIsAdmin,
  teamAName,
  teamAColor,
  teamBName,
  teamBColor,
}: {
  userId: string;
  username: string;
  isAdmin: boolean;
  isModerator: boolean;
  isActive: boolean;
  currentUserIsAdmin: boolean;
  teamAName?: string;
  teamAColor?: string;
  teamBName?: string;
  teamBColor?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleRoleChange = (role: "user" | "moderator" | "admin") => {
    startTransition(async () => {
      await setUserRole(userId, role);
    });
  };

  const handleTeamChange = (team: "a" | "b" | null) => {
    startTransition(async () => {
      await setUserTeam(userId, team);
    });
  };

  const handleCashAdjust = (amount: number) => {
    startTransition(async () => {
      await adjustPictoCash(userId, amount);
    });
  };

  const handleBan = () => {
    startTransition(async () => {
      await banUser(userId);
      setBanOpen(false);
    });
  };

  const handleUnban = () => {
    startTransition(async () => {
      await unbanUser(userId);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteUser(userId);
      setDeleteOpen(false);
    });
  };

  const handleSendNotification = () => {
    if (!message.trim()) return;
    startTransition(async () => {
      await sendNotification(userId, message);
      setMessage("");
      setNotificationOpen(false);
    });
  };

  const handleResetStats = () => {
    startTransition(async () => {
      await resetUserStats(userId);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending}>
            {isPending ? "..." : "Actions"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Role Management - Admin only */}
          {currentUserIsAdmin && (
            <>
              <DropdownMenuLabel>Role</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleRoleChange("user")}>
                {!isAdmin && !isModerator && "✓ "}User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange("moderator")}>
                {isModerator && "✓ "}Moderator
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange("admin")}>
                {isAdmin && "✓ "}Admin
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Team Assignment */}
          <DropdownMenuLabel>Team</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleTeamChange("a")}>
            <span className="flex items-center gap-2">
              {teamAColor && (
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: teamAColor }} />
              )}
              {teamAName || "Team A"}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleTeamChange("b")}>
            <span className="flex items-center gap-2">
              {teamBColor && (
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: teamBColor }} />
              )}
              {teamBName || "Team B"}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleTeamChange(null)}>
            No Team
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* PictoCash */}
          <DropdownMenuLabel>PictoCash</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleCashAdjust(100)} className="text-green-600">
            +100 PC
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCashAdjust(500)} className="text-green-600">
            +500 PC
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCashAdjust(-100)} className="text-red-600">
            -100 PC
          </DropdownMenuItem>
          {currentUserIsAdmin && (
            <DropdownMenuItem onClick={handleResetStats} className="text-orange-600">
              Reset to 0
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />

          {/* Communication */}
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setNotificationOpen(true)}>
            Send Notification
          </DropdownMenuItem>

          {/* Moderation - Admin only */}
          {currentUserIsAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Moderation</DropdownMenuLabel>
              {isActive ? (
                <DropdownMenuItem
                  onClick={() => setBanOpen(true)}
                  className="text-red-600"
                >
                  Ban User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleUnban} className="text-green-600">
                  Unban User
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-red-600"
              >
                Delete User
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Send Notification Dialog */}
      <Dialog open={notificationOpen} onOpenChange={setNotificationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Send a notification to @{username}. They will see this in their notifications.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotificationOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification} disabled={!message.trim() || isPending}>
              {isPending ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Confirmation Dialog */}
      <AlertDialog open={banOpen} onOpenChange={setBanOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban @{username}? They will not be able to access their account until unbanned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBan}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Banning..." : "Ban User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete @{username}? This action cannot be undone. All their characters will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

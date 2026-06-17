"use client";

import Link from "next/link";
import { X, Bell, Swords, MessageCircle, Trophy, Megaphone, Trash2 } from "lucide-react";
import { PictoModule, PictoText } from "@/components/picto";
import { PictoButton, PictoIconButton, PictoArrayText } from "@/components/picto/primitives";
import { clearNotification, clearAllNotifications, markRead } from "./actions";
import { NOTIFICATION_TYPES } from "@/lib/constants";

type Notification = {
  id: string;
  type: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "JUST NOW";
  if (diffMins < 60) return `${diffMins}M AGO`;
  if (diffHours < 24) return `${diffHours}H AGO`;
  if (diffDays < 7) return `${diffDays}D AGO`;
  return date.toLocaleDateString().toUpperCase();
}

function getNotificationIcon(type: string, className?: string) {
  const iconClass = className || "w-4 h-4 sm:w-[18px] sm:h-[18px]";
  switch (type) {
    case NOTIFICATION_TYPES.STRIKE_RECEIVED:
      return <Swords className={iconClass} />;
    case NOTIFICATION_TYPES.TIP_RECEIVED:
      return <MessageCircle className={iconClass} />;
    case NOTIFICATION_TYPES.CHECKPOINT_RESULT:
      return <Trophy className={iconClass} />;
    case NOTIFICATION_TYPES.ADMIN_BROADCAST:
    case NOTIFICATION_TYPES.ADMIN_MESSAGE:
      return <Megaphone className={iconClass} />;
    default:
      return <Bell className={iconClass} />;
  }
}

function getNotificationColor(type: string): string {
  switch (type) {
    case NOTIFICATION_TYPES.STRIKE_RECEIVED:
      return "#ff6b35";
    case NOTIFICATION_TYPES.TIP_RECEIVED:
      return "#00ff47";
    case NOTIFICATION_TYPES.CHECKPOINT_RESULT:
      return "#ffd700";
    case NOTIFICATION_TYPES.ADMIN_BROADCAST:
    case NOTIFICATION_TYPES.ADMIN_MESSAGE:
      return "#ff3b30";
    default:
      return "#ffffff";
  }
}

function NotificationItem({ notification }: { notification: Notification }) {
  const handleClear = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await clearNotification(notification.id);
  };

  const handleClick = async () => {
    if (!notification.is_read) {
      await markRead(notification.id);
    }
  };

  const iconColor = getNotificationColor(notification.type);

  const content = (
    <div
      className={`relative group flex items-start gap-3 sm:gap-4 p-3 sm:p-5 transition-all ${
        notification.is_read
          ? "bg-[#252525] hover:bg-[#2a2a2a]"
          : "bg-[#2a2a2a] hover:bg-[#303030]"
      }`}
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full"
        style={{ backgroundColor: `${iconColor}20`, color: iconColor }}
      >
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <PictoText
            size="sm"
            color="white"
            uppercase={false}
            className={`block leading-relaxed text-xs sm:text-sm ${!notification.is_read ? "font-bold" : ""}`}
          >
            {notification.message}
          </PictoText>

          {/* Clear button - always visible on mobile, hover on desktop */}
          <button
            onClick={handleClear}
            className="flex-shrink-0 p-1.5 -mt-1 -mr-1 text-white/30 hover:text-white hover:bg-white/10 rounded transition-all sm:opacity-0 sm:group-hover:opacity-100"
            title="Clear"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2">
          <PictoText size="xs" muted className="text-[10px] sm:text-xs">
            {getTimeAgo(notification.created_at)}
          </PictoText>
          {!notification.is_read && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00ff47]" />
          )}
        </div>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={handleClick} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export function NotificationList({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <PictoModule className="p-8 sm:p-12 text-center">
        <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🦗</div>
        <PictoText size="lg" weight="bold" color="white" className="block text-base sm:text-lg">
          CRICKETS...
        </PictoText>
        <PictoText size="sm" muted className="mt-2 block text-xs sm:text-sm">
          NO NOTIFICATIONS YET. GO MAKE SOME ART
          <br />
          OR WAIT FOR SOMEONE TO STRIKE YOUR CHARACTERS!
        </PictoText>
        <div className="mt-4 sm:mt-6">
          <PictoButton href="/strikes/new" color="#00ff47" size="sm">
            CREATE A STRIKE
          </PictoButton>
        </div>
      </PictoModule>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <PictoModule className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2 sm:gap-3">
            <PictoArrayText
              size="3xl"
              color={unreadCount > 0 ? "#00ff47" : "#ffffff"}
              glow={unreadCount > 0}
              tabularNums
              className="text-2xl sm:text-3xl"
            >
              {unreadCount > 0 ? unreadCount : notifications.length}
            </PictoArrayText>
            <PictoText size="sm" muted className="text-xs sm:text-sm">
              {unreadCount > 0 ? "UNREAD" : "NOTIFICATIONS"}
            </PictoText>
          </div>
          <form action={clearAllNotifications}>
            <PictoIconButton variant="danger" size="sm">
              <Trash2 size={16} />
            </PictoIconButton>
          </form>
        </div>
      </PictoModule>

      {/* Notifications */}
      <PictoModule noPadding className="overflow-hidden">
        <div className="divide-y divide-white/5">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      </PictoModule>
    </div>
  );
}

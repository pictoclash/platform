import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotificationList } from "./notification-list";

type Notification = {
  id: string;
  type: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export default async function NotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-[#c5c5c5]">
      <div className="max-w-2xl mx-auto px-3 py-4 sm:px-4 sm:py-8">
        <NotificationList notifications={(notifications as Notification[]) || []} />
      </div>
    </div>
  );
}

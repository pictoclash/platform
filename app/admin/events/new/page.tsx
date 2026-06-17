import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "../event-form";

export default async function NewEventPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/admin");
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <EventForm />
    </div>
  );
}

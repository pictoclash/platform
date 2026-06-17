import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "../../event-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
        <div className="mb-6">
          <Link
            href={`/admin/events/${id}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Back to Event
          </Link>
        </div>
      <EventForm event={event} />
    </div>
  );
}

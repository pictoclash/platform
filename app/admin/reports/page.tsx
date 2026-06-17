import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportActions } from "./report-actions";

type Report = {
  id: string;
  reporter_id: string;
  strike_id: string | null;
  character_id: string | null;
  user_id: string | null;
  reason: string;
  description: string | null;
  status: "pending" | "resolved" | "dismissed";
  resolved_by_id: string | null;
  resolution_note: string | null;
  created_at: string;
  resolved_at: string | null;
};

const REASON_LABELS: Record<string, string> = {
  malice: "Harassment/Malice",
  stolen: "Stolen artwork",
  untagged_ai: "Untagged AI",
  nsfw: "NSFW content",
  spam: "Spam",
  other: "Other",
};

export default async function AdminReportsPage() {
  const supabase = await createClient();

  // Batch 1: Get auth user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Batch 2: Get profile and reports in parallel
  const [{ data: profile }, reportsResult] = await Promise.all([
    supabase.from("profiles").select("is_admin, is_moderator").eq("id", user.id).single(),
    supabase.from("reports").select("*").order("created_at", { ascending: false }),
  ]);
  const reports = reportsResult.data as Report[] | null;

  if (!profile?.is_admin && !profile?.is_moderator) {
    redirect("/");
  }

  // Batch 3: Get all related data in parallel
  const reporterIds = [...new Set(reports?.map((r) => r.reporter_id) || [])];
  const strikeIds = reports?.filter((r) => r.strike_id).map((r) => r.strike_id!) || [];
  const characterIds = reports?.filter((r) => r.character_id).map((r) => r.character_id!) || [];
  const userIds = reports?.filter((r) => r.user_id).map((r) => r.user_id!) || [];

  const [{ data: reporters }, { data: strikes }, { data: characters }, { data: reportedUsers }] =
    await Promise.all([
      reporterIds.length > 0
        ? supabase.from("profiles").select("id, username").in("id", reporterIds)
        : Promise.resolve({ data: [] }),
      strikeIds.length > 0
        ? supabase.from("strikes").select("id, creator_id").in("id", strikeIds)
        : Promise.resolve({ data: [] }),
      characterIds.length > 0
        ? supabase.from("characters").select("id, name, slug, owner_id, profiles!characters_owner_id_fkey(username)").in("id", characterIds)
        : Promise.resolve({ data: [] }),
      userIds.length > 0
        ? supabase.from("profiles").select("id, username").in("id", userIds)
        : Promise.resolve({ data: [] }),
    ]);

  const reporterMap = new Map(reporters?.map((r) => [r.id, r.username]) || []);
  const strikeMap = new Map(strikes?.map((s) => [s.id, s]) || []);
  const characterMap = new Map(characters?.map((c) => [c.id, c]) || []);
  const userMap = new Map(reportedUsers?.map((u) => [u.id, u.username]) || []);

  const pendingReports = reports?.filter((r) => r.status === "pending") || [];
  const resolvedReports = reports?.filter((r) => r.status !== "pending") || [];

  const getTargetInfo = (report: Report) => {
    if (report.strike_id) {
      const strike = strikeMap.get(report.strike_id);
      return {
        type: "Strike",
        name: `Strike #${report.strike_id.slice(0, 8)}`,
        link: `/strikes/${report.strike_id}`,
      };
    }
    if (report.character_id) {
      const character = characterMap.get(report.character_id);
      // Supabase returns the joined profile as an object (not array) due to the foreign key constraint
      const profiles = character?.profiles as { username: string } | { username: string }[] | null;
      const ownerUsername = Array.isArray(profiles) ? profiles[0]?.username : profiles?.username;
      return {
        type: "Character",
        name: character?.name || "Unknown",
        link: ownerUsername && character?.slug ? `/characters/${ownerUsername}/${character.slug}` : null,
      };
    }
    if (report.user_id) {
      const username = userMap.get(report.user_id);
      return {
        type: "User",
        name: `@${username || "unknown"}`,
        link: null,
      };
    }
    return { type: "Unknown", name: "Unknown", link: null };
  };

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Back to Admin
          </Link>
        </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Review and resolve community reports
        </p>
      </div>

      {/* Pending Reports */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Pending Reports</CardTitle>
            {pendingReports.length > 0 && (
              <Badge variant="destructive">{pendingReports.length}</Badge>
            )}
          </div>
          <CardDescription>
            Reports awaiting review
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingReports.map((report) => {
                const target = getTargetInfo(report);
                return (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <Badge variant="outline" className="mb-1">
                          {target.type}
                        </Badge>
                        {target.link ? (
                          <Link
                            href={target.link}
                            className="block font-medium hover:underline"
                          >
                            {target.name}
                          </Link>
                        ) : (
                          <p className="font-medium">{target.name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">
                        {REASON_LABELS[report.reason] || report.reason}
                      </p>
                      {report.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {report.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      @{reporterMap.get(report.reporter_id) || "unknown"}
                    </TableCell>
                    <TableCell>
                      {new Date(report.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <ReportActions report={report} isAdmin={profile.is_admin} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {pendingReports.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No pending reports
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resolved Reports */}
      {resolvedReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resolved Reports</CardTitle>
            <CardDescription>
              Previously handled reports
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Target</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resolved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolvedReports.slice(0, 20).map((report) => {
                  const target = getTargetInfo(report);
                  return (
                    <TableRow key={report.id} className="opacity-60">
                      <TableCell>
                        <Badge variant="outline" className="mr-2">
                          {target.type}
                        </Badge>
                        {target.name}
                      </TableCell>
                      <TableCell>
                        {REASON_LABELS[report.reason] || report.reason}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={report.status === "resolved" ? "default" : "secondary"}
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.resolved_at &&
                          new Date(report.resolved_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

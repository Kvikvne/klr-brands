import Link from "next/link";
import { createClient } from "@/lib/server";
import {
    Card,
    CardHeader,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";

export default async function AdminOverviewPage() {
    const supabase = await createClient();

    const [
        { count: creatorCount },
        { count: campaignCount },
        { count: orderCount },
        { data: recentCampaigns },
    ] = await Promise.all([
        supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "creator"),
        supabase
            .from("campaigns")
            .select("*", { count: "exact", head: true })
            .eq("status", "live"),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase
            .from("campaigns")
            .select(
                "id, title, slug, status, deadline, created_at, profiles(full_name)",
            )
            .order("created_at", { ascending: false })
            .limit(5),
    ]);

    return (
        <div className="p-8 max-w-4xl">
            <h1 className="text-xl font-semibold">Overview</h1>
            <p className="mt-1">Your platform at a glance</p>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
                <StatCard
                    label="Creators"
                    value={creatorCount ?? 0}
                    href="/admin/creators"
                />
                <StatCard
                    label="Live campaigns"
                    value={campaignCount ?? 0}
                    href="/admin/campaigns"
                />
                <StatCard
                    label="Total orders"
                    value={orderCount ?? 0}
                    href="/admin/campaigns"
                />
            </div>

            {/* Recent campaigns */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium">Recent campaigns</h2>
                    <Link
                        href="/admin/campaigns"
                        className="text-xs hover:text-muted-foreground"
                    >
                        View all →
                    </Link>
                </div>
                {recentCampaigns && recentCampaigns.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                <th className="pb-2 font-medium">Title</th>
                                <th className="pb-2 font-medium">Creator</th>
                                <th className="pb-2 font-medium">Status</th>
                                <th className="pb-2 font-medium">Deadline</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {recentCampaigns.map((c) => (
                                <tr key={c.id}>
                                    <td className="py-2.5 font-medium">
                                        {c.title}
                                    </td>
                                    <td className="py-2.5">
                                        {(c.profiles as any)?.full_name ?? "—"}
                                    </td>
                                    <td className="py-2.5">
                                        <StatusBadge status={c.status} />
                                    </td>
                                    <td className="py-2.5">
                                        {c.deadline
                                            ? new Date(
                                                  c.deadline,
                                              ).toLocaleDateString()
                                            : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        No campaigns yet.
                    </p>
                )}
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    href,
}: {
    label: string;
    value: number;
    href: string;
}) {
    return (
        <Link href={href}>
            <Card>
                <CardHeader>
                    <CardTitle>
                        <p className="text-2xl font-semibold">{value}</p>
                    </CardTitle>
                    <CardDescription>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {label}
                        </p>
                    </CardDescription>
                </CardHeader>
            </Card>
        </Link>
    );
}

function StatusBadge({ status }: { status: string }) {
    ``;
    const styles: Record<string, string> = {
        draft: "bg-zinc-100 text-zinc-500",
        live: "bg-green-50 text-green-700",
        closed: "bg-yellow-50 text-yellow-700",
        fulfilled: "bg-blue-50 text-blue-700",
    };
    return (
        <span
            className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.draft}`}
        >
            {status}
        </span>
    );
}

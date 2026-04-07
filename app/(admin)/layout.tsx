import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") redirect("/dashboard");

    async function logout() {
        "use server";
        const supabase = await createClient();
        await supabase.auth.signOut();
        redirect("/login");
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <AdminSidebar fullName={profile.full_name} logout={logout} />
            <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
    );
}

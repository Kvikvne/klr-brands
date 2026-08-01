"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Package,
    Megaphone,
    ShoppingBag,
    LogOut,
    BadgeQuestionMark,
} from "lucide-react";

const NAV = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/creators", label: "Creators", icon: Users },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
];

interface Props {
    fullName: string;
    logout: () => Promise<void>;
}

export function AdminSidebar({ fullName, logout }: Props) {
    const pathname = usePathname();

    return (
        <aside className="flex h-screen w-52 flex-col border-r border-sidebar-boarder bg-sidebar">
            {/* Brand */}
            <div className="px-5 py-5 border-b border-sidebar-border bg-sidebar-primary">
                <span className="text-sm font-semibold tracking-tight text-sidebar-primary-foreground">
                    Admin
                </span>
                <p className="truncate text-xs font-medium text-sidebar-primary-foreground">
                    {fullName}
                </p>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-0.5 px-3 py-4">
                {NAV.map(({ href, label, icon: Icon }) => {
                    const active =
                        href === "/admin"
                            ? pathname === "/admin"
                            : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                                active
                                    ? "bg-sidebar font-medium text-sidebar-foreground"
                                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                            }`}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {label}
                        </Link>
                    );
                })}
            </nav>
            <div className=" border-sidebar-border px-4 py-4 ">
                <Link
                    href={"/help.html"}
                    target="blank"
                    className={
                        "flex items-center gap-2 text-xs text-muted-foreground hover:text-sidebar-foreground transition-colors"
                    }
                >
                    <BadgeQuestionMark className="h-4 w-4 shrink-0" />
                    Help
                </Link>
            </div>

            {/* User + Logout */}
            <div className="border-t border-sidebar-border px-4 py-4 ">
                <form action={logout}>
                    <button
                        type="submit"
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-sidebar-foreground transition-colors"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign out
                    </button>
                </form>
            </div>
        </aside>
    );
}

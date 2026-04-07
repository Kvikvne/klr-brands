"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "./actions";

export default function LoginPage() {
    const searchParams = useSearchParams();
    const next = searchParams.get("next") ?? "";

    const [error, action, isPending] = useActionState(login, null);

    return (
        <div className="w-full max-w-sm">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Sign in
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Admin and creator access only
                </p>
            </div>

            <form action={action} className="space-y-4">
                <input type="hidden" name="next" value={next} />

                <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        placeholder="••••••••"
                    />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Signing in…" : "Sign in"}
                </Button>
            </form>
        </div>
    );
}

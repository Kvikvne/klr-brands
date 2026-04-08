"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCampaign } from "./actions";

function toSlug(title: string) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

export default function NewCampaignPage() {
    const [error, action, isPending] = useActionState(createCampaign, null);
    const [slug, setSlug] = useState("");
    const [slugEdited, setSlugEdited] = useState(false);

    function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!slugEdited) setSlug(toSlug(e.target.value));
    }

    function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSlugEdited(true);
        setSlug(toSlug(e.target.value));
    }

    return (
        <div className="p-8 max-w-xl">
            <div className="mb-6">
                <h1 className="text-xl font-semibold">New campaign</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    You can add products and designs after creating the draft.
                </p>
            </div>

            <form action={action} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        name="title"
                        required
                        placeholder="Spring 2025 Tees"
                        onChange={handleTitleChange}
                        disabled={isPending}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="slug">Storefront URL</Label>
                    <div className="flex items-center gap-0">
                        <span className="flex h-8 items-center border border-r-0 border-border bg-muted px-2.5 text-xs text-muted-foreground">
                            /store/
                        </span>
                        <Input
                            id="slug"
                            name="slug"
                            required
                            pattern="[a-z0-9-]+"
                            minLength={3}
                            maxLength={50}
                            value={slug}
                            onChange={handleSlugChange}
                            className="flex-1"
                            placeholder="spring-2025-tees"
                            disabled={isPending}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Lowercase letters, numbers, and hyphens only.
                    </p>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="description">
                        Description{" "}
                        <span className="text-muted-foreground">
                            (optional)
                        </span>
                    </Label>
                    <Textarea
                        id="description"
                        name="description"
                        placeholder="Tell your group what this order is for…"
                        rows={3}
                        disabled={isPending}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="deadline">
                        Order deadline{" "}
                        <span className="text-muted-foreground">
                            (optional)
                        </span>
                    </Label>
                    <Input
                        id="deadline"
                        name="deadline"
                        type="datetime-local"
                        disabled={isPending}
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    If order deadline not set, it will default to 2 weeks from
                    campaign creation date.
                </p>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex items-center justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard">Cancel</Link>
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={isPending || !slug}
                    >
                        {isPending ? "Creating…" : "Create draft"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

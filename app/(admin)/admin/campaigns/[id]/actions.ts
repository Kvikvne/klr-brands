"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";
import { createAdminClient } from "@/lib/admin-client";
import type { CampaignStatus } from "@/types";

export async function updateCampaign(
    campaignId: string,
    _prevState: string | null,
    formData: FormData,
): Promise<string | null> {
    const title = (formData.get("title") as string).trim();
    const slug = (formData.get("slug") as string).trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const deadline = (formData.get("deadline") as string) || null;
    const status = formData.get("status") as CampaignStatus;

    if (!title) return "Title is required.";
    if (!slug) return "Slug is required.";

    const supabase = await createClient();

    // Build campaign update — stamp timestamp fields when status changes
    const campaignUpdate: Record<string, unknown> = {
        title,
        slug,
        description,
        deadline,
        status,
    };
    if (status === "fulfilled")
        campaignUpdate.fulfilled_at = new Date().toISOString();
    if (status === "closed")
        campaignUpdate.closed_at = new Date().toISOString();

    const { error } = await supabase
        .from("campaigns")
        .update(campaignUpdate)
        .eq("id", campaignId);

    if (error) {
        if (error.code === "23505") return "That URL slug is already taken.";
        return error.message;
    }

    // When marking fulfilled, mark all pending orders fulfilled too
    if (status === "fulfilled") {
        const { error: ordersError } = await supabase
            .from("orders")
            .update({ status: "fulfilled" })
            .eq("campaign_id", campaignId)
            .eq("status", "pending");

        if (ordersError) return ordersError.message;
    }

    revalidatePath(`/admin/campaigns/${campaignId}`);
    revalidatePath("/admin/campaigns");
    return null;
}

export async function uploadMockupImage(
    campaignId: string,
    _prevState: string | null,
    formData: FormData,
): Promise<string | null> {
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) return "No file selected.";

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) return "Only JPEG, PNG, WebP, or GIF images are allowed.";

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `campaigns/${campaignId}/mockup.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const adminClient = createAdminClient();
    const { error: uploadError } = await adminClient.storage
        .from("mockups")
        .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) return uploadError.message;

    const supabase = await createClient();
    const { error } = await supabase
        .from("campaigns")
        .update({ image_path: path })
        .eq("id", campaignId);

    if (error) return error.message;

    revalidatePath(`/admin/campaigns/${campaignId}`);
    return null;
}

export async function deleteCampaign(
    campaignId: string,
): Promise<string | null> {
    const supabase = await createClient();

    // Get all order IDs for this campaign so we can cascade manually
    const { data: orders } = await supabase
        .from("orders")
        .select("id")
        .eq("campaign_id", campaignId);

    if (orders && orders.length > 0) {
        const orderIds = orders.map((o) => o.id);

        const { error: itemsError } = await supabase
            .from("order_items")
            .delete()
            .in("order_id", orderIds);

        if (itemsError) return itemsError.message;

        const { error: ordersError } = await supabase
            .from("orders")
            .delete()
            .eq("campaign_id", campaignId);

        if (ordersError) return ordersError.message;
    }

    const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", campaignId);

    if (error) return error.message;

    return null;
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";
import { createAdminClient } from "@/lib/admin-client";
import type { CampaignStatus, OrderStatus } from "@/types";

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

const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

function validateImageFile(file: File | null): string | null {
    if (!file || file.size === 0) return "No file selected."
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Only JPEG, PNG, WebP, or GIF images are allowed."
    if (file.size > MAX_IMAGE_BYTES) return "File must be under 10 MB."
    return null
}

export async function uploadMockupImage(
    campaignId: string,
    _prevState: string | null,
    formData: FormData,
): Promise<string | null> {
    const file = formData.get("file") as File | null;
    const validationError = validateImageFile(file);
    if (validationError || !file) return validationError ?? "No file selected.";

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

export async function addCampaignProduct(
    campaignId: string,
    productId: string,
    colorIds: string[],
    formData: FormData,
): Promise<string | null> {
    if (colorIds.length === 0) return "Select at least one color."

    const supabase = await createClient()

    const { data: cp, error: cpError } = await supabase
        .from("campaign_products")
        .insert({ campaign_id: campaignId, product_id: productId })
        .select("id")
        .single()

    if (cpError) {
        if (cpError.code === "23505") return "That product is already in this campaign."
        return cpError.message
    }

    const { error: colorError } = await supabase
        .from("campaign_product_colors")
        .insert(colorIds.map((color_id) => ({ campaign_product_id: cp.id, color_id })))

    if (colorError) return colorError.message

    // Optional mockup image
    const file = formData.get("file") as File | null
    if (file && file.size > 0) {
        const validationError = validateImageFile(file)
        if (validationError) return validationError

        const ext = file.name.split(".").pop() ?? "jpg"
        const path = `campaigns/${campaignId}/products/${cp.id}/mockup.${ext}`
        const buffer = Buffer.from(await file.arrayBuffer())

        const adminClient = createAdminClient()
        const { error: uploadError } = await adminClient.storage
            .from("mockups")
            .upload(path, buffer, { contentType: file.type, upsert: true })

        if (uploadError) return uploadError.message

        const { error: imgError } = await supabase
            .from("campaign_products")
            .update({ image_path: path })
            .eq("id", cp.id)

        if (imgError) return imgError.message
    }

    revalidatePath(`/admin/campaigns/${campaignId}`)
    return null
}

export async function removeCampaignProduct(
    campaignId: string,
    campaignProductId: string,
): Promise<string | null> {
    const supabase = await createClient()
    const { error } = await supabase
        .from("campaign_products")
        .delete()
        .eq("id", campaignProductId)

    if (error) return error.message

    revalidatePath(`/admin/campaigns/${campaignId}`)
    return null
}

export async function updateCampaignProductColors(
    campaignId: string,
    campaignProductId: string,
    colorIds: string[],
): Promise<string | null> {
    if (colorIds.length === 0) return "Select at least one color."

    const supabase = await createClient()

    const { error: deleteError } = await supabase
        .from("campaign_product_colors")
        .delete()
        .eq("campaign_product_id", campaignProductId)

    if (deleteError) return deleteError.message

    const { error: insertError } = await supabase
        .from("campaign_product_colors")
        .insert(colorIds.map((color_id) => ({ campaign_product_id: campaignProductId, color_id })))

    if (insertError) return insertError.message

    revalidatePath(`/admin/campaigns/${campaignId}`)
    return null
}

export async function uploadCampaignProductImage(
    campaignId: string,
    campaignProductId: string,
    _prevState: string | null,
    formData: FormData,
): Promise<string | null> {
    const file = formData.get("file") as File | null
    const validationError = validateImageFile(file)
    if (validationError || !file) return validationError ?? "No file selected."

    const ext = file.name.split(".").pop() ?? "jpg"
    const path = `campaigns/${campaignId}/products/${campaignProductId}/mockup.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const adminClient = createAdminClient()
    const { error: uploadError } = await adminClient.storage
        .from("mockups")
        .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadError) return uploadError.message

    const supabase = await createClient()
    const { error } = await supabase
        .from("campaign_products")
        .update({ image_path: path })
        .eq("id", campaignProductId)

    if (error) return error.message

    revalidatePath(`/admin/campaigns/${campaignId}`)
    return null
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

// Bulk: advance all orders of a given status to the next status
export async function bulkAdvanceOrders(
    campaignId: string,
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
): Promise<string | null> {
    const supabase = await createClient()
    const { error } = await supabase
        .from("orders")
        .update({ status: toStatus })
        .eq("campaign_id", campaignId)
        .eq("status", fromStatus)

    if (error) return error.message

    revalidatePath(`/admin/campaigns/${campaignId}`)
    revalidatePath("/admin/orders")
    return null
}

// Export campaign orders as a CSV (returned as a plain string)
export async function exportCampaignCsv(campaignId: string): Promise<{ csv: string } | { error: string }> {
    const supabase = await createClient()

    const { data: campaign, error: cErr } = await supabase
        .from("campaigns")
        .select("title, slug")
        .eq("id", campaignId)
        .single()
    if (cErr || !campaign) return { error: cErr?.message ?? "Campaign not found" }

    const { data: orders, error: oErr } = await supabase
        .from("orders")
        .select(`
            id, status, buyer_name, buyer_email, buyer_phone,
            fulfillment_type, delivery_address, notes, created_at,
            order_items (
                quantity, unit_price,
                campaign_product:campaign_products (
                    product:products ( name )
                ),
                color:colors ( name ),
                size:sizes ( name )
            )
        `)
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: true })

    if (oErr) return { error: oErr.message }
    if (!orders || orders.length === 0) return { error: "No orders to export." }

    // ── Materials summary ──────────────────────────────────────────────────────
    // key: "Product | Color | Size"
    const materialsMap = new Map<string, number>()
    for (const order of orders) {
        for (const item of (order.order_items as any[])) {
            const product = item.campaign_product?.product?.name ?? "Unknown"
            const color = item.color?.name ?? "—"
            const size = item.size?.name ?? "—"
            const key = `${product}|${color}|${size}`
            materialsMap.set(key, (materialsMap.get(key) ?? 0) + item.quantity)
        }
    }

    const esc = (v: string | null | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`

    const rows: string[] = []

    rows.push(`Campaign,${esc(campaign.title)}`)
    rows.push(`Slug,${esc(campaign.slug)}`)
    rows.push(`Exported,${esc(new Date().toISOString())}`)
    rows.push(`Total orders,${orders.length}`)
    rows.push("")

    rows.push("MATERIALS NEEDED")
    rows.push("Product,Color,Size,Quantity")
    for (const [key, qty] of materialsMap) {
        const [product, color, size] = key.split("|")
        rows.push([esc(product), esc(color), esc(size), qty].join(","))
    }
    rows.push("")

    rows.push("ORDERS")
    rows.push(
        "Order ID,Status,Date,Buyer Name,Email,Phone,Fulfillment,Address,Notes,Items"
    )
    for (const order of orders) {
        const items = (order.order_items as any[])
            .map((i: any) => {
                const p = i.campaign_product?.product?.name ?? "?"
                const c = i.color?.name ?? ""
                const s = i.size?.name ?? ""
                const label = [p, c, s].filter(Boolean).join(" / ")
                return `${label} x${i.quantity} @$${Number(i.unit_price).toFixed(2)}`
            })
            .join("; ")

        rows.push(
            [
                esc(order.id),
                esc(order.status),
                esc(new Date(order.created_at).toLocaleDateString()),
                esc(order.buyer_name),
                esc(order.buyer_email),
                esc(order.buyer_phone),
                esc(order.fulfillment_type),
                esc(order.delivery_address),
                esc(order.notes),
                esc(items),
            ].join(",")
        )
    }

    return { csv: rows.join("\r\n") }
}

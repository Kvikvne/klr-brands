import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/server";
import { Badge } from "@/components/ui/badge";
import { type CampaignStatus } from "@/types";
import { CampaignDetailsForm } from "./campaign-details-form";
import { DeleteCampaignButton } from "./delete-campaign-button";
import { updateCampaign, uploadMockupImage } from "./actions";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { MockupUpload } from "@/components/admin/mockup-upload";
import type { OrderStatus } from "@/types";

const STATUS_VARIANT: Record<
    CampaignStatus,
    "default" | "secondary" | "outline" | "destructive"
> = {
    draft: "outline",
    live: "default",
    closed: "secondary",
    fulfilled: "secondary",
};

export default async function AdminCampaignDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const [{ data: campaign }, { data: orders }] = await Promise.all([
        supabase
            .from("campaigns")
            .select(
                `
        *,
        creator:profiles ( full_name, email ),
        campaign_products (
          id,
          price_override,
          product:products ( id, name, base_price ),
          campaign_product_colors ( color:colors ( id, name, hex_code ) )
        )
      `,
            )
            .eq("id", id)
            .single(),
        supabase
            .from("orders")
            .select(
                `
        *,
        order_items (
          id, quantity, unit_price,
          campaign_product:campaign_products ( product:products ( name ) ),
          color:colors ( name ),
          size:sizes ( name )
        )
      `,
            )
            .eq("campaign_id", id)
            .order("created_at", { ascending: false }),
    ]);

    if (!campaign) notFound();

    const creator = campaign.creator as any;
    const campaignProducts = campaign.campaign_products as any[];
    const updateAction = updateCampaign.bind(null, id);
    const uploadAction = uploadMockupImage.bind(null, id);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const mockupUrl = campaign.image_path
        ? `${supabaseUrl}/storage/v1/object/public/mockups/${campaign.image_path}`
        : null;

    return (
        <div className="p-8 max-w-4xl space-y-10">
            {/* Header */}
            <div>
                <Link
                    href="/admin/campaigns"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    ← Campaigns
                </Link>
                <div className="mt-1.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold">
                            {campaign.title}
                        </h1>
                        <Badge
                            variant={
                                STATUS_VARIANT[
                                    campaign.status as CampaignStatus
                                ]
                            }
                        >
                            {campaign.status}
                        </Badge>
                    </div>
                    <DeleteCampaignButton
                        campaignId={id}
                        campaignTitle={campaign.title}
                        orderCount={orders?.length ?? 0}
                    />
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                    by {creator?.full_name ?? "—"}
                    {creator?.email ? ` · ${creator.email}` : ""}
                </p>
            </div>

            {/* Edit details */}
            <section>
                <h2 className="text-sm font-medium mb-4">Details</h2>
                <CampaignDetailsForm
                    campaign={campaign as any}
                    updateAction={updateAction}
                />
            </section>

            {/* Mockup image */}
            <section>
                <h2 className="text-sm font-medium mb-3">Mockup image</h2>
                <MockupUpload
                    currentUrl={mockupUrl}
                    uploadAction={uploadAction}
                />
            </section>

            {/* Products */}
            <section>
                <h2 className="text-sm font-medium mb-3">
                    Products ({campaignProducts.length})
                </h2>
                {campaignProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No products added.
                    </p>
                ) : (
                    <div className="border border-border divide-y divide-border">
                        {campaignProducts.map((cp: any) => {
                            const price =
                                cp.price_override ?? cp.product?.base_price;
                            const colors =
                                cp.campaign_product_colors?.map(
                                    (c: any) => c.color,
                                ) ?? [];
                            return (
                                <div
                                    key={cp.id}
                                    className="flex items-center justify-between px-3 py-2.5"
                                >
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium">
                                            {cp.product?.name}
                                        </span>
                                        <div className="flex flex-wrap gap-1">
                                            {colors.map((color: any) => (
                                                <Badge
                                                    key={color.id}
                                                    variant="secondary"
                                                    className="gap-1 text-xs"
                                                >
                                                    {color.hex_code && (
                                                        <span
                                                            className="inline-block h-2 w-2 border border-border"
                                                            style={{
                                                                backgroundColor:
                                                                    color.hex_code,
                                                            }}
                                                        />
                                                    )}
                                                    {color.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-sm text-muted-foreground shrink-0 ml-4">
                                        ${Number(price).toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Orders */}
            <section>
                <h2 className="text-sm font-medium mb-3">
                    Orders ({orders?.length ?? 0})
                </h2>
                {!orders || orders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No orders yet.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => {
                            const items = order.order_items as any[];
                            const total = items.reduce(
                                (sum: number, i: any) =>
                                    sum + i.unit_price * i.quantity,
                                0,
                            );
                            return (
                                <div
                                    key={order.id}
                                    className="border border-border p-4 space-y-3"
                                >
                                    {/* Order header */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium">
                                                {order.buyer_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {order.buyer_email}
                                            </p>
                                            {order.buyer_phone && (
                                                <p className="text-xs text-muted-foreground">
                                                    {order.buyer_phone}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0 space-y-1.5">
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(
                                                    order.created_at,
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    },
                                                )}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {order.fulfillment_type}
                                            </Badge>
                                            <div>
                                                <OrderStatusControl
                                                    orderId={order.id}
                                                    campaignId={id}
                                                    currentStatus={
                                                        order.status as OrderStatus
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {order.delivery_address && (
                                        <p className="text-xs text-muted-foreground">
                                            Deliver to: {order.delivery_address}
                                        </p>
                                    )}

                                    {order.notes && (
                                        <p className="text-xs text-muted-foreground italic">
                                            "{order.notes}"
                                        </p>
                                    )}

                                    {/* Items */}
                                    <div className="border-t border-border pt-2 space-y-1">
                                        {items.map((item: any) => {
                                            const productName =
                                                item.campaign_product?.product
                                                    ?.name ?? "—";
                                            const parts = [
                                                item.color?.name,
                                                item.size?.name,
                                            ]
                                                .filter(Boolean)
                                                .join(" / ");
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between text-xs"
                                                >
                                                    <span>
                                                        {productName}
                                                        {parts && (
                                                            <span className="text-muted-foreground ml-1.5">
                                                                ({parts})
                                                            </span>
                                                        )}
                                                        <span className="text-muted-foreground ml-1.5">
                                                            × {item.quantity}
                                                        </span>
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        $
                                                        {(
                                                            item.unit_price *
                                                            item.quantity
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        <div className="flex justify-between text-xs font-medium pt-1 border-t border-border">
                                            <span>Total</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

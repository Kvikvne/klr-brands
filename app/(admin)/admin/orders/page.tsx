import Link from "next/link";
import { createClient } from "@/lib/server";
import { Badge } from "@/components/ui/badge";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import type { CampaignStatus, OrderStatus } from "@/types";

const CAMPAIGN_STATUS_VARIANT: Record<
    CampaignStatus,
    "default" | "secondary" | "outline" | "destructive"
> = {
    draft: "outline",
    live: "default",
    closed: "secondary",
    fulfilled: "secondary",
};

export default async function OrdersPage() {
    const supabase = await createClient();

    const { data: orders } = await supabase
        .from("orders")
        .select(
            `
      id, buyer_name, buyer_email, buyer_phone,
      fulfillment_type, delivery_address, notes,
      status, created_at,
      campaign:campaigns ( id, title, slug, status ),
      order_items (
        id, quantity, unit_price,
        campaign_product:campaign_products ( product:products ( name ) ),
        color:colors ( name ),
        size:sizes ( name )
      )
    `,
        )
        .order("created_at", { ascending: false });

    // Group orders by campaign
    const campaignMap = new Map<
        string,
        { campaign: any; orders: typeof orders }
    >();

    for (const order of orders ?? []) {
        const campaign = order.campaign as any;
        if (!campaign) continue;
        if (!campaignMap.has(campaign.id)) {
            campaignMap.set(campaign.id, { campaign, orders: [] });
        }
        campaignMap.get(campaign.id)!.orders!.push(order);
    }

    const groups = [...campaignMap.values()];

    const totalOrders = orders?.length ?? 0;

    return (
        <div className="p-8 max-w-4xl space-y-10">
            <div>
                <h1 className="text-xl font-semibold">Orders</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {totalOrders} order{totalOrders !== 1 ? "s" : ""} across{" "}
                    {groups.length} campaign{groups.length !== 1 ? "s" : ""}
                </p>
            </div>

            {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
                groups.map(({ campaign, orders: campaignOrders }) => {
                    const orderCount = campaignOrders?.length ?? 0;
                    const campaignTotal = (campaignOrders ?? []).reduce(
                        (sum, o) => {
                            const items = o.order_items as any[];
                            return (
                                sum +
                                items.reduce(
                                    (s, i) => s + i.unit_price * i.quantity,
                                    0,
                                )
                            );
                        },
                        0,
                    );

                    return (
                        <section key={campaign.id} className="space-y-3">
                            {/* Campaign header */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/admin/campaigns/${campaign.id}`}
                                        className="text-sm font-medium hover:text-muted-foreground transition-colors"
                                    >
                                        {campaign.title}
                                    </Link>
                                    <Badge
                                        variant={
                                            CAMPAIGN_STATUS_VARIANT[
                                                campaign.status as CampaignStatus
                                            ]
                                        }
                                    >
                                        {campaign.status}
                                    </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">
                                    {orderCount} order
                                    {orderCount !== 1 ? "s" : ""} · $
                                    {campaignTotal.toFixed(2)} total
                                </span>
                            </div>

                            {/* Orders */}
                            <div className="space-y-2">
                                {(campaignOrders ?? []).map((order) => {
                                    const items = order.order_items as any[];
                                    const orderTotal = items.reduce(
                                        (sum, i) =>
                                            sum + i.unit_price * i.quantity,
                                        0,
                                    );

                                    return (
                                        <div
                                            key={order.id}
                                            className="border border-border p-4 space-y-3"
                                        >
                                            {/* Order meta */}
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
                                                <div className="flex flex-col items-end gap-1 shrink-0">
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
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {order.fulfillment_type}
                                                        </Badge>
                                                        <OrderStatusControl
                                                            orderId={order.id}
                                                            campaignId={campaign.id}
                                                            currentStatus={order.status as OrderStatus}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {order.delivery_address && (
                                                <p className="text-xs text-muted-foreground">
                                                    Deliver to:{" "}
                                                    {order.delivery_address}
                                                </p>
                                            )}

                                            {order.notes && (
                                                <p className="text-xs text-muted-foreground italic">
                                                    "{order.notes}"
                                                </p>
                                            )}

                                            {/* Line items */}
                                            <div className="border-t border-border pt-2 space-y-1">
                                                {items.map((item: any) => {
                                                    const name =
                                                        item.campaign_product
                                                            ?.product?.name ??
                                                        "—";
                                                    const details = [
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
                                                                {name}
                                                                {details && (
                                                                    <span className="text-muted-foreground ml-1.5">
                                                                        (
                                                                        {
                                                                            details
                                                                        }
                                                                        )
                                                                    </span>
                                                                )}
                                                                <span className="text-muted-foreground ml-1.5">
                                                                    ×{" "}
                                                                    {
                                                                        item.quantity
                                                                    }
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
                                                    <span>
                                                        ${orderTotal.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })
            )}
        </div>
    );
}

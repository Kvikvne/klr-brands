import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/server";
import { Badge } from "@/components/ui/badge";
import { AddProductDialog } from "@/components/creator/add-product-dialog";
import { CampaignProductCard } from "@/components/creator/campaign-product-card";
import { CampaignActions } from "./campaign-actions";
import { DetailsFormClient } from "./details-form-client";
import { updateCampaignDetails } from "./actions";
import { type CampaignStatus } from "@/types";

const STATUS_VARIANT: Record<
    CampaignStatus,
    "default" | "secondary" | "outline" | "destructive"
> = {
    draft: "outline",
    live: "default",
    closed: "secondary",
    fulfilled: "secondary",
};

export default async function CampaignEditorPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: campaign } = await supabase
        .from("campaigns")
        .select(
            `
      *,
      campaign_products (
        id,
        price_override,
        product:products ( id, name, base_price ),
        campaign_product_colors ( color:colors ( id, name, hex_code ) ),
        available_colors:products ( product_colors ( color:colors ( id, name, hex_code ) ) )
      )
    `,
        )
        .eq("id", id)
        .eq("creator_id", user!.id)
        .single();

    if (!campaign) notFound();

    const campaignProductIds: string[] = campaign.campaign_products.map(
        (cp: any) => cp.product.id,
    );

    let productsQuery = supabase
        .from("products")
        .select(
            "id, name, base_price, product_colors ( color:colors ( id, name, hex_code ) )",
        )
        .eq("active", true)
        .order("sort_order");

    if (campaignProductIds.length > 0) {
        productsQuery = productsQuery.not(
            "id",
            "in",
            `(${campaignProductIds.join(",")})`,
        );
    }

    const { data: availableProducts } = await productsQuery;

    const isDraft = campaign.status === "draft";

    // Bind the campaign ID so the client form doesn't need to know it
    const boundUpdateDetails = updateCampaignDetails.bind(null, campaign.id);

    return (
        <div className="p-8 max-w-2xl space-y-10">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                    <Link
                        href="/dashboard"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        ← Campaigns
                    </Link>
                    <h1 className="text-xl font-semibold">{campaign.title}</h1>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={
                                STATUS_VARIANT[
                                    campaign.status as CampaignStatus
                                ]
                            }
                        >
                            {campaign.status}
                        </Badge>
                        {campaign.status === "live" && (
                            <Link
                                href={`/store/${campaign.slug}`}
                                target="_blank"
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                /store/{campaign.slug} ↗
                            </Link>
                        )}
                    </div>
                </div>
                <CampaignActions
                    campaignId={campaign.id}
                    status={campaign.status}
                />
            </div>

            {/* Details */}
            <section>
                <h2 className="text-sm font-medium mb-4">Details</h2>
                <DetailsFormClient
                    campaign={campaign}
                    isDraft={isDraft}
                    updateDetails={boundUpdateDetails}
                />
            </section>

            {/* Products */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium">Products</h2>
                    {isDraft && (
                        <AddProductDialog
                            campaignId={campaign.id}
                            availableProducts={(availableProducts ?? []) as any}
                        />
                    )}
                </div>

                {campaign.campaign_products.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No products yet. Add at least one before publishing.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {campaign.campaign_products.map((cp: any) => (
                            <CampaignProductCard
                                key={cp.id}
                                campaignProductId={cp.id}
                                productName={cp.product.name}
                                basePrice={
                                    cp.price_override ?? cp.product.base_price
                                }
                                selectedColors={cp.campaign_product_colors.map(
                                    (cpc: any) => cpc.color,
                                )}
                                availableColors={
                                    cp.available_colors?.[0]?.product_colors?.map(
                                        (pc: any) => pc.color,
                                    ) ?? []
                                }
                                isDraft={isDraft}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

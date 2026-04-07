// ============================================================
// ENUMS
// ============================================================

export type UserRole = 'admin' | 'creator'
export type CampaignStatus = 'draft' | 'live' | 'closed' | 'fulfilled'
export type FulfillmentType = 'pickup' | 'delivery'
export type OrderStatus = 'pending' | 'fulfilled'


// ============================================================
// DATABASE ROW TYPES
// ============================================================

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  email: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  base_price: number
  active: boolean
  sort_order: number
  created_at: string
}

export interface Color {
  id: string
  name: string
  hex_code: string | null
  sort_order: number
}

export interface Size {
  id: string
  name: string
  sort_order: number
}

export interface Placement {
  id: string
  name: string
  sort_order: number
}

export interface ProductColor {
  product_id: string
  color_id: string
}

export interface ProductSize {
  product_id: string
  size_id: string
}

export interface ProductPlacement {
  product_id: string
  placement_id: string
}

export interface MockupImage {
  id: string
  product_id: string
  color_id: string | null
  storage_path: string
  alt_text: string | null
  sort_order: number
  created_at: string
}

export interface Campaign {
  id: string
  creator_id: string
  title: string
  slug: string
  description: string | null
  status: CampaignStatus
  deadline: string | null
  published_at: string | null
  closed_at: string | null
  fulfilled_at: string | null
  created_at: string
  updated_at: string
}

export interface CampaignProduct {
  id: string
  campaign_id: string
  product_id: string
  price_override: number | null
}

export interface CampaignProductColor {
  campaign_product_id: string
  color_id: string
}

export interface CampaignDesign {
  id: string
  campaign_product_id: string
  placement_id: string
  storage_path: string
  file_name: string
  uploaded_at: string
}

export interface Order {
  id: string
  campaign_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string | null
  notes: string | null
  fulfillment_type: FulfillmentType
  delivery_address: string | null
  status: OrderStatus
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  campaign_product_id: string
  color_id: string | null
  size_id: string | null
  quantity: number
  unit_price: number
}


// ============================================================
// JOINED / ENRICHED TYPES
// Used for queries that join related tables.
// ============================================================

export interface ProductWithRelations extends Product {
  colors: Color[]
  sizes: Size[]
  placements: Placement[]
  mockup_images: MockupImage[]
}

export interface CampaignProductWithRelations extends CampaignProduct {
  product: Product
  colors: Color[]
  designs: (CampaignDesign & { placement: Placement })[]
}

export interface CampaignWithRelations extends Campaign {
  creator: Pick<Profile, 'id' | 'full_name' | 'email'>
  campaign_products: CampaignProductWithRelations[]
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & {
    campaign_product: CampaignProduct & { product: Product }
    color: Color | null
    size: Size | null
  })[]
}


// ============================================================
// FORM / INPUT TYPES
// ============================================================

export interface CreateCampaignInput {
  title: string
  slug: string
  description?: string
  deadline?: string
}

export interface UpdateCampaignInput extends Partial<CreateCampaignInput> {
  status?: CampaignStatus
}

export interface OrderFormInput {
  buyer_name: string
  buyer_email: string
  buyer_phone?: string
  notes?: string
  fulfillment_type: FulfillmentType
  delivery_address?: string
  items: CartItem[]
}

// ============================================================
// CART
// Stored in localStorage on the buyer's device.
// ============================================================

export interface CartItem {
  campaign_product_id: string
  product_id: string
  product_name: string
  color_id: string | null
  color_name: string | null
  size_id: string | null
  size_name: string | null
  quantity: number
  unit_price: number
}

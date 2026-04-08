import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendOrderConfirmation({
  to,
  buyerName,
  campaignTitle,
  orderId,
  items,
  total,
  fulfillmentType,
  deliveryAddress,
}: {
  to: string
  buyerName: string
  campaignTitle: string
  orderId: string
  items: Array<{
    product_name: string
    color_name: string | null
    size_name: string | null
    quantity: number
    unit_price: number
  }>
  total: number
  fulfillmentType: 'pickup' | 'delivery'
  deliveryAddress: string | null
}) {
  const itemRows = items
    .map((item) => {
      const details = [item.color_name, item.size_name].filter(Boolean).join(' / ')
      return `  • ${item.product_name}${details ? ` (${details})` : ''} × ${item.quantity} — $${(item.unit_price * item.quantity).toFixed(2)}`
    })
    .join('\n')

  const fulfillmentLine =
    fulfillmentType === 'delivery'
      ? `Delivery to: ${deliveryAddress}`
      : 'Fulfillment: Pickup'

  const text = `Hi ${buyerName},

Your order for ${campaignTitle} has been received!

ORDER SUMMARY
─────────────
${itemRows}

Total: $${total.toFixed(2)}

${fulfillmentLine}

Order reference: ${orderId}

We'll be in touch with next steps.
`

  await transporter.sendMail({
    from: `"Group Orders" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Order confirmed — ${campaignTitle}`,
    text,
  })
}

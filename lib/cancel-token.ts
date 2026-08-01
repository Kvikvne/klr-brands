import { createHmac, timingSafeEqual } from 'crypto'

function secret() {
  const s = process.env.ORDER_CANCEL_SECRET
  if (!s) throw new Error('ORDER_CANCEL_SECRET env var is not set')
  return s
}

export function generateCancelToken(orderId: string): string {
  return createHmac('sha256', secret()).update(orderId).digest('hex')
}

export function verifyCancelToken(orderId: string, token: string): boolean {
  try {
    const expected = generateCancelToken(orderId)
    const a = Buffer.from(expected, 'hex')
    const b = Buffer.from(token, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

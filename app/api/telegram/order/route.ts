import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type TelegramItem = {
  product_name?: unknown
  quantity?: unknown
  unit_price?: unknown
  product_image?: unknown
}

type TelegramOrder = {
  id?: unknown
  full_name?: unknown
  phone?: unknown
  wilaya?: unknown
  address?: unknown
  shipping_method?: unknown
  subtotal?: unknown
  discount?: unknown
  shipping_cost?: unknown
  total?: unknown
  order_items?: unknown
}

const text = (value: unknown, fallback = 'N/A') => String(value ?? fallback).trim() || fallback
const money = (value: unknown) => `${Number(value ?? 0).toLocaleString('fr-DZ')} DZD`
function buildMessage(order: TelegramOrder) {
  const items = Array.isArray(order.order_items) ? order.order_items as TelegramItem[] : []
  const lines = items.length
    ? items.map((item) => `• ${text(item.product_name)} × ${text(item.quantity, '0')} — ${money((Number(item.unit_price) || 0) * (Number(item.quantity) || 0))}`)
    : ['• Aucun article']

  return [
    'Nouvelle commande — EVOLVE LUXE',
    `Commande: #${text(order.id)}`,
    `Client: ${text(order.full_name)}`,
    `Téléphone: ${text(order.phone)}`,
    `Wilaya: ${text(order.wilaya)}`,
    `Adresse: ${text(order.address)}`,
    `Livraison: ${text(order.shipping_method || 'home')}`,
    '',
    'Articles:',
    ...lines,
    '',
    `Sous-total: ${money(order.subtotal)}`,
    `Remise: ${money(order.discount)}`,
    `Livraison: ${money(order.shipping_cost)}`,
    `Total: ${money(order.total)}`,
  ].join('\n')
}

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_TOKEN?.trim()
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim()
  if (!token || !chatId) {
    console.error('[v0] Telegram configuration is missing', {
      hasToken: Boolean(token),
      hasChatId: Boolean(chatId),
    })
    return NextResponse.json({ error: 'Telegram is not configured' }, { status: 503 })
  }

  try {
    const body = await request.json() as { order?: TelegramOrder }
    if (!body.order || !text(body.order.id, '')) return NextResponse.json({ error: 'Order payload is required' }, { status: 400 })

    console.log('[v0] Sending Telegram order notification', {
      orderId: body.order.id,
      itemCount: Array.isArray(body.order.order_items) ? body.order.order_items.length : 0,
      hasToken: Boolean(token),
      hasChatId: Boolean(chatId),
    })
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: buildMessage(body.order) }),
      cache: 'no-store',
    })
    if (!response.ok) {
      const telegramError = await response.text()
      console.warn('[v0] Telegram API rejected notification', {
        status: response.status,
        response: telegramError.slice(0, 500),
      })
      return NextResponse.json({ error: 'Telegram notification failed' }, { status: 502 })
    }
    const firstImage = (Array.isArray(body.order.order_items) ? body.order.order_items as TelegramItem[] : [])
      .map((item) => text(item.product_image, ''))
      .find(Boolean)
    if (firstImage) {
      const photoResponse = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, photo: firstImage, caption: `Order ${text(body.order.id)}` }),
        cache: 'no-store',
      })
      if (!photoResponse.ok) console.error('[v0] Telegram product image rejected', { status: photoResponse.status, response: (await photoResponse.text()).slice(0, 500) })
    }
    console.log('[v0] Telegram order notification sent', { orderId: body.order.id })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[v0] Telegram notification request failed', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Invalid notification request' }, { status: 400 })
  }
}

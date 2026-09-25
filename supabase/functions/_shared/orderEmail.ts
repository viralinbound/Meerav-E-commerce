// Shared by send-order-email (COD) and payu-callback (online payment) so
// both paths render and send the exact same receipt email, through one
// place, instead of keeping two copies of the HTML in sync by hand.

interface OrderItem {
  name: string;
  weight?: string;
  price: number;
  quantity?: number;
  qty?: number;
}

interface OrderRow {
  id: string;
  order_seq: number | null;
  customer: { name?: string; email?: string; phone?: string; address?: string; city?: string; pincode?: string } | null;
  items: OrderItem[];
  total_amount: number;
  payment_method: string;
}

function escapeHtml(s: string): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));
}

export function renderOrderEmailHtml(order: OrderRow): string {
  const orderNumber = order.order_seq ? `MEERAV-${order.order_seq}` : order.id.toUpperCase();
  const items = order.items || [];
  const rows = items
    .map((it) => {
      const qty = it.quantity ?? it.qty ?? 1;
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0e6d8;">${escapeHtml(it.name)}${it.weight ? ` (${escapeHtml(it.weight)})` : ''}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0e6d8;text-align:center;">x${qty}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0e6d8;text-align:right;">Rs ${it.price * qty}</td>
      </tr>`;
    })
    .join('');

  const addressParts = [order.customer?.address, order.customer?.city, order.customer?.pincode].filter(Boolean);
  const paymentLabel = order.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid Online';

  return `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#fdf9f0;padding:32px 24px;color:#3a2a1a;">
    <h1 style="color:#6e1423;font-size:22px;margin:0 0 4px;">Thank you for your order!</h1>
    <p style="color:#7a6a55;margin:0 0 24px;">Your order has been confirmed and is being prepared fresh in our kitchen.</p>

    <div style="background:#ffffff;border:1px solid #f0e6d8;border-radius:12px;padding:20px;margin-bottom:20px;">
      <p style="margin:0 0 12px;font-size:14px;color:#7a6a55;">Order Number</p>
      <p style="margin:0 0 20px;font-size:20px;font-weight:bold;color:#6e1423;">${escapeHtml(orderNumber)}</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr>
            <th style="text-align:left;padding-bottom:8px;border-bottom:2px solid #6e1423;">Item</th>
            <th style="text-align:center;padding-bottom:8px;border-bottom:2px solid #6e1423;">Qty</th>
            <th style="text-align:right;padding-bottom:8px;border-bottom:2px solid #6e1423;">Price</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div style="display:flex;justify-content:space-between;margin-top:16px;font-size:16px;font-weight:bold;">
        <span>Total</span>
        <span>Rs ${order.total_amount}</span>
      </div>
      <p style="margin:4px 0 0;font-size:12px;color:#a08d70;text-align:right;">Price inclusive of GST</p>
      <p style="margin:8px 0 0;font-size:13px;color:#7a6a55;">Payment: ${paymentLabel}</p>
    </div>

    ${addressParts.length ? `<div style="margin-bottom:20px;">
      <p style="margin:0 0 4px;font-size:14px;color:#7a6a55;">Delivering to</p>
      <p style="margin:0;font-size:14px;">${escapeHtml(order.customer?.name || '')}<br/>${escapeHtml(addressParts.join(', '))}</p>
    </div>` : ''}

    <p style="font-size:13px;color:#7a6a55;margin-top:24px;">
      Questions about your order? Just reply to this email or reach us through the Meerav website.
    </p>
    <p style="font-size:13px;color:#a08d70;margin-top:24px;">— The Meerav Team, Bikaner</p>
  </div>`;
}

export async function sendOrderConfirmationEmail(order: OrderRow): Promise<{ ok: boolean; error?: string }> {
  const toEmail = order.customer?.email;
  if (!toEmail) return { ok: false, error: 'No customer email on this order' };

  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY not configured' };

  const orderNumber = order.order_seq ? `MEERAV-${order.order_seq}` : order.id.toUpperCase();
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'Meerav Namkeens <onboarding@resend.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject: `Order Confirmed — ${orderNumber} | Meerav Namkeens`,
      html: renderOrderEmailHtml(order),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('Resend send failed', res.status, body);
    return { ok: false, error: `Resend error ${res.status}: ${body}` };
  }
  return { ok: true };
}

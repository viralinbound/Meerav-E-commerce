// Receives PayU's server-to-server + browser redirect POST after payment.
// This is the ONLY place an order is ever marked paid -- never trust a
// client-side redirect alone, since anyone could forge that request.
// Deploy: supabase functions deploy payu-callback --no-verify-jwt
// (--no-verify-jwt because PayU posts here directly, not through your app's
// authenticated Supabase client)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

async function sha512Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const form = await req.formData();
    const fields: Record<string, string> = {};
    for (const [k, v] of form.entries()) fields[k] = String(v);

    const { key, txnid, amount, productinfo, firstname, email, status, hash: receivedHash } = fields;
    const salt = Deno.env.get('PAYU_MERCHANT_SALT')!;

    // PayU's reverse hash formula -- verifies the response actually came
    // from PayU and wasn't tampered with in transit or forged by a client.
    const reverseHashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const expectedHash = await sha512Hex(reverseHashString);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const siteUrl = Deno.env.get('SITE_URL') || 'https://meerav-e-commerce.vercel.app';

    if (expectedHash !== receivedHash) {
      await supabase.from('orders').update({ gateway_response: { ...fields, verified: false } }).eq('payu_txn_id', txnid);
      return Response.redirect(`${siteUrl}/?payment=failed&reason=hash_mismatch`, 302);
    }

    const { data: order } = await supabase.from('orders').select('id, payment_status, items').eq('payu_txn_id', txnid).maybeSingle();
    if (!order) return Response.redirect(`${siteUrl}/?payment=failed&reason=order_not_found`, 302);

    const isPaid = status === 'success';
    const alreadyPaid = order.payment_status === 'paid';

    await supabase.from('orders').update({
      payment_status: isPaid ? 'paid' : 'failed',
      // A confirmed payment moves the order straight into kitchen/dispatch
      // processing; a failed payment is rejected outright, never left
      // looking like an order still in progress.
      order_status: isPaid ? 'Processing' : 'Cancelled',
      gateway_response: { ...fields, verified: true },
    }).eq('id', order.id);

    // Only bump the real sales counter (and reduce stock) once, the first
    // time this order actually clears payment -- a retried/duplicate
    // callback must not double-count units sold or over-deduct stock.
    if (isPaid && !alreadyPaid) {
      for (const item of order.items || []) {
        if (item?.productId && item?.quantity) {
          await supabase.rpc('increment_units_sold', { p_product_id: item.productId, p_qty: item.quantity });
          if (item.weight) {
            await supabase.rpc('decrement_variant_stock', { p_product_id: item.productId, p_weight: item.weight, p_qty: item.quantity });
          }
        }
      }
    }

    return Response.redirect(`${siteUrl}/?payment=${isPaid ? 'success' : 'failed'}&order=${order.id}`, 302);
  } catch (e) {
    const siteUrl = Deno.env.get('SITE_URL') || 'https://meerav-e-commerce.vercel.app';
    console.error('payu-callback error', e);
    return Response.redirect(`${siteUrl}/?payment=failed&reason=server_error`, 302);
  }
});

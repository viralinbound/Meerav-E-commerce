// Creates a PayU hosted-checkout payload for an existing pending order.
// Deploy: supabase functions deploy payu-initiate
// Secrets needed (set these yourself, never paste real values in chat):
//   supabase secrets set PAYU_MERCHANT_KEY=... PAYU_MERCHANT_SALT=... PAYU_MODE=test
// PAYU_MODE is "test" (sandbox) or "live" — always test first.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sha512Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

  try {
    const { orderId } = await req.json();
    if (!orderId) return json({ error: 'orderId is required' }, 400);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: order, error } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
    if (error || !order) return json({ error: 'Order not found' }, 404);
    if (order.payment_status === 'paid') return json({ error: 'This order is already paid' }, 400);

    const key = Deno.env.get('PAYU_MERCHANT_KEY')!;
    const salt = Deno.env.get('PAYU_MERCHANT_SALT')!;
    const mode = Deno.env.get('PAYU_MODE') || 'test';
    const payuUrl = mode === 'live' ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment';

    // txnid must be unique per attempt (PayU rejects a reused one), so this
    // is distinct from our own order id even though 1 order -> usually 1 txn.
    const txnid = `${orderId}-${Date.now().toString(36)}`.slice(0, 40).replace(/[^a-zA-Z0-9]/g, '');
    const amount = Number(order.total_amount).toFixed(2);
    const productinfo = `Meerav order ${orderId}`;
    const firstname = (order.customer?.name || 'Customer').slice(0, 60);
    const email = order.customer?.email || 'customer@meerav.com';
    const phone = order.customer?.phone || '';

    const siteUrl = Deno.env.get('SITE_URL') || 'https://meerav-e-commerce.vercel.app';
    const surl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/payu-callback`;
    const furl = surl;

    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    const hash = await sha512Hex(hashString);

    await supabase.from('orders').update({ payu_txn_id: txnid }).eq('id', orderId);

    return json({
      action: payuUrl,
      params: { key, txnid, amount, productinfo, firstname, email, phone, surl, furl, hash,
        service_provider: 'payu_paisa' },
      siteUrl,
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

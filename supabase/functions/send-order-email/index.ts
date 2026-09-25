// Sends the order-confirmation email for a COD order right after it's
// placed (online orders get theirs from payu-callback once payment is
// verified, so this function is never the one trusted for payment status).
// Deploy: supabase functions deploy send-order-email --no-verify-jwt
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendOrderConfirmationEmail } from '../_shared/orderEmail.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
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

    const { data: order, error } = await supabase
      .from('orders')
      .select('id, order_seq, customer, items, total_amount, payment_method')
      .eq('id', orderId)
      .maybeSingle();

    if (error || !order) {
      return json({ error: 'Order not found' }, 404);
    }

    const result = await sendOrderConfirmationEmail(order);
    return json(result, result.ok ? 200 : 500);
  } catch (e) {
    console.error('send-order-email error', e);
    return json({ error: 'Server error' }, 500);
  }
});

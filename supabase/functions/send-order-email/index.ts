// Sends the order-confirmation email for a COD order right after it's
// placed (online orders get theirs from payu-callback once payment is
// verified, so this function is never the one trusted for payment status).
// Deploy: supabase functions deploy send-order-email --no-verify-jwt
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendOrderConfirmationEmail } from '../_shared/orderEmail.ts';

Deno.serve(async (req) => {
  try {
    const { orderId } = await req.json();
    if (!orderId) return new Response(JSON.stringify({ error: 'orderId is required' }), { status: 400 });

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
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    const result = await sendOrderConfirmationEmail(order);
    return new Response(JSON.stringify(result), { status: result.ok ? 200 : 500 });
  } catch (e) {
    console.error('send-order-email error', e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
});

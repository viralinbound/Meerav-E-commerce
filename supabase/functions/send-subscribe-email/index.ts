// Saves a newsletter signup and sends the "Thank you for subscribing"
// email. Deploy: supabase functions deploy send-subscribe-email --no-verify-jwt
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

Deno.serve(async (req) => {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: 'A valid email is required' }), { status: 400 });
    }
    const normalized = email.trim().toLowerCase();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Re-subscribing after a previous unsubscribe should turn the flag back
    // off, not create a duplicate row -- email has a unique constraint.
    const { error: upsertError } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email: normalized, unsubscribed: false, unsubscribed_at: null }, { onConflict: 'email' });

    if (upsertError) {
      console.error('newsletter upsert failed', upsertError);
      return new Response(JSON.stringify({ error: 'Could not save subscription' }), { status: 500 });
    }

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (apiKey) {
      const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'Meerav Namkeens <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromEmail,
          to: [normalized],
          subject: 'Thank you for subscribing to Meerav!',
          html: `
            <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;background:#fdf9f0;padding:32px 24px;color:#3a2a1a;">
              <h1 style="color:#6e1423;font-size:22px;margin:0 0 12px;">Thank you for subscribing!</h1>
              <p style="color:#5a4a35;font-size:14px;line-height:1.6;">
                You're on the list — from now on, you'll be the first to know about fresh-batch
                alerts, new launches, seasonal specials, and price drops from Meerav.
              </p>
              <p style="color:#a08d70;font-size:13px;margin-top:24px;">— The Meerav Team, Bikaner</p>
            </div>`,
        }),
      });
      if (!res.ok) console.error('Resend subscribe-email failed', res.status, await res.text());
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    console.error('send-subscribe-email error', e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
});

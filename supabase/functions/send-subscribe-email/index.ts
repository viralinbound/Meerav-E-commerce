// Saves a newsletter signup and sends the "Thank you for subscribing"
// email. Deploy: supabase functions deploy send-subscribe-email --no-verify-jwt
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const SITE_URL = 'https://meeravsnacks.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return json({ error: 'A valid email is required' }, 400);
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
      return json({ error: 'Could not save subscription' }, 500);
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
                Stay tuned for new offers and deals — you'll be the first to hear about them.
              </p>
              <a href="${SITE_URL}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#6e1423;color:#fdf9f0;text-decoration:none;border-radius:6px;font-size:14px;">
                Visit Meerav
              </a>
              <p style="color:#a08d70;font-size:13px;margin-top:24px;">— The Meerav Team, Bikaner</p>
            </div>`,
        }),
      });
      if (!res.ok) console.error('Resend subscribe-email failed', res.status, await res.text());
    }

    return json({ ok: true });
  } catch (e) {
    console.error('send-subscribe-email error', e);
    return json({ error: 'Server error' }, 500);
  }
});

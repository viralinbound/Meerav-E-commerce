// Sends an offer/announcement email to every active newsletter
// subscriber. Admin-only -- deploy WITHOUT --no-verify-jwt so Supabase
// rejects any request that isn't from a real authenticated user, then this
// function additionally checks that user is actually an admin/host before
// touching the subscriber list.
// Deploy: supabase functions deploy send-broadcast-email
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

const SITE_URL = 'https://meeravsnacks.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !userData?.user) {
      return json({ error: 'Not authenticated' }, 401);
    }

    const { data: isAdmin } = await supabase.rpc('is_admin', { uid: userData.user.id });
    if (!isAdmin) {
      return json({ error: 'Admin access required' }, 403);
    }

    const { subject, message } = await req.json();
    if (!subject || !message) {
      return json({ error: 'subject and message are required' }, 400);
    }

    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('unsubscribed', false);

    if (subError) {
      console.error('fetch subscribers failed', subError);
      return json({ error: 'Could not load subscribers' }, 500);
    }

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ error: 'RESEND_API_KEY not configured' }, 500);
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'Meerav Namkeens <onboarding@resend.dev>';

    const html = `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;background:#fdf9f0;padding:32px 24px;color:#3a2a1a;">
        <h1 style="color:#6e1423;font-size:22px;margin:0 0 12px;">${subject}</h1>
        <div style="color:#5a4a35;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message}</div>
        <a href="${SITE_URL}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#6e1423;color:#fdf9f0;text-decoration:none;border-radius:6px;font-size:14px;">
          Visit Meerav
        </a>
        <p style="color:#a08d70;font-size:13px;margin-top:24px;">— The Meerav Team, Bikaner</p>
      </div>`;

    let sent = 0;
    const failed: string[] = [];

    // Resend's free tier has a per-request/per-second rate limit -- send
    // one at a time with a small delay rather than firing the whole list
    // at once, which would get most of the batch rejected.
    for (const { email } of subscribers || []) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: fromEmail, to: [email], subject, html }),
      });
      if (res.ok) sent++;
      else failed.push(email);
      await new Promise((r) => setTimeout(r, 550));
    }

    return json({ ok: true, sent, total: (subscribers || []).length, failed });
  } catch (e) {
    console.error('send-broadcast-email error', e);
    return json({ error: 'Server error' }, 500);
  }
});

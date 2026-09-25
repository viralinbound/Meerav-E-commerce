// Sends an offer/announcement email to every active newsletter
// subscriber. Admin-only -- deploy WITHOUT --no-verify-jwt so Supabase
// rejects any request that isn't from a real authenticated user, then this
// function additionally checks that user is actually an admin/host before
// touching the subscriber list.
// Deploy: supabase functions deploy send-broadcast-email
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    const { data: isAdmin } = await supabase.rpc('is_admin', { uid: userData.user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403 });
    }

    const { subject, message } = await req.json();
    if (!subject || !message) {
      return new Response(JSON.stringify({ error: 'subject and message are required' }), { status: 400 });
    }

    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('unsubscribed', false);

    if (subError) {
      console.error('fetch subscribers failed', subError);
      return new Response(JSON.stringify({ error: 'Could not load subscribers' }), { status: 500 });
    }

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 500 });
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'Meerav Namkeens <onboarding@resend.dev>';

    const html = `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;background:#fdf9f0;padding:32px 24px;color:#3a2a1a;">
        <h1 style="color:#6e1423;font-size:22px;margin:0 0 12px;">${subject}</h1>
        <div style="color:#5a4a35;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message}</div>
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

    return new Response(JSON.stringify({ ok: true, sent, total: (subscribers || []).length, failed }), { status: 200 });
  } catch (e) {
    console.error('send-broadcast-email error', e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
});

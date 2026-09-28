// Sends account-lifecycle emails (new account created, password changed)
// via Resend. Deploy: supabase functions deploy send-account-email --no-verify-jwt
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

function wrap(title: string, bodyHtml: string): string {
  return `
    <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;background:#fdf9f0;padding:32px 24px;color:#3a2a1a;">
      <h1 style="color:#6e1423;font-size:22px;margin:0 0 12px;">${title}</h1>
      ${bodyHtml}
      <a href="${SITE_URL}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#6e1423;color:#fdf9f0;text-decoration:none;border-radius:6px;font-size:14px;">
        Visit Meerav
      </a>
      <p style="color:#a08d70;font-size:13px;margin-top:24px;">— The Meerav Team, Bikaner</p>
    </div>`;
}

const TEMPLATES: Record<string, (name: string) => { subject: string; html: string }> = {
  welcome: (name) => ({
    subject: 'Welcome to Meerav!',
    html: wrap('Thank you for creating an account!', `
      <p style="color:#5a4a35;font-size:14px;line-height:1.6;">
        Hi ${name || 'there'}, your Meerav account is ready. Track orders, save your
        address for faster checkout, and be the first to hear about fresh-batch
        alerts and seasonal specials.
      </p>`),
  }),
  'password-changed': (name) => ({
    subject: 'Your Meerav password was changed',
    html: wrap('Your password was changed', `
      <p style="color:#5a4a35;font-size:14px;line-height:1.6;">
        Hi ${name || 'there'}, this confirms your Meerav account password was just
        changed. If you made this change, no action is needed.
      </p>
      <p style="color:#5a4a35;font-size:14px;line-height:1.6;">
        If you didn't do this, please contact us right away so we can help secure
        your account.
      </p>`),
  }),
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

  try {
    const { type, email, name } = await req.json();
    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return json({ error: 'A valid email is required' }, 400);
    }
    const template = TEMPLATES[type];
    if (!template) {
      return json({ error: 'Unknown email type' }, 400);
    }

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ error: 'RESEND_API_KEY not configured' }, 500);
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'Meerav Namkeens <onboarding@resend.dev>';

    const { subject, html } = template(name || '');
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromEmail, to: [email.trim().toLowerCase()], subject, html }),
    });

    if (!res.ok) {
      console.error('Resend account-email failed', res.status, await res.text());
      return json({ error: 'Could not send email' }, 500);
    }

    return json({ ok: true });
  } catch (e) {
    console.error('send-account-email error', e);
    return json({ error: 'Server error' }, 500);
  }
});

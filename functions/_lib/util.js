// Shared helpers for all Pages Functions

export const RESERVED = new Set([
  'www', 'app', 'api', 'admin', 'login', 'dashboard', 'mail', 'support', 'static', 's', 'sitemap', 'robots',
]);

export const validName = (n) => /^[a-z0-9][a-z0-9-]{2,30}$/.test(n || '') && !RESERVED.has(n);

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

export function sb(env, path, init = {}) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

// Verify the logged-in user from the Supabase access token sent by the browser
export async function getUser(request, env) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const r = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return null;
  return r.json();
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Serve a published site. Sandboxed CSP => user-generated JS cannot touch the builder's login/session.
export async function serveSite(env, name, origin, sandbox = false) {
  if (!validName(name)) return new Response('Not found', { status: 404 });
  const r = await sb(env, `sites?name=eq.${name}&select=html,title`);
  const rows = r.ok ? await r.json() : [];
  if (!rows.length) {
    return new Response('<h1 style="font-family:sans-serif">Ye site abhi bani nahi hai</h1>', {
      status: 404,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }
  const { html, title } = rows[0];
  const head = `
<meta name="theme-color" content="#4f46e5">
<link rel="manifest" href="${origin}/api/manifest/${name}">
<link rel="icon" href="${origin}/api/icon/${name}">
<link rel="apple-touch-icon" href="${origin}/api/icon/${name}">`;
  const out = /<\/head>/i.test(html)
    ? html.replace(/<\/head>/i, head + '</head>')
    : `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>${head}</head><body>${html}</body></html>`;
  return new Response(out, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // Subdomain = alag origin (safe, localStorage chalta hai). Path-based /s/ same origin hai, isliye sandbox.
      ...(sandbox ? { 'content-security-policy': 'sandbox allow-scripts allow-forms allow-popups allow-modals' } : {}),
      'x-content-type-options': 'nosniff',
    },
  });
}

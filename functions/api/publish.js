import { json, getUser, sb, validName } from '../_lib/util.js';

export async function onRequestPost({ request, env }) {
  const user = await getUser(request, env);
  if (!user) return json({ error: 'Pehle login karo' }, 401);

  const { name, html, title, prompt } = await request.json().catch(() => ({}));
  const n = (name || '').toLowerCase().trim();
  if (!validName(n)) return json({ error: 'Naam 3-31 akshar: a-z, 0-9 aur - hi chalega (reserved naam nahi)' }, 400);
  if (!html || html.length > 900000) return json({ error: 'HTML khali ya bahut bada hai' }, 400);

  const ex = await (await sb(env, `sites?name=eq.${n}&select=owner`)).json();
  if (ex.length && ex[0].owner !== user.id) return json({ error: 'Ye naam pehle se kisi aur ne le liya hai' }, 409);

  const row = { name: n, owner: user.id, title: (title || n).slice(0, 120), prompt: (prompt || '').slice(0, 4000), html, updated_at: new Date().toISOString() };
  const r = ex.length
    ? await sb(env, `sites?name=eq.${n}`, { method: 'PATCH', body: JSON.stringify(row) })
    : await sb(env, 'sites', { method: 'POST', body: JSON.stringify(row) });
  if (!r.ok) return json({ error: 'Save nahi hua: ' + (await r.text()) }, 500);

  const origin = new URL(request.url).origin;
  const root = env.ROOT_DOMAIN;
  return json({
    ok: true,
    url: root ? `https://${n}.${root}` : `${origin}/s/${n}`,
    fallbackUrl: `${origin}/s/${n}`,
  });
}

// List my sites
export async function onRequestGet({ request, env }) {
  const user = await getUser(request, env);
  if (!user) return json({ error: 'Pehle login karo' }, 401);
  const r = await sb(env, `sites?owner=eq.${user.id}&select=name,title,updated_at&order=updated_at.desc`);
  return json({ sites: await r.json() });
}

import { sb } from './_lib/util.js';

// Google ko saari published sites dikhane ke liye (Search Console me submit karo)
export async function onRequestGet({ env, request }) {
  const origin = new URL(request.url).origin;
  const root = env.ROOT_DOMAIN;
  const r = await sb(env, 'sites?select=name,updated_at&order=updated_at.desc&limit=5000');
  const rows = r.ok ? await r.json() : [];
  const urls = rows
    .map((s) => `<url><loc>${root ? `https://${s.name}.${root}` : `${origin}/s/${s.name}`}</loc><lastmod>${s.updated_at.slice(0, 10)}</lastmod></url>`)
    .join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'content-type': 'application/xml' },
  });
}

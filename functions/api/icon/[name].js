import { validName } from '../../_lib/util.js';

export async function onRequestGet({ params }) {
  const n = params.name;
  if (!validName(n)) return new Response('', { status: 404 });
  const letter = n[0].toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#4f46e5"/><text x="256" y="340" font-size="280" font-family="Arial,sans-serif" font-weight="700" fill="#fff" text-anchor="middle">${letter}</text></svg>`;
  return new Response(svg, { headers: { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400' } });
}

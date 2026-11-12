import { validName } from '../../_lib/util.js';

// PWA manifest => "Add to Home screen" = app jaisa install, aur PWABuilder/APK ke liye bhi kaam aata hai
export async function onRequestGet({ params, request }) {
  const n = params.name;
  if (!validName(n)) return new Response('{}', { status: 404 });
  const base = new URL(request.url).origin;
  const manifest = {
    name: n,
    short_name: n.slice(0, 12),
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [{ src: `${base}/api/icon/${n}`, sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
  };
  return new Response(JSON.stringify(manifest), { headers: { 'content-type': 'application/manifest+json' } });
}

import { serveSite, validName } from './_lib/util.js';

// name.YOURDOMAIN.com  ->  published site "name"
export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  const root = ctx.env.ROOT_DOMAIN;
  if (root && url.hostname.endsWith('.' + root)) {
    const sub = url.hostname.slice(0, -(root.length + 1));
    if (validName(sub)) return serveSite(ctx.env, sub, url.origin);
  }
  return ctx.next();
}

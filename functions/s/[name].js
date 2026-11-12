import { serveSite } from '../_lib/util.js';

// Path-based fallback: https://YOURAPP.pages.dev/s/mysite
export async function onRequestGet({ env, params, request }) {
  return serveSite(env, params.name, new URL(request.url).origin, true);
}

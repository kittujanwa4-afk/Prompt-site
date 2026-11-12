import { json } from '../_lib/util.js';

export async function onRequestGet({ env }) {
  return json({
    supabaseUrl: env.SUPABASE_URL,
    supabaseAnonKey: env.SUPABASE_ANON_KEY,
    rootDomain: env.ROOT_DOMAIN || '',
  });
}

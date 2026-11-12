import { json, getUser } from '../_lib/util.js';

const SYSTEM = `You are an expert senior web designer and front-end engineer.
The user describes a website or app. Reply with ONE complete, self-contained HTML file and nothing else (no markdown fences, no explanation).
Rules:
- Start with <!doctype html>. Put all CSS in <style> and all JS in <script>. External libraries only from cdnjs.cloudflare.com or cdn.jsdelivr.net.
- Professional, modern, high-quality design: strong typography, spacing, colour palette, subtle animation, fully responsive (mobile first), accessible.
- Include real, relevant copy (no lorem ipsum), a good <title>, meta description, and Open Graph tags for SEO.
- If it is an app (todo, calculator, game, dashboard, tracker, etc.) make it fully working with JavaScript, saving data in localStorage.
- Use Hindi or the language the user wrote in for the site content.
- Never build phishing/fake login or payment pages impersonating real brands, malware, or content meant to deceive or harm people.`;

function clean(t) {
  t = (t || '').trim();
  t = t.replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/, '');
  const i = t.search(/<!doctype html|<html/i);
  return i > 0 ? t.slice(i) : t;
}

async function callLLM(env, prompt, current) {
  const provider = (env.LLM_PROVIDER || 'gemini').toLowerCase();
  const key = env.LLM_API_KEY;
  const userMsg = current
    ? `Here is the current HTML:\n${current}\n\nApply this change and return the full updated HTML file:\n${prompt}`
    : prompt;

  if (provider === 'anthropic') {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: env.LLM_MODEL || 'claude-sonnet-5-5',
        max_tokens: 16000,
        system: SYSTEM,
        messages: [{ role: 'user', content: userMsg }],
      }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || 'Anthropic error');
    return d.content.map((c) => c.text || '').join('');
  }

  if (provider === 'gemini') {
    const model = env.LLM_MODEL || 'gemini-2.5-flash';
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: userMsg }] }],
          generationConfig: { maxOutputTokens: 32000 },
        }),
      }
    );
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || 'Gemini error');
    return (d.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
  }

  // openai-compatible (Groq, OpenRouter, OpenAI...) : set LLM_BASE_URL
  const base = env.LLM_BASE_URL || 'https://api.groq.com/openai/v1';
  const r = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: env.LLM_MODEL || 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: userMsg }],
    }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error?.message || 'LLM error');
  return d.choices[0].message.content;
}

export async function onRequestPost({ request, env }) {
  const user = await getUser(request, env);
  if (!user) return json({ error: 'Pehle login karo' }, 401);
  const { prompt, current } = await request.json().catch(() => ({}));
  if (!prompt || prompt.length > 4000) return json({ error: 'Prompt khali ya bahut lamba hai' }, 400);
  try {
    const html = clean(await callLLM(env, prompt, current && current.length < 150000 ? current : ''));
    if (!/<html|<!doctype/i.test(html)) return json({ error: 'AI ne sahi HTML nahi diya, dobara try karo' }, 502);
    return json({ html });
  } catch (e) {
    return json({ error: e.message }, 502);
  }
}

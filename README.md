# PromptSite – Prompt se Website/App banao, free subdomain par live karo

## Ye kya karta hai
- Login (Supabase) → prompt likho → AI poori website/app (HTML) banata hai → preview → chat se badlav
- Apna naam chuno → `naam.tumhara-domain.com` (ya `tumhara-app.pages.dev/s/naam`) par live
- Database: Supabase (users + sites)
- Google: `/sitemap.xml` apne aap banta hai
- App: har site me PWA manifest + icon judta hai (phone me install). APK: PWABuilder ya `apk-builder/` workflow

## Setup (sab free, ~15 minute)
1. **Supabase**: supabase.com par free project banao → SQL Editor me `supabase.sql` paste karke Run.
   Settings → API se `Project URL`, `anon key`, `service_role key` copy karo.
2. **AI key (free option)**: aistudio.google.com/apikey se Gemini key lo (free limit milti hai).
   Claude chahiye to console.anthropic.com se key lo (paid).
3. **GitHub**: is folder ko ek GitHub repo me upload karo.
4. **Cloudflare Pages** (free): Workers & Pages → Create → Pages → GitHub repo connect.
   Build command khali, output directory `public`.
5. Pages → Settings → Environment variables (Production) me daalo:

| Name | Value |
|---|---|
| SUPABASE_URL | https://xxxx.supabase.co |
| SUPABASE_ANON_KEY | anon key |
| SUPABASE_SERVICE_KEY | service_role key (secret!) |
| LLM_PROVIDER | gemini (ya anthropic, ya groq) |
| LLM_API_KEY | AI key |
| LLM_MODEL | (optional) |
| ROOT_DOMAIN | tumhara-domain.com (optional) |

6. Dobara deploy karo. `https://tumhara-app.pages.dev` khulega → sign up → prompt do.

## Free subdomain (naam.tumhara-domain.com)
Domain Cloudflare par add karo. Pages project → Custom domains me `tumhara-domain.com` jodo,
aur DNS me wildcard record `*` (CNAME → `tumhara-app.pages.dev`, proxied) banao.
Wildcard SSL ke liye Cloudflare ka Advanced Certificate chahiye ho sakta hai; free me `naam.tumhara-domain.com`
ek level ke subdomain Universal SSL se chal jaate hain. Domain na ho to `ROOT_DOMAIN` khali chhodo, sites `/s/naam` par chalengi.

## Google par laana
Search Console me domain add karo → Sitemaps me `https://tumhara-domain.com/sitemap.xml` daalo.
Google ko index karne me kuch din lagte hain.

## APK
- Turant: PWABuilder.com → site URL → Android → APK/AAB.
- Khud: `apk-builder/` ko alag GitHub repo me daalo → Actions → Build APK → site URL do → artifact download.

## Safety
Prompt me phishing/fake login, malware jaisi cheezein AI mana kar deta hai. Chahe to apne terms me abuse report ka rasta jodo.
Subdomain par sites alag origin par chalti hain, isliye builder ka login unse safe rehta hai.

# IRS Debt AI — Branded Starter (Vercel)

This is a ready-to-deploy site with:
- `/` chat with MOCK/LIVE toggle
- `/assisted-submit` guided form + PDF packet generator (client-side)
- `/privacy` and `/terms`
- green branding + simple logo
- server streaming route `/api/chat`

## One-page deploy (non-technical)

1) **OpenAI key**: https://platform.openai.com/api-keys → Create key, copy it.
2) **Vercel account**: https://vercel.com/signup
3) **Deploy**: https://vercel.com/new → drag-and-drop this folder.
   - If the first build fails, that’s ok (we will add the key next).
4) **Add env var** in Vercel: Project → Settings → Environment Variables
   - Name: `OPENAI_API_KEY`
   - Value: (paste your key)
   - Click Add → Redeploy latest build
5) **Visit site** → flip to LIVE → ask a question
6) **Domain** (`irsdebt.ai`): Project → Settings → Domains → Add → follow DNS steps

Local test (optional):
```
cp .env.local.example .env.local  # paste your key in .env.local
npm install
npm run dev
```

Enjoy!

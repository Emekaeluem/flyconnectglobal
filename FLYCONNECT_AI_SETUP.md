# FlyConnect AI — Integration instructions

## What's included
Your original HTML, CSS, JavaScript and images are preserved. All 5 HTML pages now load `flyconnect-ai.css` and `flyconnect-ai.js`. Vercel endpoints `api/ai-chat.js` and `api/ai-lead.js` handle server-side AI and lead storage. These features are not live until you deploy and configure the environment.

## Before deployment
1. **Backup:** create a new Git branch and review the code. Avoid replacing the live site until tested.
2. Create an OpenAI API key with billing enabled. In Vercel Project > Settings > Environment Variables, set `OPENAI_API_KEY` and optional `OPENAI_MODEL`. Do not place keys in HTML or frontend JS.
3. Create Supabase project. Execute `supabase-setup.sql` in its SQL editor. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as Vercel server environment variables (never with a `NEXT_PUBLIC_` prefix).
4. In `flyconnect-ai.js`, replace `WHATSAPP_NUMBER_HERE` with the **verified company WhatsApp phone number**, digits only with country code, e.g. `234...`.
5. Update `flyconnect-knowledge.json` using **approved, verified** company information and offers. Do not add speculative visa / financial claims.
6. Deploy to a Vercel Preview first, confirm `/api/ai-chat` and `/api/ai-lead` work, then promote to production.

## Security and privacy work REQUIRED before public launch
- Add durable per-IP/user rate limiting and abuse protection to both endpoints (serverless memory rate limiting is insufficient); set API spend limits/alerts.
- Add bot protection on lead submission, validate allowed origins and enforce request body limits at infrastructure level.
- Add a published privacy notice specifying collection, purposes, retention, deletion requests, cross-border processors, and consent; ensure compliance with applicable Nigerian data protection requirements.
- Review whether collecting full chat history is necessary; ensure staff access controls, retention and deletion workflow; currently last 10 messages are stored upon user opt-in.
- Confirm no private personal identifiers, passport numbers or financial documents are requested in free-text messages. Sensitive messages should be redacted if retained.
- Create a protected admin dashboard for authorised staff; do not expose a public GET endpoint for leads.
- Test error handling, mobile accessibility, high traffic, and contact procedures. WhatsApp button needs a verified number.

## Files to review
- `flyconnect-ai.js` user interface, lead form, WhatsApp route
- `flyconnect-ai.css` styling
- `api/ai-chat.js` OpenAI server function
- `api/ai-lead.js` Supabase server function
- `flyconnect-knowledge.json` verified company knowledge
- `supabase-setup.sql` lead database schema

Note: This is a functioning development integration, not an audited production CRM. No live changes have been made to your GitHub, Vercel or Supabase accounts.

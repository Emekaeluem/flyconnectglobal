// Fly Connect Global — Gemini chat endpoint (Vercel Node.js function).
// Keep GEMINI_API_KEY in Vercel's server-side Secret environment variable.
const guidance = require('../flyconnect-knowledge.json');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { message, history = [] } = req.body || {};
  if (typeof message !== 'string' || !message.trim() || message.length > 1500 || !Array.isArray(history) || history.length > 50) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'Chat service not configured' });

  const safeHistory = history.slice(-10)
    .filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content.slice(0, 1500) }] }));
  // Merge adjacent messages of the same role to satisfy Gemini multi-turn ordering.
  const contents = [];
  for (const turn of [...safeHistory, { role: 'user', parts: [{ text: message.trim() }] }]) {
    if (contents.length && contents[contents.length - 1].role === turn.role) {
      contents[contents.length - 1].parts.push(...turn.parts);
    } else contents.push(turn);
  }

  const system = `You are Fly Connect Global's friendly, professional, automated travel consultation service. Speak as Fly Connect Global, not as a human employee. Be natural, concise and warm. Help with study-abroad, work-abroad and travel enquiries. Ask one focused question at a time to learn destination, education, budget and desired intake; ask age only when necessary. Use ONLY the approved company details below for specific offers, fees, eligibility, deadlines and claims. If not confirmed, explicitly say a human consultant must confirm. Never invent partners, admission decisions, financing approvals, visa outcomes, current availability, or guarantees. Do not provide binding immigration/legal advice. Do not request passport scans, ID numbers, bank statements, banking credentials or other sensitive documents. Do not ask people to put contact details into this chat; instead direct interested visitors to the separate Request a consultation form, which obtains consent and stores their details securely. A human consultant is available for handover. Never claim a lead was saved unless the form reports success. Approved knowledge: ${JSON.stringify(guidance)}`;

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  // Whitelist model IDs; never take model choice from client input.
  if (!/^[a-zA-Z0-9.-]{3,80}$/.test(model)) return res.status(503).json({ error: 'Chat model not configured' });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { temperature: 0.25, maxOutputTokens: 600 }
      })
    });
    if (!response.ok) {
      console.error('Gemini request failed (status only):', response.status);
      return res.status(response.status === 429 ? 429 : 502).json({ error: response.status === 429 ? 'Chat is busy. Please try again shortly.' : 'Chat temporarily unavailable' });
    }
    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.filter(p => typeof p.text === 'string').map(p => p.text).join('').trim();
    if (!reply) return res.status(502).json({ error: 'Chat could not generate a response' });
    return res.status(200).json({ reply }); // Preserve frontend's existing response contract.
  } catch (err) {
    console.error('Gemini request could not complete:', err.name);
    return res.status(502).json({ error: 'Chat temporarily unavailable' });
  } finally { clearTimeout(timeout); }
};

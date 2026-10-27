
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  // Never expose the actual API key.
  return res.status(200).json({
    geminiKeyConfigured:
      Boolean(process.env.GEMINI_API_KEY?.trim()),
    environment: process.env.VERCEL_ENV || "unknown"
  });
};

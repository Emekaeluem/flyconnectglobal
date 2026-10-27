
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  return res.status(200).json({
    environment: process.env.VERCEL_ENV || "unknown",
    geminiKeyConfigured: Boolean(
      process.env.GEMINI_API_KEY?.trim()
    ),
    testVariableDetected:
      process.env.FLYCONNECT_CONFIG_TEST === "working123"
  });
};

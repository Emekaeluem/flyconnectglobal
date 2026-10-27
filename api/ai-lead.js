
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  if (Number(req.headers["content-length"] || 0) > 15000) {
    return res.status(413).json({
      error: "Request too large"
    });
  }

  const url = (process.env.SUPABASE_URL || "")
    .trim()
    .replace(/\/$/, "");

  const key = (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  ).trim();

  if (!url || !key) {
    console.error("FC_SUPABASE_CONFIG_MISSING");

    return res.status(503).json({
      error: "Consultation service not configured"
    });
  }

  const body = req.body || {};

  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "").trim();
  const interest = String(body.interest || "").trim();

  const validPhone = /^\+?[0-9 ()-]{7,25}$/.test(phone);
  const validEmail =
    !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (
    body.consent !== true ||
    name.length < 2 ||
    name.length > 100 ||
    !validPhone ||
    !validEmail ||
    email.length > 150 ||
    interest.length > 150
  ) {
    return res.status(400).json({
      error: "Please check your details and consent"
    });
  }

  // This version intentionally stores no conversation history.
  const lead = {
    name,
    phone,
    email: email || null,
    interest: interest || null,
    status: "new",
    conversation: [],
    consented_at: new Date().toISOString()
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      12000
    );

    let response;

    try {
      const headers = {
        apikey: key,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      };

      // Legacy service_role JWTs can be sent as Bearer tokens.
      // Supabase's newer sb_secret keys use the apikey header.
      if (!key.startsWith("sb_secret_")) {
        headers.Authorization = `Bearer ${key}`;
      }

      response = await fetch(
        `${url}/rest/v1/ai_leads`,
        {
          method: "POST",
          signal: controller.signal,
          headers,
          body: JSON.stringify(lead)
        }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      console.error(
        "FC_LEAD_DATABASE_ERROR",
        response.status
      );

      return res.status(502).json({
        error: "Could not save consultation request"
      });
    }

    return res.status(201).json({
      ok: true,
      message: "Your consultation request was received"
    });

  } catch (error) {
    console.error("FC_LEAD_ERROR", error.name);

    return res.status(502).json({
      error: "Consultation request unavailable"
    });
  }
};

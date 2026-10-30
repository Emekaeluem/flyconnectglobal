
(() => {
  "use strict";

  if (document.querySelector(".fcai-shell")) return;

  // Fly Connect Global official WhatsApp number
  const WHATSAPP_NUMBER = "2349126756454";

  const WHATSAPP_MESSAGE =
    "Hello Fly Connect Global! I visited your website and would like to speak with a travel consultant about your available packages.";

  const icon = (name) => ({
    chat: `<svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 11.5a8.5 8.5 0 0 1-8.5 8.5
      9 9 0 0 1-3.9-.9L3 21l1.9-4.6A8.5 8.5
      0 1 1 20 11.5Z"/></svg>`,

    send: `<svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round" stroke-linejoin="round">
      <path d="m21 3-7.5 18-3.5-7.5L3 10l18-7Z
      M21 3 10 14"/></svg>`,

    plus: `<svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round">
      <path d="M12 5v14M5 12h14"/></svg>`,

    history: `<svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/>
      <path d="M3 3v5h5M12 7v5l3 2"/></svg>`,

    x: `<svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2"
      stroke-linecap="round">
      <path d="M6 6l12 12M18 6 6 18"/></svg>`
  })[name];

  // Create chat interface
  const root = document.createElement("div");
  root.className = "fcai-shell";

  root.innerHTML = `
    <button type="button" class="fcai-launch"
      aria-label="Open Fly Connect Global chat">
      ${icon("chat")}
      <span>Chat with Us</span>
    </button>

    <section class="fcai-panel"
      role="dialog"
      aria-label="Fly Connect Global chat"
      aria-hidden="true">

      <header class="fcai-head">

        <button class="fcai-head-action fcai-close"
          type="button" aria-label="Close chat">
          ${icon("x")}
        </button>

        <div class="fcai-identity">
          <div class="fcai-brand-avatar"
            aria-hidden="true">
            FC
            <span class="fcai-brand-dot"></span>
          </div>

          <strong>Fly Connect Global</strong>
          <small>Travel &amp; Study Consultation</small>

          <div class="fcai-disclosure">
            Automated chat · Human support available
          </div>
        </div>

        <button class="fcai-head-action fcai-reset"
          type="button"
          aria-label="Start a new conversation"
          title="Start a new conversation">
          ${icon("history")}
        </button>
      </header>

      <div class="fcai-log"
        role="log" aria-live="polite"></div>

      <div class="fcai-actions">
        <button type="button" class="fcai-lead-toggle">
          Request consultation
        </button>

        <button type="button" class="fcai-whatsapp">
          Speak on WhatsApp
        </button>
      </div>

      <form class="fcai-lead" autocomplete="on">
        <strong>Request a consultation</strong>

        <p>
          With your permission, our team can contact you.
        </p>

        <input
          name="name"
          placeholder="Full name"
          aria-label="Full name"
          autocomplete="name"
          maxlength="100"
          required
        >

        <input
          name="email"
          type="email"
          placeholder="Email (optional)"
          aria-label="Email (optional)"
          autocomplete="email"
          maxlength="150"
        >

        <input
          name="phone"
          type="tel"
          placeholder="WhatsApp number"
          aria-label="WhatsApp number"
          autocomplete="tel"
          maxlength="25"
          required
        >

        <input
          name="interest"
          placeholder="Interested in, e.g. Canada study"
          aria-label="Interest"
          maxlength="150"
        >

        <label>
          <input type="checkbox" name="consent" required>
          I agree that Fly Connect Global may store these
          details and contact me about this enquiry.
        </label>

        <button type="submit">
          Send enquiry
        </button>
      </form>

      <div class="fcai-composer-wrap">

        <form class="fcai-inputbar">
          <button class="fcai-add"
            type="button"
            aria-label="Request a consultation"
            title="Request a consultation">
            ${icon("plus")}
          </button>

          <input
            aria-label="Type your message"
            maxlength="1500"
            placeholder="Type your message..."
            required
          >

          <button class="fcai-send"
            type="submit"
            aria-label="Send message">
            ${icon("send")}
          </button>
        </form>

        <div class="fcai-status" role="status"></div>

      </div>
    </section>
  `;

  document.body.append(root);

  const panel = root.querySelector(".fcai-panel");
  const log = root.querySelector(".fcai-log");
  const inputForm = root.querySelector(".fcai-inputbar");
  const input = inputForm.querySelector("input");
  const send = root.querySelector(".fcai-send");
  const status = root.querySelector(".fcai-status");
  const lead = root.querySelector(".fcai-lead");
  const history = [];

  const welcome =
    "Hello! 👋 Welcome to Fly Connect Global. " +
    "How can we help you today? Are you interested in " +
    "studying abroad, working abroad, or exploring travel options?";

  function time() {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date());
  }

  // Display chat messages safely
  function say(role, message) {
    const wrap = document.createElement("div");
    wrap.className = "fcai-message-row " + role;

    if (role === "bot") {
      const avatar = document.createElement("span");
      avatar.className = "fcai-mini-avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = "FC";
      wrap.append(avatar);
    }

    const stack = document.createElement("div");
    stack.className = "fcai-message-stack";

    const bubble = document.createElement("div");
    bubble.className = "fcai-msg " + role;
    bubble.textContent = message;

    const stamp = document.createElement("time");
    stamp.className = "fcai-time";
    stamp.textContent = time();

    stack.append(bubble, stamp);
    wrap.append(stack);

    log.append(wrap);
    log.scrollTop = log.scrollHeight;
  }

  say("bot", welcome);

  // Open or close chat
  function toggle(open) {
    panel.classList.toggle("fcai-open", open);
    panel.setAttribute("aria-hidden", String(!open));

    if (open) {
      input.focus();
    } else {
      root.querySelector(".fcai-launch").focus();
    }
  }

  // Consultation form
  function toggleLead() {
    lead.classList.toggle("fcai-show");

    if (lead.classList.contains("fcai-show")) {
      lead.querySelector("[name=name]").focus();
    }
  }

  root.querySelector(".fcai-launch")
    .addEventListener("click", () => toggle(true));

  root.querySelector(".fcai-close")
    .addEventListener("click", () => toggle(false));

  root.querySelector(".fcai-reset")
    .addEventListener("click", () => {
      history.length = 0;
      log.replaceChildren();
      say("bot", welcome);
      lead.classList.remove("fcai-show");
      status.textContent = "";
      input.focus();
    });

  root.querySelector(".fcai-lead-toggle")
    .addEventListener("click", toggleLead);

  root.querySelector(".fcai-add")
    .addEventListener("click", toggleLead);

  // WHATSAPP INTEGRATION
  root.querySelector(".fcai-whatsapp")
    .addEventListener("click", () => {

      const whatsappURL =
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(WHATSAPP_MESSAGE);

      const opened = window.open(
        whatsappURL,
        "_blank",
        "noopener,noreferrer"
      );

      // A fallback for browsers that block new tabs.
      // The button remains usable as an external link.
      status.textContent = "Opening WhatsApp...";
      setTimeout(() => {
        if (status.textContent === "Opening WhatsApp...") {
          status.textContent = "";
        }
      }, 3000);
    });

  // GEMINI CHAT CONNECTION
  inputForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = input.value.trim();

    if (!message || send.disabled) return;

    input.value = "";
    say("user", message);

    send.disabled = true;
    status.textContent = "Preparing your reply...";

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          history: history.slice(-10)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Chat unavailable");
      }

      const reply =
        typeof data.reply === "string"
          ? data.reply
          : "Please try again.";

      say("bot", reply);

      history.push(
        { role: "user", content: message },
        { role: "assistant", content: reply }
      );

      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }

    } catch (err) {
      say(
        "bot",
        "Our chat service is temporarily unavailable. " +
        "Please try again or request a consultation."
      );
    } finally {
      send.disabled = false;
      status.textContent = "";
      input.focus();
    }
  });

  // SUPABASE LEAD CAPTURE
  lead.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = lead.querySelector(
      'button[type="submit"]'
    );

    if (btn.disabled) return;

    const form = new FormData(lead);

    if (!form.get("consent")) return;

    btn.disabled = true;
    status.textContent = "Sending enquiry...";

    try {
      const response = await fetch("/api/ai-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email"),
          interest: form.get("interest"),
          consent: true,
          conversation: []
        })
      });

      const data = await response.json();

      if (!response.ok || data.ok === false) {
        throw new Error(
          data.error || "Submission failed"
        );
      }

      say(
        "bot",
        "Thanks! Your enquiry has been received. " +
        "Our team can follow up using the contact " +
        "details you provided."
      );

      lead.reset();
      lead.classList.remove("fcai-show");
      status.textContent = "";

    } catch (err) {
      status.textContent =
        "Could not send your enquiry. Please try again.";

    } finally {
      btn.disabled = false;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      panel.classList.contains("fcai-open")
    ) {
      toggle(false);
    }
  });

})();

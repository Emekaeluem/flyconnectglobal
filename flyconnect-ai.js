
(() => {
  "use strict";

  if (document.querySelector(".fcai-shell")) return;

  const svg = (path) => `
    <svg viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true">${path}</svg>
  `;

  const icons = {
    chat: svg('<path d="M20 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-3.9-.9L3 21l1.9-4.6A8.5 8.5 0 1 1 20 11.5Z"/>'),
    send: svg('<path d="m21 3-7.5 18-3.5-7.5L3 10l18-7ZM21 3 10 14"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    reset: svg('<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>')
  };

  const root = document.createElement("div");
  root.className = "fcai-shell";

  root.innerHTML = `
    <button class="fcai-launch" type="button">
      ${icons.chat}
      <span>Chat with Us</span>
    </button>

    <section class="fcai-panel"
      role="dialog"
      aria-label="Fly Connect Global chat"
      aria-hidden="true">

      <header class="fcai-head">
        <button class="fcai-head-action fcai-close"
          type="button" aria-label="Close">
          ${icons.close}
        </button>

        <div class="fcai-identity">
          <div class="fcai-brand-avatar">
            FC<span class="fcai-brand-dot"></span>
          </div>
          <strong>Fly Connect Global</strong>
          <small>Travel &amp; Study Consultation</small>
          <div class="fcai-disclosure">
            Automated chat · Human support available
          </div>
        </div>

        <button class="fcai-head-action fcai-reset"
          type="button" aria-label="New conversation">
          ${icons.reset}
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

      <form class="fcai-lead">
        <strong>Request a consultation</strong>
        <p>Our team would love to assist you.</p>

        <input name="name" placeholder="Full name"
          maxlength="100" autocomplete="name" required>

        <input name="phone" type="tel"
          placeholder="WhatsApp number"
          maxlength="25" autocomplete="tel" required>

        <input name="email" type="email"
          placeholder="Email (optional)"
          maxlength="150" autocomplete="email">

        <input name="interest"
          placeholder="Interested in, e.g. Study in Canada"
          maxlength="150">

        <label>
          <input type="checkbox" name="consent" required>
          I agree that Fly Connect Global may store my
          details and contact me about this enquiry.
        </label>

        <button type="submit">Send enquiry</button>
      </form>

      <div class="fcai-composer-wrap">
        <form class="fcai-inputbar">
          <button class="fcai-add" type="button"
            aria-label="Request consultation">
            ${icons.plus}
          </button>
          <input placeholder="Type your message..."
            aria-label="Type your message"
            maxlength="1500" required>
          <button class="fcai-send" type="submit"
            aria-label="Send">
            ${icons.send}
          </button>
        </form>
        <div class="fcai-status" role="status"></div>
      </div>
    </section>
  `;

  document.body.appendChild(root);

  const panel = root.querySelector(".fcai-panel");
  const log = root.querySelector(".fcai-log");
  const inputForm = root.querySelector(".fcai-inputbar");
  const input = inputForm.querySelector("input");
  const send = root.querySelector(".fcai-send");
  const lead = root.querySelector(".fcai-lead");
  const status = root.querySelector(".fcai-status");
  const launcher = root.querySelector(".fcai-launch");

  const history = [];

  const welcome =
    "Hello! 👋 Welcome to Fly Connect Global. " +
    "How can we help you today? Are you interested " +
    "in studying abroad, working abroad, or travel services?";

  function timestamp() {
    return new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function say(role, message) {
    const row = document.createElement("div");
    row.className = "fcai-message-row " + role;

    if (role === "bot") {
      const avatar = document.createElement("span");
      avatar.className = "fcai-mini-avatar";
      avatar.textContent = "FC";
      row.appendChild(avatar);
    }

    const stack = document.createElement("div");
    stack.className = "fcai-message-stack";

    const bubble = document.createElement("div");
    bubble.className = "fcai-msg " + role;

    // textContent protects the interface from injected HTML.
    bubble.textContent = message;

    const time = document.createElement("time");
    time.className = "fcai-time";
    time.textContent = timestamp();

    stack.append(bubble, time);
    row.appendChild(stack);
    log.appendChild(row);

    log.scrollTop = log.scrollHeight;
  }

  function toggle(open) {
    panel.classList.toggle("fcai-open", open);
    panel.setAttribute("aria-hidden", String(!open));

    if (open) input.focus();
    else launcher.focus();
  }

  function toggleLead() {
    lead.classList.toggle("fcai-show");

    if (lead.classList.contains("fcai-show")) {
      lead.querySelector("[name=name]").focus();
    }
  }

  function resetChat() {
    history.length = 0;
    log.replaceChildren();
    say("bot", welcome);
    lead.classList.remove("fcai-show");
    status.textContent = "";
    input.focus();
  }

  launcher.addEventListener("click", () => toggle(true));

  root.querySelector(".fcai-close")
    .addEventListener("click", () => toggle(false));

  root.querySelector(".fcai-reset")
    .addEventListener("click", resetChat);

  root.querySelector(".fcai-lead-toggle")
    .addEventListener("click", toggleLead);

  root.querySelector(".fcai-add")
    .addEventListener("click", toggleLead);

  // Replace with the authorised company WhatsApp number,
  // using country code and digits only.
  const WHATSAPP_NUMBER = "";

  root.querySelector(".fcai-whatsapp")
    .addEventListener("click", () => {
      if (!WHATSAPP_NUMBER) {
        status.textContent =
          "Please visit our Contact page for WhatsApp support.";
        return;
      }

      const text =
        "Hello Fly Connect Global, I would like " +
        "to speak with a travel consultant.";

      window.open(
        "https://wa.me/" + WHATSAPP_NUMBER +
        "?text=" + encodeURIComponent(text),
        "_blank",
        "noopener,noreferrer"
      );
    });

  inputForm.addEventListener("submit", async event => {
    event.preventDefault();

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
          history: history.slice(-8)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn(
          "FlyConnect chat status:",
          response.status,
          data.code || "UNKNOWN"
        );

        if (response.status === 429) {
          throw new Error("BUSY");
        }

        throw new Error("UNAVAILABLE");
      }

      if (typeof data.reply !== "string") {
        throw new Error("UNAVAILABLE");
      }

      say("bot", data.reply);

      history.push(
        { role: "user", content: message },
        { role: "assistant", content: data.reply }
      );

      if (history.length > 16) {
        history.splice(0, history.length - 16);
      }

    } catch (error) {
      const fallback = error.message === "BUSY"
        ? "We're receiving a lot of enquiries right now. Please try again shortly."
        : "We're unable to respond right now. Please try again or request a consultation.";

      say("bot", fallback);

    } finally {
      send.disabled = false;
      status.textContent = "";
      input.focus();
    }
  });

  lead.addEventListener("submit", async event => {
    event.preventDefault();

    const button = lead.querySelector(
      'button[type="submit"]'
    );

    if (button.disabled) return;

    const form = new FormData(lead);

    if (!form.get("consent")) return;

    button.disabled = true;
    status.textContent = "Sending your enquiry...";

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
          consent: true
        })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error("Submission failed");
      }

      say(
        "bot",
        "Thank you! Your consultation request has been " +
        "received. Our team can contact you using " +
        "the details you provided."
      );

      lead.reset();
      lead.classList.remove("fcai-show");
      status.textContent = "";

    } catch (error) {
      status.textContent =
        "We couldn't submit your request. " +
        "Please try again or contact our team.";

    } finally {
      button.disabled = false;
    }
  });

  document.addEventListener("keydown", event => {
    if (
      event.key === "Escape" &&
      panel.classList.contains("fcai-open")
    ) {
      toggle(false);
    }
  });

  say("bot", welcome);
})();

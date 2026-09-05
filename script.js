document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Video + sound ---------- */
  // Tries to autoplay WITH sound immediately. Browsers only allow this
  // for visitors they already trust with that site (returning visitors,
  // mainly) — first-time visitors will usually get blocked, silently,
  // by the browser itself. When blocked, the video keeps playing muted
  // and sound turns on the instant the visitor does anything at all on
  // the page — no separate button, no visible prompt.
  const video = document.querySelector('.hero__video');
  const soundToggle = document.getElementById('soundToggle');
  const setSoundState = (muted) => {
    if (!video) return;
    video.muted = muted;
    if (soundToggle) soundToggle.setAttribute('aria-pressed', String(!muted));
  };
  const unmuteOnFirstInteraction = () => {
    setSoundState(false);
    video.play();
  };
  const armInteractionUnmute = () => {
    document.addEventListener('click', unmuteOnFirstInteraction, { once: true, capture: true });
    document.addEventListener('touchstart', unmuteOnFirstInteraction, { once: true, capture: true });
    document.addEventListener('keydown', unmuteOnFirstInteraction, { once: true, capture: true });
  };
  const attemptAutoplay = () => {
    setSoundState(false);
    const soundAttempt = video.play();
    if (soundAttempt !== undefined) {
      soundAttempt.catch(() => {
        setSoundState(true);
        video.play().catch(() => {});
        armInteractionUnmute();
      });
    }
  };
  if (video) {
    if (video.readyState >= 2) {
      attemptAutoplay();
    } else {
      video.addEventListener('loadeddata', attemptAutoplay, { once: true });
    }
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        setSoundState(!video.muted);
        if (!video.muted) video.play();
      });
    }
  }

  /* ---------- Nav dropdown menus (desktop + mobile) ---------- */
  const navItems = document.querySelectorAll('.nav__item');
  const closeAllDropdowns = (except) => {
    navItems.forEach((item) => {
      if (item === except) return;
      item.classList.remove('is-open');
      const btn = item.querySelector('.nav__link[aria-haspopup]');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  };
  navItems.forEach((item) => {
    const trigger = item.querySelector('.nav__link[aria-haspopup]');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = item.classList.contains('is-open');
      closeAllDropdowns(item);
      item.classList.toggle('is-open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });
  document.addEventListener('click', () => closeAllDropdowns());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDropdowns();
  });

  /* ---------- Mobile menu toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.contains('is-open');
      navMenu.classList.toggle('is-open', !isOpen);
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      if (isOpen) closeAllDropdowns();
    });
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Reset mobile menu state when resizing back to desktop */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && navMenu) {
      navMenu.classList.remove('is-open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

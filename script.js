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

  /* ---------- Mission video: always silent, no sound control at all ---------- */
  const missionVideo = document.querySelector('.mission__video-el');
  if (missionVideo) {
    missionVideo.muted = true;
    missionVideo.play().catch(() => {});
  }

  /* ---------- Scroll-reveal: fade + rise each element in as it enters view ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ---------- Stats count-up: animate each number from 0 once visible ---------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const statNumbers = document.querySelectorAll('.stats__number');

  const animateCount = (el) => {
    const target = parseFloat(el.dataset.target || '0');
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';

    if (prefersReducedMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }

    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toFixed(decimals) + suffix;
      }
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window && statNumbers.length) {
    const statsObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statNumbers.forEach((el) => statsObserver.observe(el));
  } else {
    statNumbers.forEach((el) => animateCount(el));
  }

  /* ---------- Route Planner: 13-step form ---------- */
  const plannerForm = document.getElementById('plannerForm');
  if (plannerForm) {
    const TOTAL_STEPS = 13;
    const steps = Array.from(plannerForm.querySelectorAll('.planner__step'));
    const backBtn = document.getElementById('plannerBack');
    const nextBtn = document.getElementById('plannerNext');
    const stepNumEl = document.getElementById('plannerStepNum');
    const phaseCurrentEl = document.getElementById('plannerPhaseCurrent');
    const routeFill = document.getElementById('plannerRouteFill');
    const plane = document.getElementById('plannerPlane');
    const waypoints = Array.from(document.querySelectorAll('.planner__waypoint'));
    const successEl = document.getElementById('plannerSuccess');
    const cardEl = document.querySelector('.planner__card');

    const phaseByStep = {
      1: 'Contact point', 2: 'Contact point', 3: 'Contact point',
      4: 'Goal mapping',
      5: 'Location fit', 6: 'Location fit', 7: 'Location fit',
      8: 'Readiness', 9: 'Readiness', 10: 'Readiness', 11: 'Readiness', 12: 'Readiness', 13: 'Readiness'
    };

    let currentStep = 1;
    const answers = {};

    // Single-select pill groups: clicking one deselects its siblings
    plannerForm.querySelectorAll('.planner__pills').forEach((group) => {
      group.addEventListener('click', (e) => {
        const pill = e.target.closest('.planner__pill');
        if (!pill) return;
        group.querySelectorAll('.planner__pill').forEach((p) => p.classList.remove('is-selected'));
        pill.classList.add('is-selected');
        answers[group.dataset.group] = pill.textContent.trim();
        updateNextState();
      });
    });

    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

    const canProceed = () => {
      const stepEl = steps[currentStep - 1];
      switch (currentStep) {
        case 1:
          return isValidEmail(document.getElementById('plannerEmail').value);
        case 2:
          return document.getElementById('plannerFirstName').value.trim().length > 0 &&
                 document.getElementById('plannerLastName').value.trim().length > 0;
        case 3:
          return document.getElementById('plannerPhone').value.trim().length >= 7;
        case 6:
          return document.getElementById('plannerState').value.trim().length > 0;
        case 12:
          return true; // optional
        case 13:
          return document.getElementById('plannerConsent').checked;
        default: {
          // Pill-based steps: 4, 5, 7, 8, 9, 10, 11
          const pillsGroup = stepEl.querySelector('.planner__pills');
          if (!pillsGroup) return true;
          return !!pillsGroup.querySelector('.is-selected');
        }
      }
    };

    const updateNextState = () => {
      nextBtn.disabled = !canProceed();
    };

    const updateProgressVisual = () => {
      const percent = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
      routeFill.style.width = percent + '%';
      plane.style.left = percent + '%';

      waypoints.forEach((wp) => {
        const phaseStep = parseInt(wp.dataset.phaseStep, 10);
        wp.classList.toggle('is-passed', currentStep >= phaseStep);
      });

      stepNumEl.textContent = currentStep;
      phaseCurrentEl.textContent = phaseByStep[currentStep];
    };

    const showStep = (stepNumber) => {
      steps.forEach((s) => s.classList.remove('is-active'));
      steps[stepNumber - 1].classList.add('is-active');
      backBtn.disabled = stepNumber === 1;
      nextBtn.textContent = stepNumber === TOTAL_STEPS ? 'Submit' : 'Next';
      updateProgressVisual();
      updateNextState();
    };

    // Re-check button state as the person types/checks, for instant feedback
    plannerForm.addEventListener('input', updateNextState);
    plannerForm.addEventListener('change', updateNextState);

    // Enter key advances on single-line fields (not the textarea)
    plannerForm.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (!nextBtn.disabled) nextBtn.click();
      }
    });

    backBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep -= 1;
        showStep(currentStep);
      }
    });

    nextBtn.addEventListener('click', () => {
      if (nextBtn.disabled) return;

      if (currentStep === TOTAL_STEPS) {
        // Final submit: no backend wired up yet, so just show the confirmation screen
        cardEl.querySelectorAll('.planner__progress, .planner__form, .planner__nav').forEach((el) => {
          el.style.display = 'none';
        });
        successEl.hidden = false;
        return;
      }

      currentStep += 1;
      showStep(currentStep);
    });

    showStep(currentStep);
  }

  /* ---------- Partners mobile marquee: built from the existing grid,
     so the logo list only has to be maintained in one place ---------- */
  const marqueeTrack = document.getElementById('partnersMarqueeTrack');
  if (marqueeTrack) {
    const gridImages = document.querySelectorAll('.partners__grid .partners__item img');
    const buildSet = (hidden) => {
      gridImages.forEach((img) => {
        const item = document.createElement('div');
        item.className = 'partners__marquee-item';
        if (hidden) item.setAttribute('aria-hidden', 'true');
        const clone = document.createElement('img');
        clone.src = img.src;
        clone.alt = hidden ? '' : img.alt;
        clone.loading = 'lazy';
        item.appendChild(clone);
        marqueeTrack.appendChild(item);
      });
    };
    buildSet(false); // real, announced set
    buildSet(true);  // duplicate set, for a seamless loop, hidden from screen readers
  }

  /* ---------- Services stack: JS-driven pinning (not CSS position:sticky).
     Sticky can silently fail to activate depending on browser/ancestor
     quirks that are hard to diagnose from CSS alone. This computes the
     same "pin, then get covered by the next card" effect by hand, using
     real scroll measurements, so it doesn't depend on sticky support at all. ---------- */
  const serviceWraps = Array.from(document.querySelectorAll('.services__card-wrap'));
  if (serviceWraps.length) {
    const PIN_TOP = 110;       // matches the card's intended pinned distance from viewport top
    const MOBILE_BREAKPOINT = 700; // matches the CSS breakpoint that drops the effect on small screens
    let ticking = false;

    const clearStackStyles = () => {
      serviceWraps.forEach((wrap) => {
        const card = wrap.querySelector('.services__card');
        if (!card) return;
        card.style.position = '';
        card.style.left = '';
        card.style.width = '';
        card.style.top = '';
      });
    };

    const updateStack = () => {
      ticking = false;

      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        clearStackStyles(); // let the mobile CSS (position: static, normal flow) take over
        return;
      }

      serviceWraps.forEach((wrap) => {
        const card = wrap.querySelector('.services__card');
        if (!card) return;

        const wrapRect = wrap.getBoundingClientRect();
        const cardHeight = card.offsetHeight;
        const wrapHeight = wrap.offsetHeight;

        if (wrapRect.top > PIN_TOP) {
          // Not reached yet: sits at the top of its own (still lower) wrapper
          card.style.position = 'absolute';
          card.style.left = '0';
          card.style.width = '100%';
          card.style.top = '0px';
        } else if (wrapRect.bottom <= PIN_TOP + cardHeight) {
          // Its wrapper has fully scrolled past: stay pinned to the wrapper's bottom
          // (this is the moment the next card takes over covering it)
          card.style.position = 'absolute';
          card.style.left = '0';
          card.style.width = '100%';
          card.style.top = Math.max(0, wrapHeight - cardHeight) + 'px';
        } else {
          // Actively in its pinned window: lock to the viewport
          card.style.position = 'fixed';
          card.style.left = wrapRect.left + 'px';
          card.style.width = wrapRect.width + 'px';
          card.style.top = PIN_TOP + 'px';
        }
      });
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateStack);
      }
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    updateStack();
  }

  /* ---------- Services stack: play each card's video only while it's
     the visible/active one in the sticky stack, pause the rest ---------- */
  const serviceVideos = document.querySelectorAll('.services__card-video');
  if ('IntersectionObserver' in window && serviceVideos.length) {
    const serviceVideoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.6 });
    serviceVideos.forEach((video) => serviceVideoObserver.observe(video));
  } else {
    // No IntersectionObserver support: fall back to just playing them all
    serviceVideos.forEach((video) => video.play().catch(() => {}));
  }
});

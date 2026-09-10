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

  /* ---------- Mobile menu toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.contains('is-open');
      navMenu.classList.toggle('is-open', !isOpen);
      navToggle.setAttribute('aria-expanded', String(!isOpen));
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

  /* ---------- Services: full-screen horizontal scroll-jack.
     Normal vertical scroll through a tall spacer drives horizontal
     translateX across 4 full-screen slides; once the last slide is
     reached, normal vertical scrolling continues into the next section.
     Disabled on mobile and for reduced-motion, where CSS shows a plain
     vertical list instead (untouched, as requested). ---------- */
  const hscrollSpacer = document.getElementById('servicesHScrollSpacer');
  const hscroll = document.getElementById('servicesHScroll');
  const hscrollTrack = document.getElementById('servicesHScrollTrack');

  if (hscrollSpacer && hscroll && hscrollTrack) {
    const MOBILE_BREAKPOINT = 700;
    const slideEls = Array.from(hscrollTrack.children);
    const slideCount = slideEls.length;
    const slideVideos = slideEls.map((slide) => slide.querySelector('.services__slide-video'));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ticking = false;
    let activeIndex = -1;
    let mobileVideoObserver = null;

    const clearHScrollStyles = () => {
      hscroll.style.position = '';
      hscroll.style.top = '';
      hscroll.style.left = '';
      hscroll.style.width = '';
      hscroll.style.height = '';
      hscrollTrack.style.transform = '';
    };

    const setActiveSlide = (index) => {
      if (index === activeIndex) return;
      activeIndex = index;
      slideVideos.forEach((video, i) => {
        if (!video) return;
        if (i === index) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    };

    // Mobile/reduced-motion: each video only starts once it actually
    // scrolls into view, instead of all 4 loading and playing at once
    const ensureMobileVideoObserver = () => {
      if (mobileVideoObserver || !('IntersectionObserver' in window)) return;
      mobileVideoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.4 });
      slideVideos.forEach((video) => { if (video) mobileVideoObserver.observe(video); });
    };

    const disconnectMobileVideoObserver = () => {
      if (mobileVideoObserver) {
        mobileVideoObserver.disconnect();
        mobileVideoObserver = null;
      }
    };

    const update = () => {
      ticking = false;

      if (window.innerWidth <= MOBILE_BREAKPOINT || prefersReducedMotion) {
        clearHScrollStyles();
        ensureMobileVideoObserver();
        return;
      }

      disconnectMobileVideoObserver();

      const spacerRect = hscrollSpacer.getBoundingClientRect();
      const scrollableDistance = hscrollSpacer.offsetHeight - window.innerHeight;
      let progress;

      if (spacerRect.top > 0) {
        // Not reached yet
        hscroll.style.position = 'absolute';
        hscroll.style.top = '0px';
        hscroll.style.left = '0px';
        hscroll.style.width = '100vw';
        hscroll.style.height = '100vh';
        progress = 0;
      } else if (spacerRect.bottom <= window.innerHeight) {
        // Fully scrolled past: park at the bottom of the spacer, fully progressed
        hscroll.style.position = 'absolute';
        hscroll.style.top = Math.max(0, hscrollSpacer.offsetHeight - window.innerHeight) + 'px';
        hscroll.style.left = '0px';
        hscroll.style.width = '100vw';
        hscroll.style.height = '100vh';
        progress = 1;
      } else {
        // Actively pinned: drive horizontal progress from vertical scroll
        hscroll.style.position = 'fixed';
        hscroll.style.top = '0px';
        hscroll.style.left = '0px';
        hscroll.style.width = '100vw';
        hscroll.style.height = '100vh';
        progress = scrollableDistance > 0 ? Math.min(1, Math.max(0, -spacerRect.top / scrollableDistance)) : 0;
      }

      const translateX = progress * (slideCount - 1) * 100;
      hscrollTrack.style.transform = `translateX(-${translateX}vw)`;
      setActiveSlide(Math.round(progress * (slideCount - 1)));
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    update();
  }

  /* ---------- Partnership page: Your Next Step form (12-step version
     of the homepage Route Planner — same visual system, different
     fields, so it needs its own validation/step logic) ---------- */
  const ppForm = document.getElementById('ppForm');
  if (ppForm) {
    const TOTAL_STEPS = 12;
    const steps = Array.from(ppForm.querySelectorAll('.planner__step'));
    const backBtn = document.getElementById('ppBack');
    const nextBtn = document.getElementById('ppNext');
    const stepNumEl = document.getElementById('ppStepNum');
    const phaseCurrentEl = document.getElementById('ppPhaseCurrent');
    const routeFill = document.getElementById('ppRouteFill');
    const plane = document.getElementById('ppPlane');
    const waypoints = Array.from(document.querySelectorAll('#partner-form .planner__waypoint'));
    const successEl = document.getElementById('ppSuccess');
    const cardEl = document.querySelector('#partner-form .planner__card');

    const phaseByStep = {
      1: 'Your details', 2: 'Your details', 3: 'Your details', 4: 'Your details',
      5: 'Your organisation', 6: 'Your organisation', 7: 'Your organisation',
      8: 'The partnership', 9: 'The partnership', 10: 'The partnership',
      11: 'Final step', 12: 'Final step'
    };

    let currentStep = 1;
    const answers = {};

    ppForm.querySelectorAll('.planner__pills').forEach((group) => {
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
          return document.getElementById('ppOrg').value.trim().length > 0;
        case 2:
          return document.getElementById('ppFirstName').value.trim().length > 0 &&
                 document.getElementById('ppLastName').value.trim().length > 0;
        case 3:
          return isValidEmail(document.getElementById('ppEmail').value);
        case 4:
          return document.getElementById('ppWhatsapp').value.trim().length >= 7;
        case 5:
          return true; // website/social link is optional
        case 6:
          return document.getElementById('ppLocation').value.trim().length > 0;
        case 7: {
          const pillsGroup = stepEl.querySelector('.planner__pills');
          return !!pillsGroup.querySelector('.is-selected');
        }
        case 8:
          return document.getElementById('ppPartnerOn').value.trim().length > 0;
        case 9:
          return true; // licences/accreditations optional
        case 10:
          return document.getElementById('ppMarkets').value.trim().length > 0;
        case 11:
          return true; // notes optional
        case 12:
          return document.getElementById('ppConsent').checked;
        default:
          return true;
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

    ppForm.addEventListener('input', updateNextState);
    ppForm.addEventListener('change', updateNextState);

    ppForm.addEventListener('keydown', (e) => {
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
});

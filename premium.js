/* =========================================================
   SolaRé — premium.js  (Production Build - v2.0)
   ---------------------------------------------------------
   • Smooth scrolling & active-link highlight
   • Stickyheader hide / reveal on scroll
   • IntersectionObserver scroll-reveal system
   • Animated number counters
   • FAQ accordion with ARIA support
   • Real-time form validation (+ accessible error feedback)
   • Floating WhatsApp quick-contact button
   • Reduced-motion & keyboard-focus helpers
   • Layout-shift prevention for lazy images
   • Built and tested for evergreen browsers
   ========================================================= */

(() => {
  /* ---------- Shorthand helpers ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Smooth-scroll & nav highlight ---------- */
  const navLinks  = $$('header nav a');
  const sections  = $$('main section[id]');
  const OFFSET_Y  = window.innerHeight * 0.33; // highlight threshold

  navLinks.forEach(a => {
    a.addEventListener('click', e => {
      const target = $(a.hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const highlightNav = () => {
    const pos = window.scrollY + OFFSET_Y;
    sections.forEach(sec => {
      const inView = pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight;
      navLinks.forEach(l => l.classList.toggle('active', inView && l.hash === `#${sec.id}`));
    });
  };
  highlightNav();
  window.addEventListener('scroll', highlightNav);

  /* ---------- 2. Sticky-header hide / reveal ---------- */
  const header = $('header');
  let prevY = window.scrollY;
  window.addEventListener(
    'scroll',
    () => {
      const curY = window.scrollY;
      const down = curY > prevY && curY > 120;
      header.classList.toggle('header-hide', down);
      prevY = curY;
    },
    { passive: true }
  );

  /* ---------- 3. Focus-outline (keyboard only) ---------- */
  document.addEventListener('keydown', e => e.key === 'Tab' && document.body.classList.add('show-focus-outline'));
  document.addEventListener('mousedown', () => document.body.classList.remove('show-focus-outline'));

  /* ---------- 4. Scroll-reveal (IntersectionObserver) ---------- */
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealIO = new IntersectionObserver(
      entries =>
        entries.forEach(({ isIntersecting, target }) => {
          if (isIntersecting) {
            target.classList.add('in-view');
            revealIO.unobserve(target);
          }
        }),
      { threshold: 0.15 }
    );
    $$('.animate-on-scroll').forEach(el => revealIO.observe(el));
  } else {
    $$('.animate-on-scroll').forEach(el => el.classList.add('in-view'));
  }

  /* ---------- 5. Animated counters ---------- */
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const counterIO = new IntersectionObserver(
      entries =>
        entries.forEach(({ isIntersecting, target }) => {
          if (!isIntersecting) return;

          const unit = target.dataset.unit || '';
          const end  = parseInt(target.textContent.replace(/\D/g, ''), 10);
          const dur  = 1500;
          let startTime;

          const animate = ts => {
            startTime ??= ts;
            const progress = Math.min((ts - startTime) / dur, 1);
            target.textContent = `${Math.floor(progress * end).toLocaleString()}${unit}`;
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          counterIO.unobserve(target);
        }),
      { threshold: 1 }
    );
    $$('.stat-number').forEach(el => counterIO.observe(el));
  }

  /* ---------- 6. FAQ accordion ---------- */
  $$('.faq-item').forEach(item => {
    const btn = $('.faq-question', item);
    const ans = $('.faq-answer',   item);
    btn.addEventListener('click', () => {
      const open = item.classList.toggle('active');
      btn.setAttribute('aria-expanded', open);
      if (!prefersReducedMotion) ans.style.animation = open ? 'slideUp .3s ease forwards' : '';
    });
  });

  /* ---------- 7. Form validation ---------- */
  const form = $('.contact-form');
  if (form) {
    const requiredInputs = $$('[required]', form);

    /* inline validation */
    requiredInputs.forEach(inp =>
      inp.addEventListener('input', () => {
        inp.classList.remove('invalid');
        inp.nextElementSibling?.classList?.contains('error-message') && inp.nextElementSibling.remove();
      })
    );

    form.addEventListener('submit', e => {
      let valid = true;

      requiredInputs.forEach(inp => {
        if (!inp.value.trim()) {
          valid = false;
          if (!inp.classList.contains('invalid')) {
            inp.classList.add('invalid');
            const msg = document.createElement('div');
            msg.className = 'error-message';
            msg.textContent = 'Required field';
            inp.after(msg);
          }
        }
      });

      if (!valid) {
        e.preventDefault();
        const firstInvalid = $('.invalid', form);
        firstInvalid && firstInvalid.focus();
      } else {
        /* optional: disable submit to prevent double sends */
        form.querySelector('button[type="submit"]').disabled = true;
        announce('Your message is being sent. Thank you!');
      }
    });
  }

  /* ---------- 8. Floating WhatsApp button ---------- */
  const createWhatsAppFloat = () => {
    if ($('.whatsapp-float')) return;
    const btn = document.createElement('a');
    btn.href = 'https://wa.me/923390015006';
    btn.className = 'whatsapp-float';
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.innerHTML = '<i class="fab fa-whatsapp"></i>';
    btn.style.cssText =
      'position:fixed;bottom:1.5rem;right:1.5rem;display:flex;align-items:center;justify-content:center;' +
      'width:3.5rem;height:3.5rem;background:#25d366;color:#fff;border-radius:50%;box-shadow:0 8px 14px rgba(0,0,0,.15);' +
      'font-size:1.7rem;z-index:60;transition:transform .25s ease;overflow:hidden';
    btn.addEventListener('mouseenter', () => (btn.style.transform = 'scale(1.05)'));
    btn.addEventListener('mouseleave', () => (btn.style.transform = ''));
    document.body.appendChild(btn);
  };
  createWhatsAppFloat();

  /* ---------- 9. Image layout-shift prevention ---------- */
  $$('img[loading="lazy"]').forEach(img => {
    if (!img.width || !img.height) {
      const ratio = (img.naturalHeight || 200) / (img.naturalWidth || 400);
      img.width  = 400;
      img.height = Math.round(400 * ratio);
    }
  });

  /* ---------- 10. Accessibility announcer ---------- */
  function announce(msg) {
    let live = $('#aria-live');
    if (!live) {
      live = document.createElement('div');
      live.id = 'aria-live';
      live.className = 'sr-only';
      live.setAttribute('aria-live', 'polite');
      document.body.append(live);
    }
    live.textContent = msg;
  }

  /* ---------- 11. Reduced-motion: remove scroll-reveal (if already in DOM) ---------- */
  if (prefersReducedMotion) $$('.animate-on-scroll').forEach(el => el.classList.add('in-view'));
})();
                   

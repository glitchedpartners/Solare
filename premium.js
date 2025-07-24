/* =========================================================
   SolaRé — premium.js  (Production Build - July 2025)
   ---------------------------------------------------------
   •  Smooth scrolling + active-link highlight
 •  Sticky-header hide / reveal on scroll
   •  IntersectionObserver scroll-reveal system
   •  Animated number counters
   •  FAQ accordion with ARIA support
   •  Accessible, real-time form validation
   •  Floating WhatsApp quick-contact button
   •  Reduced-motion & keyboard-focus helpers
   •  Layout-shift prevention for lazy images
   ========================================================= */

(() => {
  /* ---------- Helpers ---------- */
  const $  = (q, c = document) => c.querySelector(q);
  const $$ = (q, c = document) => [...c.querySelectorAll(q)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Smooth scroll + nav highlight ---------- */
  const navLinks = $$('header nav a');
  const sections = $$('main section[id]');
  const OFFSET   = window.innerHeight * 0.33;

  navLinks.forEach(a => a.addEventListener('click', e => {
    const target = $(a.hash);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }));

  const highlight = () => {
    const pos = window.scrollY + OFFSET;
    sections.forEach(sec => {
      const active = pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight;
      navLinks.forEach(l => l.classList.toggle('active', active && l.hash === `#${sec.id}`));
    });
  };
  highlight();
  addEventListener('scroll', highlight, { passive: true });

  /* ---------- 2. Sticky-header hide / reveal ---------- */
  const header = $('header');
  let prevY = scrollY;
  addEventListener('scroll', () => {
    const curY = scrollY;
    header.classList.toggle('header-hide', curY > prevY && curY > 120);
    prevY = curY;
  }, { passive: true });

  /* ---------- 3. Keyboard focus outline ---------- */
  addEventListener('keydown', e => e.key === 'Tab' && document.body.classList.add('show-focus-outline'));
  addEventListener('mousedown', () => document.body.classList.remove('show-focus-outline'));

  /* ---------- 4. Scroll-reveal ---------- */
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealIO = new IntersectionObserver(
      es => es.forEach(({ isIntersecting, target }) => {
        if (isIntersecting) {
          target.classList.add('in-view');
          revealIO.unobserve(target);
        }
      }),
      { threshold: .15 }
    );
    $$('.animate-on-scroll').forEach(el => revealIO.observe(el));
  } else {
    $$('.animate-on-scroll').forEach(el => el.classList.add('in-view'));
  }

  /* ---------- 5. Animated counters ---------- */
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const countIO = new IntersectionObserver(
      es => es.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;

        const unit = target.dataset.unit || '';
        const end  = parseInt(target.textContent.replace(/\D/g, ''), 10) || 0;
        const dur  = 1500;
        let start;

        const tick = ts => {
          start ??= ts;
          const p = Math.min((ts - start) / dur, 1);
          target.textContent = `${Math.floor(p * end).toLocaleString()}${unit}`;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countIO.unobserve(target);
      }),
      { threshold: 1 }
    );
    $$('.stat-number').forEach(el => countIO.observe(el));
  }

  /* ---------- 6. FAQ accordion ---------- */
  $$('.faq-item').forEach(item => {
    const btn = $('.faq-question', item);
    const ans = $('.faq-answer', item);
    btn.addEventListener('click', () => {
      const open = item.classList.toggle('active');
      btn.setAttribute('aria-expanded', open);
      if (!reducedMotion) ans.style.animation = open ? 'slideUp .3s ease forwards' : '';
    });
  });

  /* ---------- 7. Form validation ---------- */
  const form = $('.contact-form');
  if (form) {
    const fields = $$('[required]', form);

    fields.forEach(f =>
      f.addEventListener('input', () => {
        f.classList.remove('invalid');
        f.nextElementSibling?.classList.contains('error-message') && f.nextElementSibling.remove();
      })
    );

    form.addEventListener('submit', e => {
      let ok = true;
      fields.forEach(f => {
        if (!f.value.trim()) {
          ok = false;
          if (!f.classList.contains('invalid')) {
            f.classList.add('invalid');
            const msg = document.createElement('div');
            msg.className = 'error-message';
            msg.textContent = 'Required field';
            f.after(msg);
          }
        }
      });
      if (!ok) {
        e.preventDefault();
        $('.invalid', form)?.focus();
      } else {
        form.querySelector('button[type="submit"]').disabled = true;
        announce('Thank you! Sending your request…');
      }
    });
  }

  /* ---------- 8. Floating WhatsApp ---------- */
  const addWhatsApp = () => {
    if ($('.whatsapp-float')) return;
    const btn = document.createElement('a');
    btn.href = 'https://wa.me/923390015006';
    btn.className = 'whatsapp-float';
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.innerHTML = '<i class="fab fa-whatsapp"></i>';
    btn.style.cssText = `
      position:fixed;bottom:1.5rem;right:1.5rem;
      width:3.5rem;height:3.5rem;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      background:#25d366;color:#fff;font-size:1.7rem;
      box-shadow:0 8px 14px rgb(0 0 0 / .15);z-index:90;
      transition:transform .25s ease
    `;
    btn.addEventListener('mouseenter', () => (btn.style.transform = 'scale(1.05)'));
    btn.addEventListener('mouseleave', () => (btn.style.transform = ''));
    document.body.append(btn);
  };
  addWhatsApp();

  /* ---------- 9. Prevent CLS on lazy images ---------- */
  $$('img[loading="lazy"]').forEach(img => {
    if (img.width && img.height) return;
    const ratio = (img.naturalHeight || 200) / (img.naturalWidth || 400);
    img.width  = 400;
    img.height = Math.round(400 * ratio);
  });

  /* ---------- 10. ARIA live announcer ---------- */
  function announce(text) {
    let live = $('#aria-live');
    if (!live) {
      live = Object.assign(document.createElement('div'), {
        id: 'aria-live',
        className: 'sr-only',
        ariaLive: 'polite'
      });
      document.body.append(live);
    }
    live.textContent = text;
  }

  /* ---------- 11. Reduced-motion immediate reveal ---------- */
  if (reducedMotion) $$('.animate-on-scroll').forEach(el => el.classList.add('in-view'));
})();

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Staggered cascading reveal for grids ---------- */
  const staggerSelectors = ['.event-grid > *', '.review-grid > *', '.menu-grid > *', '.process > *', '.carousel-track > *'];
  staggerSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal', 'stagger-item');
      el.style.transitionDelay = `${(i % 6) * 90}ms`;
    });
  });

  /* ---------- Custom magnetic cursor ---------- */
  if (hasFinePointer && !reduceMotion) {
    document.body.classList.add('custom-cursor');
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });
    const cursorLoop = () => {
      rx += (mx - rx) * 0.45;
      ry += (my - ry) * 0.45;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(cursorLoop);
    };
    cursorLoop();

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, .tilt-card, input, textarea, select')) ring.classList.add('is-active');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, .tilt-card, input, textarea, select')) ring.classList.remove('is-active');
    });
    document.documentElement.addEventListener('mouseleave', () => {
      dot.classList.add('is-hidden'); ring.classList.add('is-hidden');
    });
    document.documentElement.addEventListener('mouseenter', () => {
      dot.classList.remove('is-hidden'); ring.classList.remove('is-hidden');
    });
  }

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);
  const updateProgress = () => {
    const h = document.documentElement;
    const scrollable = h.scrollHeight - h.clientHeight;
    const pct = scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0;
    progressBar.style.width = pct + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- Cursor spotlight glow on dark panels ---------- */
  if (hasFinePointer) {
    document.querySelectorAll('.texture-panel').forEach(panel => {
      const layer = document.createElement('div');
      layer.className = 'spotlight-layer';
      panel.insertBefore(layer, panel.firstChild);
      panel.addEventListener('mousemove', (e) => {
        const rect = panel.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(2);
        const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(2);
        panel.style.setProperty('--mx', x + '%');
        panel.style.setProperty('--my', y + '%');
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (hasFinePointer && !reduceMotion) {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${(x * 0.25).toFixed(1)}px, ${(y * 0.35).toFixed(1)}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Page curtain intro ---------- */
  const curtain = document.querySelector('.page-curtain');
  if (curtain) {
    setTimeout(() => curtain.classList.add('curtain-hidden'), 1800);
  }

  /* ---------- Fade-out on internal navigation ---------- */
  document.querySelectorAll('a[href$=".html"], a[href*=".html#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http') || a.target === '_blank') return;
      e.preventDefault();
      document.body.style.transition = 'opacity .35s ease';
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = href; }, 320);
    });
  });

  /* ---------- Sliding nav underline indicator ---------- */
  const navUl = document.querySelector('.main-nav ul');
  if (navUl && window.matchMedia('(min-width: 921px)').matches) {
    const indicator = document.createElement('span');
    indicator.className = 'nav-indicator';
    navUl.appendChild(indicator);
    const links = [...navUl.querySelectorAll('a')];
    const moveTo = (el) => {
      indicator.style.left = el.offsetLeft + 'px';
      indicator.style.width = el.offsetWidth + 'px';
      indicator.style.opacity = '1';
    };
    const active = navUl.querySelector('a.active');
    if (active) moveTo(active);
    links.forEach(a => {
      a.addEventListener('mouseenter', () => moveTo(a));
    });
    navUl.addEventListener('mouseleave', () => {
      if (active) moveTo(active); else indicator.style.opacity = '0';
    });
  }

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll('[data-count-target]');
  if (counters.length && 'IntersectionObserver' in window) {
    const countIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        countIo.unobserve(el);
        const target = parseFloat(el.dataset.countTarget);
        const suffix = el.dataset.countSuffix || '';
        if (reduceMotion) { el.textContent = target + suffix; return; }
        const duration = 1400;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.round(target * eased);
          el.textContent = value + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => countIo.observe(el));
  }

  /* ---------- 3D tilt on cards ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(700px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---------- Header scroll state ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (window.scrollY > 40) header?.classList.add('is-scrolled');
    else header?.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  let scrollLockY = 0;
  const lockScroll = () => {
    scrollLockY = window.scrollY;
    document.body.classList.add('nav-locked');
    document.body.style.top = `-${scrollLockY}px`;
  };
  const unlockScroll = () => {
    document.body.classList.remove('nav-locked');
    document.body.style.top = '';
    window.scrollTo(0, scrollLockY);
  };
  toggle?.addEventListener('click', () => {
    const opening = !nav.classList.contains('is-open');
    toggle.classList.toggle('is-open');
    nav.classList.toggle('is-open');
    if (opening) lockScroll(); else unlockScroll();
  });
  nav?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle?.classList.remove('is-open');
      nav.classList.remove('is-open');
      unlockScroll();
    });
  });

  /* ---------- Duotone photos: black & white on load, colour on scroll into view ---------- */
  const duotonePhotos = document.querySelectorAll('.duotone-photo');
  if (duotonePhotos.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      duotonePhotos.forEach(el => el.classList.add('is-color'));
    } else {
      const duotoneIo = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-color');
            duotoneIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3, rootMargin: '0px 0px -10% 0px' });
      duotonePhotos.forEach(el => duotoneIo.observe(el));
    }
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-wipe, .reveal-scale');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }
  // Safety net: never let content stay invisible if something prevents the
  // intersection observer from firing (e.g. unusual local-file setups).
  setTimeout(() => revealEls.forEach(el => el.classList.add('is-visible')), 4000);

  /* ---------- Dish marquee: wait for images before animating ---------- */
  const dishMarquee = document.querySelector('.dish-marquee');
  if (dishMarquee) {
    const imgs = [...dishMarquee.querySelectorAll('img')];
    const whenLoaded = imgs.map(img => new Promise(resolve => {
      if (img.complete) { resolve(); return; }
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    }));
    const timeout = new Promise(resolve => setTimeout(resolve, 3500));
    Promise.race([Promise.all(whenLoaded), timeout]).then(() => {
      dishMarquee.classList.add('is-ready');
    });
  }

  /* ---------- Generic horizontal carousels ---------- */
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const prev = carousel.querySelector('[data-prev]');
    const next = carousel.querySelector('[data-next]');
    const scrollAmount = () => (track.querySelector('.card')?.offsetWidth || 300) + 22;
    prev?.addEventListener('click', () => track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));
  });

  /* ---------- Testimonial slider ---------- */
  const testiWrap = document.querySelector('[data-testi]');
  if (testiWrap) {
    const slides = [...testiWrap.querySelectorAll('.testi-slide')];
    const dotsWrap = testiWrap.querySelector('.testi-dots');
    let idx = 0;
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      if (i === 0) b.classList.add('is-active');
      b.addEventListener('click', () => show(i));
      dotsWrap?.appendChild(b);
    });
    const dots = dotsWrap ? [...dotsWrap.children] : [];
    function show(i) {
      slides[idx].classList.remove('is-active');
      dots[idx]?.classList.remove('is-active');
      idx = (i + slides.length) % slides.length;
      slides[idx].classList.add('is-active');
      dots[idx]?.classList.add('is-active');
    }
    let timer = setInterval(() => show(idx + 1), 6000);
    testiWrap.addEventListener('mouseenter', () => clearInterval(timer));
    testiWrap.addEventListener('mouseleave', () => { timer = setInterval(() => show(idx + 1), 6000); });
  }

  /* ---------- Menu tabs ---------- */
  const tabButtons = document.querySelectorAll('.menu-tabs button');
  const panels = document.querySelectorAll('.menu-panel');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('is-active'));
      panels.forEach(p => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      document.getElementById(btn.dataset.tab)?.classList.add('is-active');
    });
  });

  /* ---------- Contact form (real Formspree submission) ---------- */
  const form = document.getElementById('contact-form');
  if (form) {
    const success = document.querySelector('.form-success');
    const submitBtn = form.querySelector('button[type="submit"]');
    let errorBox = form.querySelector('.form-error');
    if (!errorBox) {
      errorBox = document.createElement('div');
      errorBox.className = 'form-error';
      errorBox.setAttribute('role', 'alert');
      form.appendChild(errorBox);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBox.classList.remove('is-visible');
      success?.classList.remove('is-visible');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '.6'; }

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          success?.classList.add('is-visible');
          form.reset();
          success?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          const data = await response.json().catch(() => null);
          const msg = data?.errors?.map(err => err.message).join(', ')
            || 'Something went wrong sending your enquiry. Please try again, or email us directly.';
          errorBox.textContent = msg;
          errorBox.classList.add('is-visible');
          errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (err) {
        errorBox.textContent = 'Could not reach the server. Please check your connection and try again, or email us directly.';
        errorBox.classList.add('is-visible');
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = ''; }
      }
    });
  }

});

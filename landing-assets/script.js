(() => {
  'use strict';
  const menu = document.querySelector('.mobile-menu');
  if (menu) {
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        menu.querySelector('summary').focus();
      }
    });
    document.addEventListener('pointerdown', event => {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
  }

  const progress = document.querySelector('.reading-progress span');
  let queued = false;
  function updateProgress() {
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0})`;
    queued = false;
  }
  function queueProgress() {
    if (!queued) {
      queued = true;
      requestAnimationFrame(updateProgress);
    }
  }
  addEventListener('scroll', queueProgress, { passive: true });
  addEventListener('resize', queueProgress, { passive: true });
  addEventListener('load', queueProgress, { once: true });
  updateProgress();

  if (!('IntersectionObserver' in window)) return;
  const navLinks = [...document.querySelectorAll('.main-nav a')];
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const link = navLinks.find(item => item.getAttribute('href') === `#${entry.target.id}`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach(item => item.removeAttribute('aria-current'));
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }, { rootMargin: '-17% 0px -53% 0px', threshold: 0 });
  navLinks.forEach(link => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) navObserver.observe(target);
  });

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!reducedMotion.matches && 'animate' in Element.prototype) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveal.unobserve(entry.target);
        if (reducedMotion.matches) return;
        entry.target.animate([
          { opacity: .3, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' });
      });
    }, { threshold: .08 });
    document.querySelectorAll('.understanding-image, .understanding-copy, .fertil-copy, .fertil-image, .guide-intro, .guide-topics, .about-layout > div, .section-heading, .media-item, .contact-options > div').forEach(element => reveal.observe(element));
  }
})();

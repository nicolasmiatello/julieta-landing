(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('.mobile-menu');

  if (menu) {
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => { menu.open = false; });
    });
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
  let frameQueued = false;
  function updateProgress() {
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
    if (progress) progress.style.transform = `scaleX(${percentage})`;
    frameQueued = false;
  }
  function queueProgress() {
    if (!frameQueued) {
      frameQueued = true;
      window.requestAnimationFrame(updateProgress);
    }
  }
  window.addEventListener('scroll', queueProgress, { passive: true });
  window.addEventListener('resize', queueProgress, { passive: true });
  window.addEventListener('load', queueProgress, { once: true });
  updateProgress();

  if (!('IntersectionObserver' in window)) return;

  const quickContact = document.querySelector('.mobile-contact');
  const invitations = [...document.querySelectorAll('#inicio, #contacto')];
  if (quickContact) {
    const visible = new Map(invitations.map(section => [section, false]));
    const contactObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => visible.set(entry.target, entry.isIntersecting));
      const hide = [...visible.values()].some(Boolean);
      quickContact.classList.toggle('is-hidden', hide);
      quickContact.toggleAttribute('inert', hide);
    }, { threshold: 0.06 });
    invitations.forEach(section => contactObserver.observe(section));
  }

  const links = [...document.querySelectorAll('.main-nav a')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const link = links.find(item => item.getAttribute('href') === `#${entry.target.id}`);
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach(item => item.removeAttribute('aria-current'));
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }, { rootMargin: '-17% 0px -53% 0px', threshold: 0 });
  sections.forEach(section => navObserver.observe(section));

  // Content is always readable, including when scripts or animations are unavailable.
  if (!reducedMotion.matches && 'animate' in Element.prototype) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        revealObserver.unobserve(entry.target);
        if (reducedMotion.matches) return;
        entry.target.animate([
          { opacity: 0.25, transform: 'translateY(22px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 720, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' });
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.intro-collage, .intro-content, .section-heading, .program-visual, .inclusion-item, .journey-image, .journey-steps li, .testimonial, .about-portrait, .about-content').forEach(element => revealObserver.observe(element));
  }
})();

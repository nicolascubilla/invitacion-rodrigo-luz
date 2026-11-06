(function () {
  'use strict';
  const config = window.WEDDING_CONFIG;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const setScrollPosition = position => { const scrollRoot = document.scrollingElement || document.documentElement; scrollRoot.scrollTop = position; window.scrollTo(0, position); };
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  document.documentElement.style.scrollBehavior = 'auto';
  setScrollPosition(0);

  $$('[data-bridegroom]').forEach(el => el.textContent = config.couple.bridegroom);
  $$('[data-bride]').forEach(el => el.textContent = config.couple.bride);
  $$('[data-wedding-date]').forEach(el => el.textContent = config.wedding.dateLabel);

  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.12 });
  $$('.reveal').forEach(el => observer.observe(el));

  const formatParts = date => Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: config.wedding.timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(date).filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
  const zonedDate = (value, timeZone) => { let result = new Date(value + 'Z'); for (let i = 0; i < 2; i += 1) { const parts = formatParts(result); const asUTC = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second); result = new Date(result.getTime() + Date.parse(value + 'Z') - asUTC); } return result; };
  const target = zonedDate(config.wedding.dateTime, config.wedding.timeZone);
  const countdown = $('[data-countdown]');
  const updateCountdown = () => { const remaining = target - Date.now(); if (remaining <= 0) { countdown.hidden = true; $('[data-countdown-message]').hidden = false; return; } const values = { days: Math.floor(remaining / 86400000), hours: Math.floor(remaining / 3600000) % 24, minutes: Math.floor(remaining / 60000) % 60, seconds: Math.floor(remaining / 1000) % 60 }; Object.entries(values).forEach(([unit, value]) => { $(`[data-unit="${unit}"]`).textContent = String(value).padStart(2, '0'); }); };
  updateCountdown(); window.setInterval(updateCountdown, 1000);

  $$('[data-location]').forEach(link => { const url = config.locations[link.dataset.location] || config.locations.pending; if (url) { link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; } else { link.addEventListener('click', event => { event.preventDefault(); const status = $(`[data-location-status="${link.dataset.location}"]`); status.hidden = false; }); } });

  const whatsapp = $('[data-whatsapp]');
  if (config.whatsapp.number) whatsapp.href = `https://wa.me/${config.whatsapp.number}?text=${encodeURIComponent(config.whatsapp.message)}`; else { whatsapp.classList.add('is-disabled'); whatsapp.setAttribute('aria-disabled', 'true'); whatsapp.addEventListener('click', event => event.preventDefault()); }
  const videoWhatsapp = $('[data-video-whatsapp]');
  if (config.video.number) { videoWhatsapp.href = `https://wa.me/${config.video.number}?text=${encodeURIComponent(config.video.message)}`; videoWhatsapp.target = '_blank'; videoWhatsapp.rel = 'noopener noreferrer'; }

  const petalLayer = $('[data-petal-layer]');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (let index = 0; index < 18; index += 1) {
      const petal = document.createElement('span');
      petal.className = 'petal';
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.setProperty('--fall-time', `${7 + Math.random() * 6}s`);
      petal.style.setProperty('--fall-delay', `${Math.random() * -13}s`);
      petalLayer.appendChild(petal);
    }
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const openingScreen = $('[data-welcome-screen]'); const openingBurst = $('[data-opening-burst]'); let openingTimeout; let autoScrollFrame; let autoScrolling = false;
  const createOpeningBurst = () => { if (reducedMotion) return; for (let index = 0; index < 50; index += 1) { const petal = document.createElement('span'); const angle = Math.random() * Math.PI * 2; const distance = 100 + Math.random() * 230; petal.className = `opening-petal${index % 7 === 0 ? ' opening-flower' : ''}`; if (index % 7 === 0) petal.textContent = '✦'; const spread = Math.cos(angle) * distance; petal.style.setProperty('--burst-x', `${spread}px`); petal.style.setProperty('--burst-y', `${Math.sin(angle) * distance}px`); petal.style.setProperty('--burst-drift', `${(Math.random() - .5) * 170}px`); petal.style.setProperty('--burst-delay', `${Math.random() * 220}ms`); petal.style.setProperty('--burst-rotate', `${Math.random() * 720 - 360}deg`); openingBurst.appendChild(petal); } };
  const stopAutoScroll = () => { autoScrolling = false; window.cancelAnimationFrame(autoScrollFrame); document.documentElement.classList.remove('is-auto-scrolling'); document.documentElement.style.removeProperty('scroll-behavior'); };
  const startAutoScroll = () => { if (reducedMotion) return; document.documentElement.classList.add('is-auto-scrolling'); document.documentElement.style.scrollBehavior = 'auto'; autoScrolling = true; let lastTime = performance.now(); let autoPosition = (document.scrollingElement || document.documentElement).scrollTop; const move = now => { if (!autoScrolling) return; const elapsed = Math.min(80, now - lastTime); lastTime = now; const scrollRoot = document.scrollingElement || document.documentElement; const maximum = scrollRoot.scrollHeight - window.innerHeight; autoPosition += config.experience.autoScrollSpeed * elapsed / 1000; if (autoPosition >= maximum - 1) { setScrollPosition(maximum); stopAutoScroll(); return; } setScrollPosition(autoPosition); autoScrollFrame = window.requestAnimationFrame(move); }; autoScrollFrame = window.requestAnimationFrame(move); };
  ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(eventName => window.addEventListener(eventName, stopAutoScroll, { capture: true, passive: true }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAutoScroll(); });

  const slides = $$('[data-gallery] .gallery__slide'); const galleryStage = $('[data-gallery]'); const dots = $('[data-gallery-dots]'); let activeSlide = 0; let autoGallery; let resumeGallery;
  const showSlide = index => { activeSlide = (index + slides.length) % slides.length; const distance = slides[0].offsetWidth * (window.innerWidth < 600 ? 1.04 : 1.08); slides.forEach((slide, slideIndex) => { let offset = slideIndex - activeSlide; if (offset > 2) offset -= slides.length; if (offset < -2) offset += slides.length; const scale = offset === 0 ? 1 : .82; slide.style.transform = `translateX(-50%) translateX(${offset * distance}px) rotateY(${offset * -6}deg) scale(${scale})`; slide.style.setProperty('--slide-opacity', Math.abs(offset) > 1 ? '0' : '1'); slide.style.setProperty('--slide-z', String(3 - Math.abs(offset))); slide.classList.toggle('is-active', offset === 0); }); $$('.gallery__dot', dots).forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === activeSlide)); };
  slides.forEach((_, index) => { const dot = document.createElement('button'); dot.className = `gallery__dot${index === 0 ? ' is-active' : ''}`; dot.type = 'button'; dot.setAttribute('aria-label', `Ver fotografía ${index + 1}`); dot.addEventListener('click', () => { showSlide(index); pauseGallery(); }); dots.appendChild(dot); });
  const nextSlide = () => showSlide(activeSlide + 1); const startGallery = () => { autoGallery = window.setInterval(nextSlide, 2800); }; const pauseGallery = () => { window.clearInterval(autoGallery); window.clearTimeout(resumeGallery); resumeGallery = window.setTimeout(startGallery, 4200); }; showSlide(0); startGallery();
  $('[data-gallery-next]').addEventListener('click', () => { nextSlide(); pauseGallery(); }); $('[data-gallery-prev]').addEventListener('click', () => { showSlide(activeSlide - 1); pauseGallery(); });
  let touchStart = 0; galleryStage.addEventListener('touchstart', event => { touchStart = event.changedTouches[0].clientX; pauseGallery(); }, { passive: true }); galleryStage.addEventListener('touchend', event => { const distance = event.changedTouches[0].clientX - touchStart; if (Math.abs(distance) > 40) distance < 0 ? nextSlide() : showSlide(activeSlide - 1); }, { passive: true });

  const audio = $('[data-audio]'); const musicButton = $('[data-music-toggle]'); const musicLabel = $('[data-music-label]');
  if (config.music.enabled && config.music.source) audio.src = config.music.source; else musicButton.classList.add('is-pending');
  const playMusic = () => { if (!audio.src) { musicLabel.textContent = 'Música pendiente'; return; } audio.play().then(() => { musicButton.setAttribute('aria-pressed', 'true'); musicLabel.textContent = 'Pausar'; }).catch(() => { musicLabel.textContent = 'Activar música'; }); };
  musicButton.addEventListener('click', () => { if (audio.paused) playMusic(); else { audio.pause(); musicButton.setAttribute('aria-pressed', 'false'); musicLabel.textContent = 'Música'; } });
  $('[data-open-invitation]').addEventListener('click', () => { stopAutoScroll(); document.documentElement.classList.add('is-auto-scrolling'); document.documentElement.style.scrollBehavior = 'auto'; setScrollPosition(0); playMusic(); openingScreen.classList.add('is-opening'); createOpeningBurst(); if (reducedMotion) { openingScreen.classList.add('is-open'); document.documentElement.classList.remove('is-auto-scrolling'); document.documentElement.style.removeProperty('scroll-behavior'); return; } openingTimeout = window.setTimeout(() => { openingScreen.classList.add('is-open'); window.setTimeout(() => { openingBurst.replaceChildren(); startAutoScroll(); }, 850); }, config.experience.openingDuration); });
}());

(() => {
  'use strict';

  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal content as it enters the viewport.
  const revealItems = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -45px 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Header changes from the split photographic state into the solid scrolled state.
  const header = document.querySelector('#site-header');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 85);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Full-screen navigation.
  const menu = document.querySelector('#site-menu');
  const menuToggle = document.querySelector('.menu-toggle');
  const menuClose = document.querySelector('.menu-close');
  const menuLinks = [...(menu?.querySelectorAll('a[href^="#"]') || [])];
  let previousMenuFocus = null;

  function openMenu() {
    if (!menu || !menuToggle) return;
    previousMenuFocus = document.activeElement;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Закрыть меню');
    body.classList.add('menu-open');
    window.setTimeout(() => menuClose?.focus(), 80);
  }

  function closeMenu(restoreFocus = false) {
    if (!menu || !menuToggle) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Открыть меню');
    body.classList.remove('menu-open');
    if (restoreFocus && previousMenuFocus && typeof previousMenuFocus.focus === 'function') {
      previousMenuFocus.focus({ preventScroll: true });
    }
  }

  menuToggle?.addEventListener('click', () => {
    menuToggle.getAttribute('aria-expanded') === 'true' ? closeMenu(true) : openMenu();
  });
  menuClose?.addEventListener('click', () => closeMenu(true));
  menuLinks.forEach((link) => link.addEventListener('click', () => closeMenu(false)));

  // Hero slideshow. Progress bars are animated by CSS, JS only switches slides every 6s.
  const heroSlides = [...document.querySelectorAll('.hero-slide')];
  const heroProgressItems = [...document.querySelectorAll('.hero-progress-item')];
  const heroCount = document.querySelector('.hero-count');
  let heroIndex = 0;
  let heroTimer = null;

  function showHeroSlide(index) {
    if (!heroSlides.length) return;
    heroIndex = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach((slide, i) => slide.classList.toggle('is-active', i === heroIndex));

    heroProgressItems.forEach((item, i) => {
      const active = i === heroIndex;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
      // Force the CSS keyframe to restart from 0 on the active item.
      const line = item.querySelector('span');
      if (line && active) {
        line.style.animation = 'none';
        // Reflow to apply the reset before re-adding the animation.
        void line.offsetWidth;
        line.style.animation = '';
      }
    });

    if (heroCount) {
      heroCount.innerHTML = `${String(heroIndex + 1).padStart(2, '0')} <b>/</b> ${String(heroSlides.length).padStart(2, '0')}`;
    }
  }

  function startHeroTimer() {
    if (heroTimer) window.clearInterval(heroTimer);
    heroTimer = null;
    if (!reducedMotion && heroSlides.length > 1) {
      heroTimer = window.setInterval(() => showHeroSlide(heroIndex + 1), 6000);
    }
  }

  heroProgressItems.forEach((button, index) => {
    button.addEventListener('click', () => {
      showHeroSlide(index);
      startHeroTimer();
    });
  });

  showHeroSlide(0);
  startHeroTimer();

  // Image carousels inside the three bath feature rows.
  document.querySelectorAll('[data-bath-row]').forEach((row) => {
    const slides = [...row.querySelectorAll('.bath-photo-slides img')];
    const previous = row.querySelector('.photo-prev');
    const next = row.querySelector('.photo-next');
    const counter = row.querySelector('.photo-counter');
    let current = 0;
    if (slides.length < 2) {
      if (previous) previous.hidden = true;
      if (next) next.hidden = true;
      return;
    }
    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((img, i) => img.classList.toggle('is-active', i === current));
      if (counter) {
        counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      }
    };
    previous?.addEventListener('click', () => show(current - 1));
    next?.addEventListener('click', () => show(current + 1));
    show(0);
  });

  // Procedural card carousel: every item is sourced from the published Yandex Maps service list.
  const ritualItems = [
    {
      label: '01 · ИНДИВИДУАЛЬНОЕ ПАРЕНИЕ',
      title: 'Индивидуальное<br><em>парение</em>',
      description: 'Персональная работа с паром и веником. В отзыве гость отдельно благодарит мастера Сергея за бережное и профессиональное SPA-парение.',
      price: '4 000 ₽',
      image: 'https://avatars.mds.yandex.net/get-altay/16157592/2a00000199ce7ba6e025e57f62662b2f5052/XXL_height',
      alt: 'Парение в русской бане',
      service: 'Индивидуальное парение'
    },
    {
      label: '02 · ГРУППОВОЕ ПАРЕНИЕ',
      title: 'Групповое<br><em>парение</em>',
      description: 'Банный ритуал для компании. Подробности проведения, длительность и доступные даты уточняйте перед записью.',
      price: '1 000 ₽',
      image: 'https://avatars.mds.yandex.net/get-altay/16500335/2a00000199ce7bb1566eb14e7d26adb16bab/XL',
      alt: 'Интерьер парной',
      service: 'Групповое парение'
    },
    {
      label: '03 · ВЫКАТЫВАНИЕ СОЛЬЮ',
      title: 'Выкатывание<br><em>солью</em>',
      description: 'Уходовая банная процедура, которая указана в перечне услуг «Здравой». Состав и продолжительность уточняйте у администратора.',
      price: '2 500 ₽',
      image: 'https://avatars.mds.yandex.net/get-altay/15434007/2a00000199ce7bb0cb081b2bb3509087d206/XL',
      alt: 'Интерьер небольшой бани',
      service: 'Выкатывание солью'
    },
    {
      label: '04 · ПИЛИНГИ',
      title: 'Пилинги<br><em>для тела</em>',
      description: 'Пилинги входят в опубликованный список услуг. Вид процедуры и рекомендуемый формат можно уточнить при бронировании.',
      price: '2 500 ₽',
      image: 'https://avatars.mds.yandex.net/get-altay/16166099/2a00000199ce7bb0f192fe4aaf8b60172018/XL',
      alt: 'Зона отдыха бани',
      service: 'Пилинги'
    }
  ];

  const ritualCarousel = document.querySelector('[data-ritual-carousel]');
  const ritualImage = document.querySelector('[data-ritual-image]');
  const ritualLabel = document.querySelector('[data-ritual-label]');
  const ritualTitle = document.querySelector('[data-ritual-title]');
  const ritualDescription = document.querySelector('[data-ritual-description]');
  const ritualPrice = document.querySelector('[data-ritual-price]');
  const ritualDots = [...document.querySelectorAll('.ritual-dots button')];
  const ritualPrev = ritualCarousel?.querySelector('.ritual-prev');
  const ritualNext = ritualCarousel?.querySelector('.ritual-next');
  const ritualBook = document.querySelector('[data-ritual-book]');
  let ritualIndex = 0;

  function showRitual(index) {
    if (!ritualItems.length) return;
    ritualIndex = (index + ritualItems.length) % ritualItems.length;
    const item = ritualItems[ritualIndex];

    if (ritualImage) {
      ritualImage.style.opacity = '0';
      window.setTimeout(() => {
        ritualImage.src = item.image;
        ritualImage.alt = item.alt;
        ritualImage.style.opacity = '1';
      }, reducedMotion ? 0 : 160);
    }
    if (ritualLabel) ritualLabel.textContent = item.label;
    if (ritualTitle) ritualTitle.innerHTML = item.title;
    if (ritualDescription) ritualDescription.textContent = item.description;
    if (ritualPrice) ritualPrice.textContent = item.price;

    ritualDots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === ritualIndex);
      dot.setAttribute('aria-pressed', String(i === ritualIndex));
    });

    const prevIndex = (ritualIndex - 1 + ritualItems.length) % ritualItems.length;
    const nextIndex = (ritualIndex + 1) % ritualItems.length;
    const prevImg = ritualPrev?.querySelector('img');
    const nextImg = ritualNext?.querySelector('img');
    if (prevImg) { prevImg.src = ritualItems[prevIndex].image; prevImg.alt = ritualItems[prevIndex].alt; }
    if (nextImg) { nextImg.src = ritualItems[nextIndex].image; nextImg.alt = ritualItems[nextIndex].alt; }
  }

  ritualPrev?.addEventListener('click', () => showRitual(ritualIndex - 1));
  ritualNext?.addEventListener('click', () => showRitual(ritualIndex + 1));
  ritualDots.forEach((dot, index) => dot.addEventListener('click', () => showRitual(index)));
  ritualBook?.addEventListener('click', () => {
    const form = document.querySelector('#booking-form');
    const select = form?.elements.service;
    const item = ritualItems[ritualIndex];
    if (select) select.value = item.service;
    const comment = form?.elements.comment;
    if (comment && !comment.value) comment.value = `Интересует услуга: ${item.service}.`;
    document.querySelector('#booking')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    window.setTimeout(() => form?.elements.name?.focus({ preventScroll: true }), 450);
  });
  showRitual(0);

  // Detail and privacy modal with keyboard focus management.
  const modal = document.querySelector('#info-modal');
  const modalDialog = modal?.querySelector('.modal-dialog');
  const modalTitle = document.querySelector('#modal-title');
  const modalBody = document.querySelector('#modal-body');
  const modalClose = modal?.querySelector('.modal-close');
  let lastModalFocus = null;

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function openModal(title, html) {
    if (!modal || !modalDialog || !modalTitle || !modalBody) return;
    lastModalFocus = document.activeElement;
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    body.classList.add('modal-open');
    window.setTimeout(() => modalClose?.focus(), 40);
  }

  function closeModal(restoreFocus = true) {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    body.classList.remove('modal-open');
    if (restoreFocus && lastModalFocus && typeof lastModalFocus.focus === 'function') {
      lastModalFocus.focus({ preventScroll: true });
    }
  }

  document.querySelectorAll('.js-details').forEach((button) => {
    button.addEventListener('click', () => {
      const title = button.dataset.title || 'Подробнее';
      const details = button.dataset.details || 'Подробности уточняйте у администратора.';
      openModal(title, `<p>${escapeHTML(details)}</p><p>Телефон для уточнения условий: <a href="tel:+79800254011">+7 (980) 025-40-11</a>.</p>`);
    });
  });

  document.querySelectorAll('[data-open-certificate]').forEach((button) => {
    button.addEventListener('click', () => openModal('Подарочные сертификаты', '<p>В карточке «Здравой» на Яндекс Картах отмечена возможность приобрести подарочный сертификат.</p><p>Номиналы, оформление, срок действия и способ получения необходимо уточнить у администратора: <a href="tel:+79800254011">+7 (980) 025-40-11</a>.</p>'));
  });

  document.querySelectorAll('.js-privacy').forEach((button) => {
    button.addEventListener('click', () => openModal('Политика конфиденциальности', '<p><strong>Демонстрационная политика конфиденциальности.</strong></p><p>Эта версия сайта предназначена для демонстрации. Форма не отправляет и не передаёт персональные данные на сервер: данные обрабатываются только в браузере для показа тестового сообщения.</p><p>Перед подключением реального приёма заявок владелец сайта должен указать полное наименование оператора персональных данных, ИНН, ОГРН, юридический адрес, цели и правовые основания обработки, сроки хранения, порядок отзыва согласия и контакты для обращений.</p>'));
  });
  modal?.querySelectorAll('[data-close-modal]').forEach((element) => element.addEventListener('click', () => closeModal(true)));

  // Gallery lightbox with previous/next controls.
  const galleryItems = [...document.querySelectorAll('[data-gallery-image]')];
  const lightbox = document.querySelector('#lightbox');
  const lightboxImage = document.querySelector('#lightbox-image');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');
  let galleryIndex = 0;
  let lastGalleryFocus = null;

  function showGalleryImage(index) {
    if (!galleryItems.length || !lightboxImage) return;
    galleryIndex = (index + galleryItems.length) % galleryItems.length;
    const source = galleryItems[galleryIndex].dataset.galleryImage;
    const thumb = galleryItems[galleryIndex].querySelector('img');
    lightboxImage.src = source;
    lightboxImage.alt = thumb?.alt || 'Фотография бани Здравая';
  }

  function openGallery(index) {
    if (!lightbox) return;
    lastGalleryFocus = document.activeElement;
    showGalleryImage(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    body.classList.add('lightbox-open');
    lightboxClose?.focus();
  }

  function closeGallery(restoreFocus = true) {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    body.classList.remove('lightbox-open');
    if (restoreFocus && lastGalleryFocus && typeof lastGalleryFocus.focus === 'function') {
      lastGalleryFocus.focus({ preventScroll: true });
    }
  }

  galleryItems.forEach((item, index) => item.addEventListener('click', () => openGallery(index)));
  lightboxClose?.addEventListener('click', () => closeGallery(true));
  lightboxPrev?.addEventListener('click', () => showGalleryImage(galleryIndex - 1));
  lightboxNext?.addEventListener('click', () => showGalleryImage(galleryIndex + 1));
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeGallery(true);
  });

  // Shared keyboard behavior for modal, gallery and navigation.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (modal?.classList.contains('is-open')) closeModal(true);
      if (lightbox?.classList.contains('is-open')) closeGallery(true);
      if (body.classList.contains('menu-open')) closeMenu(true);
    }
    if (event.key === 'ArrowLeft' && lightbox?.classList.contains('is-open')) showGalleryImage(galleryIndex - 1);
    if (event.key === 'ArrowRight' && lightbox?.classList.contains('is-open')) showGalleryImage(galleryIndex + 1);

    if (event.key === 'Tab' && modal?.classList.contains('is-open') && modalDialog) {
      const focusable = [...modalDialog.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
        .filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    if (event.key === 'Tab' && body.classList.contains('menu-open') && menu) {
      const focusable = [...menu.querySelectorAll('a[href],button:not([disabled])')].filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    if (event.key === 'Tab' && lightbox?.classList.contains('is-open')) {
      const controls = [lightboxClose, lightboxPrev, lightboxNext].filter((element) => element && element.offsetParent !== null);
      if (controls.length) {
        if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls[controls.length - 1].focus(); }
        else if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) { event.preventDefault(); controls[0].focus(); }
      }
    }
  });

  // Booking demo: local validation, honeypot and a 30-second browser-side cooldown.
  const bookingForm = document.querySelector('#booking-form');
  const formStatus = document.querySelector('#form-status');
  const submitButton = bookingForm?.querySelector('[type="submit"]');
  const cooldownKey = 'zdravayaDemoLastSubmit';
  const cooldownMs = 30_000;

  function digitsOnly(value) { return String(value || '').replace(/\D/g, ''); }
  function showFormMessage(message, isError = false) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.style.color = isError ? '#f0b8a9' : '#D9F1F1';
  }

  bookingForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    showFormMessage('');

    const formData = new FormData(bookingForm);
    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const phoneDigits = digitsOnly(phone);
    const consent = formData.get('consent') === 'on';
    const honeypot = String(formData.get('website') || '').trim();

    if (honeypot) {
      bookingForm.reset();
      showFormMessage('Спасибо!');
      return;
    }
    if (name.length < 2) {
      showFormMessage('Укажите имя (не менее двух символов).', true);
      bookingForm.elements.name.focus();
      return;
    }
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      showFormMessage('Проверьте номер телефона — от 10 до 15 цифр.', true);
      bookingForm.elements.phone.focus();
      return;
    }
    if (!consent) {
      showFormMessage('Необходимо согласие на обработку персональных данных.', true);
      bookingForm.elements.consent.focus();
      return;
    }

    let lastSubmit = 0;
    try { lastSubmit = Number(localStorage.getItem(cooldownKey) || 0); } catch (_) { /* storage may be unavailable */ }
    const remaining = cooldownMs - (Date.now() - lastSubmit);
    if (remaining > 0) {
      showFormMessage(`Повторный запрос можно подготовить через ${Math.ceil(remaining / 1000)} сек.`, true);
      return;
    }

    const request = {
      name,
      phone,
      service: String(formData.get('service') || ''),
      date: String(formData.get('date') || ''),
      comment: String(formData.get('comment') || '').trim()
    };

    if (submitButton) submitButton.disabled = true;
    showFormMessage('Подготавливаем демонстрационную заявку…');
    try {
      // DEMO: локальная имитация. Для реального приёма заявок замените блок на fetch('/api/booking').
      await new Promise((resolve) => window.setTimeout(resolve, 450));
      try { localStorage.setItem(cooldownKey, String(Date.now())); } catch (_) { /* browser storage may be disabled */ }
      bookingForm.reset();
      showFormMessage(`Спасибо, ${request.name}! Это демо-заявка: для подтверждения позвоните +7 (980) 025-40-11.`);
    } catch (error) {
      console.error('Booking demo error:', error);
      showFormMessage('Не удалось подготовить запрос. Позвоните администратору.', true);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });

  // Steam layer: lightweight soft puffs, moving with the scroll direction and velocity.
  const steamZones = [...document.querySelectorAll('.steam-zone')];
  if (!reducedMotion && steamZones.length && 'IntersectionObserver' in window) {
    let scrollDirection = -1;
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;
    let decayTimer = null;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      const delta = y - lastScrollY;
      scrollDirection = delta >= 0 ? -1 : 1;
      scrollVelocity = Math.min(1, Math.abs(delta) / 30);
      lastScrollY = y;
      if (decayTimer) window.clearTimeout(decayTimer);
      decayTimer = window.setTimeout(() => { scrollVelocity = 0; }, 180);
    }, { passive: true });

    const states = [];
    steamZones.forEach((zone) => {
      const canvas = zone.querySelector('.steam-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;
      const state = { zone, canvas, ctx, active: false, width: 1, height: 1, puffs: [], raf: 0 };
      states.push(state);

      state.resize = () => {
        const rect = zone.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 1.4);
        state.width = Math.max(1, rect.width);
        state.height = Math.max(1, rect.height);
        canvas.width = Math.round(state.width * dpr);
        canvas.height = Math.round(state.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        state.puffs = Array.from({ length: Math.max(6, Math.min(14, Math.round(state.width / 75))) }, () => makePuff(state));
      };
      state.resize();
    });

    function makePuff(state) {
      return {
        x: Math.random() * state.width,
        y: state.height * (.3 + Math.random() * .8),
        radius: 24 + Math.random() * 66,
        alpha: .016 + Math.random() * .028,
        drift: (Math.random() - .5) * .22,
        rise: .12 + Math.random() * .27,
        phase: Math.random() * Math.PI * 2
      };
    }

    function drawSteam(state) {
      if (!state.active || !state.width || !state.height) return;
      const { ctx, width, height, puffs } = state;
      ctx.clearRect(0, 0, width, height);
      const movement = .1 + scrollVelocity * .8;
      puffs.forEach((puff) => {
        puff.phase += .006;
        puff.x += puff.drift + scrollDirection * movement * .16;
        puff.y -= puff.rise + scrollVelocity * .1;
        if (puff.y < -puff.radius * 2) { puff.y = height + puff.radius; puff.x = Math.random() * width; }
        if (puff.x < -puff.radius * 2) puff.x = width + puff.radius;
        if (puff.x > width + puff.radius * 2) puff.x = -puff.radius;
        const x = puff.x + Math.sin(puff.phase) * 10;
        const gradient = ctx.createRadialGradient(x, puff.y, 1, x, puff.y, puff.radius);
        gradient.addColorStop(0, `rgba(240,254,255,${puff.alpha * (1 + scrollVelocity * .45)})`);
        gradient.addColorStop(.48, `rgba(240,254,255,${puff.alpha * .36})`);
        gradient.addColorStop(1, 'rgba(240,254,255,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, puff.y, puff.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      state.raf = window.requestAnimationFrame(() => drawSteam(state));
    }

    const steamObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const state = states.find((item) => item.zone === entry.target);
        if (!state) return;
        state.active = entry.isIntersecting;
        if (state.active && !state.raf) state.raf = window.requestAnimationFrame(() => drawSteam(state));
        if (!state.active && state.raf) {
          window.cancelAnimationFrame(state.raf);
          state.raf = 0;
          state.ctx.clearRect(0, 0, state.width, state.height);
        }
      });
    }, { threshold: 0.04 });
    states.forEach((state) => steamObserver.observe(state.zone));

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(() => states.forEach((state) => state.resize()));
      states.forEach((state) => resizeObserver.observe(state.zone));
    } else {
      window.addEventListener('resize', () => states.forEach((state) => state.resize()), { passive: true });
    }
  }

  // Dynamic footer year.
  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
'use strict';

class PhysicsRequest {
  constructor({ name, email, topic, message, consent }) {
    this.name = name;
    this.email = email;
    this.topic = topic;
    this.message = message;
    this.consent = Boolean(consent);
    this.createdAt = new Date();
  }

  printToConsole() {
    const date = new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'long',
      timeStyle: 'medium'
    }).format(this.createdAt);

    const formattedOutput = [
      'НОВОЕ СООБЩЕНИЕ - «ФИЗИКА СЕГОДНЯ»',
      `Имя:        ${this.name}`,
      `Email:      ${this.email}`,
      `Тема:       ${this.topic}`,
      `Сообщение:  ${this.message}`,
      `Согласие:   ${this.consent ? 'получено' : 'не получено'}`,
      `Создано:    ${date}`,
    ].join('\n');

    console.log(formattedOutput);
  }
}

const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);

    const request = new PhysicsRequest({
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      topic: String(formData.get('topic') || ''),
      message: String(formData.get('message') || '').trim(),
      consent: formData.get('consent') === 'yes'
    });

    request.printToConsole();
    contactForm.reset();
  });
}

const hasRevealContent = document.querySelector('.hero, .facts-grid');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (hasRevealContent && !prefersReducedMotion) {
  const revealSelectors = [
    '.site-header',
    '.hero__content',
    '.hero__visual',
    '.page-hero > *',
    '.section--news > .section-heading',
    '.news-list .news-card',
    '.section--tight > .section-heading .eyebrow',
    '.section--tight > .section-heading .section-heading__title',
    '.facts-grid .fact-card',
    '.planets-section > .section-heading .eyebrow',
    '.planets-section > .section-heading .section-heading__title',
    '.table-wrap',
    '.planets-table thead',
    '.planets-table tbody tr',
    '.feature-band__inner > *',
    '.cosmos-callout',
    '.site-footer'
  ];

  const revealElements = Array.from(
    new Set(revealSelectors.flatMap((selector) => Array.from(document.querySelectorAll(selector))))
  ).sort((a, b) => {
    const position = a.compareDocumentPosition(b);
    return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });

  revealElements.forEach((element) => {
    element.classList.add('reveal-item');
    if (element.closest('.planets-table')) {
      element.classList.add('reveal-item--table');
    }
  });

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach((element, index) => {
      window.setTimeout(() => element.classList.add('is-visible'), 100 + index * 150);
    });
  } else {
    const initiallyVisible = [];
    const belowFold = [];
    const initialViewportLimit = window.innerHeight * 0.92;

    revealElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < initialViewportLimit) {
        initiallyVisible.push(element);
      } else {
        belowFold.push(element);
      }
    });

    let initialRevealDelay = 120;
    initiallyVisible.forEach((element) => {
      window.setTimeout(() => element.classList.add('is-visible'), initialRevealDelay);
      initialRevealDelay += element.closest('.planets-table') ? 75 : 155;
    });

    let scrollRevealDelay = 0;
    let lastScrollRevealTime = 0;

    const revealObserver = new IntersectionObserver((entries) => {
      const entering = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (entering.length === 0) return;

      const now = performance.now();
      if (now - lastScrollRevealTime > 500) scrollRevealDelay = 0;

      entering.forEach((entry) => {
        revealObserver.unobserve(entry.target);
        const delay = scrollRevealDelay;
        window.setTimeout(() => entry.target.classList.add('is-visible'), delay);
        scrollRevealDelay += entry.target.closest('.planets-table') ? 75 : 155;
      });

      lastScrollRevealTime = now;
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px 65px 0px'
    });

    belowFold.forEach((element) => revealObserver.observe(element));
  }
}

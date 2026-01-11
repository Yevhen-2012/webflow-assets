"use strict";
console.log("asdasdasd");
window.Webflow ||= [];
window.Webflow.push(() => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP/ScrollTrigger ще не готові");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

(() => {
  const burger = document.querySelector('.nav_menu-burger');
  const panel  = document.querySelector('.nav-wraper');
  const items  = panel ? panel.querySelectorAll('.nav-link-text') : null;
  if (!burger || !panel) { console.warn('Нет .nav_menu-burger или .nav-wraper'); return; }

  let isOpen = false;

  // стартовые состояния
  gsap.set(panel, { x: '100%', opacity: 0 });
  if (items && items.length){
    gsap.set(items, { yPercent: 200, opacity: 0 });
  }

  // таймлайн: панель → затем пункты (со стаггером)
  const tl = gsap.timeline({ paused: true });
  tl.to(panel, { x: '0%', opacity: 1, duration: 0.5, ease: 'power3.out' })
    .to(items, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.06 }, "-=0.2");

  function openMenu(){
    if (isOpen) return;
    isOpen = true;
    document.documentElement.classList.add('menu-open');
    document.body.classList.add('menu-open');
    tl.play(0);
  }

  function closeMenu(){
    if (!isOpen) return;
    isOpen = false;
    document.documentElement.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
    tl.reverse();
  }

  // когда закрытие полностью завершилось — вернуть стартовые значения на всякий
  tl.eventCallback('onReverseComplete', () => {
    gsap.set(panel, { x: '100%', opacity: 0 });
    if (items && items.length){
      gsap.set(items, { yPercent: 200, opacity: 0 });
    }
  });

  // ✅ OUTSIDE CLICK CLOSE
  function onOutsidePointerDown(e){
    if (!isOpen) return;
    // если клик по бургеру или внутри панели — игнорируем
    if (burger.contains(e.target) || panel.contains(e.target)) return;
    closeMenu();
  }

  // клик по бургеру
  burger.addEventListener('click', (e) => {
    e.stopPropagation(); // важно, чтобы не сработал outside
    (isOpen ? closeMenu() : openMenu());
  });

  // клики внутри панели: закрываем только по ссылкам (как было)
  panel.addEventListener('click', e => { if (e.target.closest('.nav-link')) closeMenu(); });

  // закрытие кликом/тапом вне меню
  document.addEventListener('pointerdown', onOutsidePointerDown, { passive: true });

  // Escape
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // страховка при ресайзе
  window.addEventListener('resize', () => {
    if (!isOpen){
      gsap.set(panel, { x: '100%', opacity: 0 });
      if (items && items.length){
        gsap.set(items, { yPercent: 200, opacity: 0 });
      }
    }
  });
})();

(() => {
  const burger = document.querySelector('.nav_menu-burger');
  if (!burger) return;

  // нижняя полоска: последняя с классом .nav_burger-item.short
  const bottomLine = burger.querySelector('.nav_burger-item.short:last-child');
  if (!bottomLine) return;

  // стартовое состояние 50%
  gsap.set(bottomLine, { width: '50%' });

  const hoverIn  = () => gsap.to(bottomLine, { width: '100%', duration: 0.25, ease: 'bounce.out' });
  const hoverOut = () => gsap.to(bottomLine, { width:  '50%', duration: 0.25, ease: 'bounce.out'  });

  burger.addEventListener('mouseenter', hoverIn);
  burger.addEventListener('mouseleave', hoverOut);
  // для клавиатуры
  burger.addEventListener('focusin',  hoverIn);
  burger.addEventListener('focusout', hoverOut);
})();



(() => {
    const wrap  = document.querySelector('.section_products-wraper');
    const cards = gsap.utils.toArray('.section_products-card');
    if (!wrap || !cards.length) return;
  
    // равные доли (проценты через flex-basis)
    const base = 100 / cards.length;
    const expanded = 50;                                // активная, %
    const rest = (100 - expanded) / (cards.length - 1);
  
    // базовые состояния
    gsap.set(cards, { flexGrow: 0, flexShrink: 0, flexBasis: base + '%', minWidth: 0 });
    gsap.set('.button-main-card', { autoAlpha: 0, y: 8, pointerEvents: 'none' }); // кнопки скрыты
  
    let hoverDelay = null;
    let resetDelay = null;
    let activeCard = null;
  
    const isDesktop = () => !window.matchMedia('(max-width: 991px)').matches;
  
    function killTimers(){
      if (hoverDelay) { hoverDelay.kill(); hoverDelay = null; }
      if (resetDelay) { resetDelay.kill(); resetDelay = null; }
    }
  
    function showButtonIn(card){
      const btn = card.querySelector('.button-main-card');
      if (!btn) return;
      gsap.to(btn, {
        autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out', delay: 0.15,
        onStart(){ btn.style.pointerEvents = 'auto'; }
      });
    }
    function hideButtonIn(card){
      const btn = card.querySelector('.button-main-card');
      if (!btn) return;
      gsap.to(btn, {
        autoAlpha: 0, y: 8, duration: 0.25, ease: 'power2.in',
        onComplete(){ btn.style.pointerEvents = 'none'; }
      });
    }
  
    function expand(target){
      activeCard = target;
      cards.forEach(card => {
        gsap.to(card, {
          flexBasis: (card === target ? expanded : rest) + '%',
          duration: 0.8,
          ease: 'power3.out'
        });
        // кнопка: у активной показать, у остальных скрыть
        if (card === target) showButtonIn(card); else hideButtonIn(card);
      });
    }
  
    function reset(){
      activeCard = null;
      gsap.to(cards, { flexBasis: base + '%', duration: 0.6, ease: 'power3.inOut' });
      // спрятать все кнопки
      cards.forEach(hideButtonIn);
    }
  
    function onEnter(card){
      if (!isDesktop()) return;
      killTimers();
      hoverDelay = gsap.delayedCall(0.2, () => expand(card)); // задержка 0.2 c
    }
    function onLeaveCard(){
      if (!isDesktop()) return;
      killTimers();
      // если ушли в «зазор» и не зашли на другую — мягкий сброс
      resetDelay = gsap.delayedCall(0.1, () => {
        if (!wrap.matches(':hover')) reset();
        else if (!activeCard) reset();
      });
    }
    function onLeaveWrap(){
      if (!isDesktop()) return;
      killTimers();
      reset();
    }
  
    cards.forEach(card => {
      card.addEventListener('pointerenter', () => onEnter(card));
      card.addEventListener('pointerleave', onLeaveCard);
    });
    wrap.addEventListener('pointerleave', onLeaveWrap);
  
    // страховки
    window.addEventListener('resize', () => { killTimers(); reset(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden){ killTimers(); reset(); }});
  })();





// фильтр продуктов мобильный выцпадающий

(() => {
  // контейнер одного выпадающего фильтра (чтобы работало даже если будет несколько)
  document.querySelectorAll('.filter_block-mobile').forEach((wrap) => {
    const toggle = wrap.querySelector('.filter_dd_toggle');
    const label  = wrap.querySelector('.filter_dropdown_label') || wrap.querySelector('.filter_dd_label');
    const list   = wrap.querySelector('.filter_list-2');

    if (!toggle || !label || !list) return;

    // старт: закрыто
    function open() {
      list.classList.remove('is-collapsed');
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }
    function close() {
      list.classList.add('is-collapsed');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    function isOpen() {
      return !list.classList.contains('is-collapsed');
    }

    close();

    // ARIA
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');
    toggle.setAttribute('aria-expanded', 'false');

    // 1) Открываем/закрываем ТОЛЬКО по клику на "шапку" (лейбл/иконка)
    // Чтобы клики по форме и радиокнопкам не тогглили
    const headerClickTargets = [
      '.filter_dd_label',
      '.filter_dropdown_label',
      '.filter_dropdown_icon'
    ];

    toggle.addEventListener('click', (e) => {
      const clickedHeader = headerClickTargets.some(sel => e.target.closest(sel));
      if (!clickedHeader) return;

      e.preventDefault();
      e.stopPropagation();
      isOpen() ? close() : open();
    });

    // keyboard
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        isOpen() ? close() : open();
      }
      if (e.key === 'Escape') close();
    });

    // 2) Клик по опции: включаем radio, обновляем лейбл, закрываем
    wrap.querySelectorAll('.radio_field').forEach((field) => {
      field.addEventListener('click', () => {
        const input = field.querySelector('input[type="radio"]');
        if (input && !input.checked) input.click(); // важно для Finsweet

        // как достать текст из radio_field (попробуем несколько вариантов)
        const textEl =
          field.querySelector('.w-form-label') ||
          field.querySelector('label') ||
          field.querySelector('div, span, p');

        const text = (textEl?.textContent || '').trim();
        if (text) label.textContent = text;

        close();
      });
    });

    // 3) Закрываем по клику вне блока
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) close();
    });

    // 4) Стартовый текст: если что-то уже checked
    const checked = wrap.querySelector('.radio_field input[type="radio"]:checked');
    if (checked) {
      const field = checked.closest('.radio_field');
      const textEl =
        field?.querySelector('.w-form-label') ||
        field?.querySelector('label') ||
        field?.querySelector('div, span, p');

      const text = (textEl?.textContent || '').trim();
      if (text) label.textContent = text;
    }
  });
})();




// Accordion

const SINGLE_OPEN = true;   // тільки один відкритий
const DURATION = 0.5;       // швидкість анімації
const PEEK_LINES = 1;       // скільки рядків показувати в закритому стані

function debounce(fn, wait = 150) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); };
}

function initAccordion() {
  if (typeof gsap === "undefined") {
    console.warn("GSAP не знайдено (accordion)");
    return;
  }

  const rows = gsap.utils.toArray('.row-wraper, .row-wrapper');
  if (!rows.length) {
    console.warn("Accordion: не знайдено .row-wraper/.row-wrapper");
    return;
  }

  rows.forEach((row) => {
    const trigger = row.querySelector('.col-2-text') || row.querySelector('.col2-item');
    const panel   = row.querySelector('.col3-item');
    if (!trigger || !panel) return;

    // обгортка для контенту
    let inner = panel.querySelector('.col3-panel-inner');
    if (!inner) {
      inner = document.createElement('div');
      inner.className = 'col3-panel-inner';
      while (panel.firstChild) inner.appendChild(panel.firstChild);
      panel.appendChild(inner);
    }

    function getLineHeight(el) {
      const cs = getComputedStyle(el);
      let lh = parseFloat(cs.lineHeight);
      if (isNaN(lh)) {
        const fontSize = parseFloat(cs.fontSize) || 16;
        lh = Math.round(fontSize * 1.2);
      }
      return lh;
    }

    const firstTextEl = inner.querySelector('p, li, span, div, h1, h2, h3, h4, h5, h6') || inner;

    function computeCollapsedHeight() {
      const lh = getLineHeight(firstTextEl);
      const csPanel = getComputedStyle(panel);
      const padY = (parseFloat(csPanel.paddingTop) || 0) + (parseFloat(csPanel.paddingBottom) || 0);
      return Math.ceil(lh * PEEK_LINES + padY);
    }

    // стартовий стан
    row._acc = row._acc || {};
    row._acc.collapsedH = computeCollapsedHeight();

    gsap.set(panel, { display: 'block', overflow: 'hidden', height: row._acc.collapsedH });

    row._acc.open = false;
    row.classList.remove('is-open');

    trigger.style.cursor = 'pointer';

    trigger.addEventListener('click', (e) => {
      // якщо всередині тригера є <a>, інколи він “з’їдає” клік
      if (e.target.closest('a')) e.preventDefault();

      if (SINGLE_OPEN) {
        rows.forEach(r => {
          if (r !== row && r._acc?.open) {
            gsap.to(r._acc.panel, { height: r._acc.collapsedH, duration: DURATION, ease: 'power2.inOut' });
            r._acc.open = false;
            r.classList.remove('is-open');
          }
        });
      }

      if (!row._acc.open) {
        // відкрити
        row._acc.panel = panel;
        gsap.to(panel, { height: 'auto', duration: DURATION, ease: 'power2.out' });
        row._acc.open = true;
        row.classList.add('is-open');
      } else {
        // закрити до peek
        gsap.to(panel, { height: row._acc.collapsedH, duration: DURATION, ease: 'power2.inOut' });
        row._acc.open = false;
        row.classList.remove('is-open');
      }
    });

    row._acc.panel = panel;
  });

  // ресайз: перерахувати peek
  window.addEventListener('resize', debounce(() => {
    rows.forEach(r => {
      if (!r._acc?.panel) return;

      const panel = r._acc.panel;
      const inner = panel.querySelector('.col3-panel-inner') || panel;

      const firstTextEl = inner.querySelector('p, li, span, div, h1, h2, h3, h4, h5, h6') || inner;

      const cs = getComputedStyle(firstTextEl);
      let lh = parseFloat(cs.lineHeight);
      if (isNaN(lh)) lh = Math.round((parseFloat(cs.fontSize) || 16) * 1.2);

      const csPanel = getComputedStyle(panel);
      const padY = (parseFloat(csPanel.paddingTop) || 0) + (parseFloat(csPanel.paddingBottom) || 0);

      r._acc.collapsedH = Math.ceil(lh * PEEK_LINES + padY);

      if (r._acc.open) gsap.set(panel, { height: 'auto' });
      else gsap.set(panel, { height: r._acc.collapsedH });
    });
  }, 150));
}

// ✅ Webflow-safe init
window.Webflow ||= [];
window.Webflow.push(initAccordion);


// анімація скроллу 

(() => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  const containers = gsap.utils.toArray('.container');
  if (!containers.length) return;

  function getStart(container) {
    const vh = window.innerHeight;
    const h  = container.offsetHeight;

    // великий контейнер
    if (h > vh * 0.9) return "top 90%";

    // середній
    if (h > vh * 0.5) return "top 85%";

    // маленький
    return "top 75%";
  }

  containers.forEach((container, index) => {
    // ❌ пропускаємо перший container (hero)
    if (index === 0) {
      gsap.set(container, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      container,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: container,
          start: getStart(container),
          toggleActions: "play none none none",
          once: true,
          invalidateOnRefresh: true
        }
      }
    );
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();


  
});

"use strict";

// Глобальный ловец обычных JS-ошибок
window.addEventListener("error", (e) => {
  console.error("GLOBAL ERROR:", e.message, e.filename, e.lineno);
});

// Глобальный ловец ошибок промисов
window.addEventListener("unhandledrejection", (e) => {
  console.error("PROMISE ERROR:", e.reason);
});

// ======================================================
// ОСНОВНОЙ БЛОК ИНИЦИАЛИЗАЦИИ САЙТОВЫХ АНИМАЦИЙ И UI
// ======================================================

window.Webflow ||= [];
window.Webflow.push(() => {
  // Защита от повторной инициализации всего блока
  if (window.__siteAnimationsInitialized) return;
  window.__siteAnimationsInitialized = true;

  // Проверяем наличие GSAP и ScrollTrigger
  const hasGSAP = typeof gsap !== "undefined";
  const hasScrollTrigger = typeof ScrollTrigger !== "undefined";

  if (hasGSAP && hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Все используемые селекторы в одном месте
  const SELECTORS = {
    burger: ".nav_menu-burger",
    navPanel: ".nav-wraper",
    navItemText: ".nav-link-text",
    navLink: ".nav-link",
    burgerBottomLine: ".nav_burger-item.short:last-child",

    mobileFilterWrap: ".filter_block-mobile",
    mobileFilterToggle: ".filter_dd_toggle",
    mobileFilterLabel: ".filter_dropdown_label, .filter_dd_label",
    mobileFilterList: ".filter_list-2",
    mobileFilterField: ".radio_field",

    accordionRow: ".row-wraper, .row-wrapper",
    accordionTrigger: ".col-2-text, .col2-item",
    accordionPanel: ".col3-item",

    productCard: ".section_products-grid-card",
    productButton: ".button-main_btn",
    productButtonArrow: ".awesome-arrow",
    blurLayer: ".blur_layer",
    verticalLine: ".vertical-line",
    hiddenText: ".hidden-text",

    // Элементы для filter by link / scroll reveal
    revealItem: ".cc-reveal",
    filterRadioField: ".radio_field"
  };

  // Конфиг с общими настройками
  const CONFIG = {
    accordionSingleOpen: true,
    accordionDuration: 0.5,
    accordionPeekLines: 1,
    desktopMin: 992,
    filterInitDelay: 300
  };

  // Debounce для resize и прочих частых событий
  function debounce(fn, wait = 150) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  }

  // Получение текста из поля фильтра
  function getTextFromField(field) {
    const textEl =
      field?.querySelector(".w-form-label") ||
      field?.querySelector("label") ||
      field?.querySelector("div, span, p");

    return (textEl?.textContent || "").trim();
  }

  // ======================================================
  // ФИЛЬТР ПО ССЫЛКЕ
  // ======================================================
  // Считывает параметр category из URL
  // Пример: ?category=Kitchen
  // Находит нужный .radio_field по data-category
  // И программно активирует соответствующий radio input
  function initFilterByLink() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");

    // Если category нет в URL, ничего не делаем
    if (!category) return;

    // Ищем нужное поле по data-category
    const targetField = document.querySelector(
      `${SELECTORS.filterRadioField}[data-category="${category}"]`
    );
    if (!targetField) return;

    // Ищем radio внутри найденного поля
    const targetInput = targetField.querySelector('input[type="radio"]');
    if (!targetInput) return;

    // Даём Webflow / Finsweet / DOM немного времени на инициализацию
    setTimeout(() => {
      targetInput.checked = true;
      targetInput.dispatchEvent(new Event("change", { bubbles: true }));
      targetInput.dispatchEvent(new Event("input", { bubbles: true }));
      targetInput.click();
    }, CONFIG.filterInitDelay);
  }

  // ======================================================
  // SCROLL REVEAL
  // ======================================================
  // Анимация появления элементов с классом .cc-reveal при скролле
  function initScrollReveal() {
    // Проверяем, доступны ли GSAP и ScrollTrigger
    if (!hasGSAP || !hasScrollTrigger) {
      console.warn("GSAP или ScrollTrigger не найден");
      return;
    }

    // Берём только те элементы, которые ещё не были инициализированы
    const items = document.querySelectorAll(
      `${SELECTORS.revealItem}:not([data-reveal-init])`
    );
    if (!items.length) return;

    items.forEach((item) => {
      // Помечаем элемент как инициализированный
      item.setAttribute("data-reveal-init", "true");

      // Начальное состояние до появления
      gsap.set(item, {
        opacity: 0,
        y: 40,
        filter: "blur(8px)",
        willChange: "transform, opacity, filter"
      });

      // Анимация появления
      gsap.to(item, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power2.out",
        clearProps: "willChange,filter",
        scrollTrigger: {
          trigger: item,
          start: "top 85%",
          toggleActions: "play none none none",
          once: true
        }
      });
    });
  }

  // ======================================================
  // HOVER СТРЕЛКИ В КНОПКЕ КАРТОЧКИ ТОВАРА
  // ======================================================
  function initProductButtonArrowHover() {
    if (!hasGSAP) return;

    const buttons = document.querySelectorAll(
      `${SELECTORS.productCard} ${SELECTORS.productButton}`
    );
    if (!buttons.length) return;

    buttons.forEach((button) => {
      // Защита от повторной инициализации
      if (button.dataset.arrowHoverInit === "true") return;
      button.dataset.arrowHoverInit = "true";

      const arrow = button.querySelector(SELECTORS.productButtonArrow);
      if (!arrow) return;

      // Начальная позиция стрелки
      gsap.set(arrow, { x: 0 });

      // Наведение
      const onEnter = () => {
        gsap.to(arrow, {
          x: 10,
          duration: 0.3,
          ease: "bounce.out",
          overwrite: "auto"
        });
      };

      // Уход курсора
      const onLeave = () => {
        gsap.to(arrow, {
          x: 0,
          duration: 0.3,
          ease: "bounce.out",
          overwrite: "auto"
        });
      };

      button.addEventListener("mouseenter", onEnter);
      button.addEventListener("mouseleave", onLeave);
    });
  }

  // ======================================================
  // HOVER АНИМАЦИЯ КАРТОЧКИ ТОВАРА
  // ======================================================
  function initProductCardHover() {
    if (!hasGSAP) {
      console.warn("GSAP не найден");
      return;
    }

    const mm = gsap.matchMedia();

    // Анимации только на desktop
    mm.add(`(min-width: ${CONFIG.desktopMin}px)`, () => {
      const cards = document.querySelectorAll(SELECTORS.productCard);
      if (!cards.length) return;

      const cleanups = [];

      cards.forEach((card) => {
        const blurLayer = card.querySelector(SELECTORS.blurLayer);
        const verticalLine = card.querySelector(SELECTORS.verticalLine);
        const hiddenText = card.querySelector(SELECTORS.hiddenText);

        if (!blurLayer || !verticalLine || !hiddenText) return;
        if (card.dataset.hoverInit === "true") return;
        card.dataset.hoverInit = "true";

        // Начальные состояния элементов
        gsap.set(blurLayer, {
          opacity: 0,
          scale: 1.03,
          pointerEvents: "none"
        });

        gsap.set(verticalLine, {
          rotate: 0,
          height: "3rem",
          x: 0,
          transformOrigin: "50% 50%"
        });

        gsap.set(hiddenText, {
          opacity: 0,
          x: 0,
          y: 0
        });

        // Сдвиг линии к центру карточки
        function getLineShiftToCenter() {
          const cardRect = card.getBoundingClientRect();
          const lineRect = verticalLine.getBoundingClientRect();

          const cardCenter = cardRect.left + cardRect.width / 2;
          const lineCenter = lineRect.left + lineRect.width / 2;

          return cardCenter - lineCenter;
        }

        // Сдвиг текста к центру карточки
        function getTextShiftToCenter() {
          const cardRect = card.getBoundingClientRect();
          const textRect = hiddenText.getBoundingClientRect();

          const cardCenter = cardRect.left + cardRect.width / 2;
          const textCenter = textRect.left + textRect.width / 2;

          return cardCenter - textCenter;
        }

        // Основной timeline hover-анимации
        const tl = gsap.timeline({ paused: true });

        tl.to(
          blurLayer,
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power2.out",
            overwrite: "auto"
          },
          0
        );

        tl.to(
          verticalLine,
          {
            rotate: 90,
            height: "10rem",
            x: () => getLineShiftToCenter(),
            duration: 0.9,
            ease: "back.out(1.7)",
            overwrite: "auto"
          },
          0
        );

        tl.to(
          hiddenText,
          {
            opacity: 1,
            x: () => getTextShiftToCenter(),
            y: -20,
            duration: 0.6,
            ease: "power2.out",
            overwrite: "auto"
          },
          0.15
        );

        const onEnter = () => tl.play();
        const onLeave = () => tl.reverse();

        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mouseleave", onLeave);

        // Cleanup для matchMedia
        cleanups.push(() => {
          card.removeEventListener("mouseenter", onEnter);
          card.removeEventListener("mouseleave", onLeave);
          delete card.dataset.hoverInit;
        });
      });

      return () => {
        cleanups.forEach((fn) => fn());
      };
    });

    // Сброс состояний на mobile/tablet
    mm.add(`(max-width: ${CONFIG.desktopMin - 1}px)`, () => {
      const cards = document.querySelectorAll(SELECTORS.productCard);

      cards.forEach((card) => {
        const blurLayer = card.querySelector(SELECTORS.blurLayer);
        const verticalLine = card.querySelector(SELECTORS.verticalLine);
        const hiddenText = card.querySelector(SELECTORS.hiddenText);

        if (blurLayer) {
          gsap.set(blurLayer, {
            clearProps: "all",
            opacity: 1,
            scale: 1
          });
        }

        if (verticalLine) {
          gsap.set(verticalLine, {
            clearProps: "all",
            rotate: 0,
            height: "3rem",
            x: 0
          });
        }

        if (hiddenText) {
          gsap.set(hiddenText, {
            clearProps: "all",
            opacity: 1,
            x: 0,
            y: 0
          });
        }

        delete card.dataset.hoverInit;
      });
    });
  }

  // ======================================================
  // МОБИЛЬНОЕ / BURGER MENU
  // ======================================================
  function initNavMenu() {
    if (!hasGSAP) return;

    const burger = document.querySelector(SELECTORS.burger);
    const panel = document.querySelector(SELECTORS.navPanel);

    if (!burger || !panel) {
      console.warn("Nav: не знайдено burger або panel");
      return;
    }

    if (burger.dataset.navInit === "true") return;
    burger.dataset.navInit = "true";

    const items = panel.querySelectorAll(SELECTORS.navItemText);
    let isOpen = false;

    // Начальное закрытое состояние
    gsap.set(panel, { x: "100%", opacity: 0 });
    if (items.length) {
      gsap.set(items, { yPercent: 200, opacity: 0 });
    }

    const tl = gsap.timeline({ paused: true });

    // Выезд панели
    tl.to(panel, {
      x: "0%",
      opacity: 1,
      duration: 0.5,
      ease: "power3.out"
    });

    // Появление пунктов меню
    if (items.length) {
      tl.to(
        items,
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.06
        },
        "-=0.2"
      );
    }

    // Жёсткая синхронизация закрытого состояния
    function syncClosedState() {
      gsap.set(panel, { x: "100%", opacity: 0 });
      if (items.length) {
        gsap.set(items, { yPercent: 200, opacity: 0 });
      }
    }

    function openMenu() {
      if (isOpen) return;
      isOpen = true;
      document.documentElement.classList.add("menu-open");
      document.body.classList.add("menu-open");
      tl.play(0);
    }

    function closeMenu() {
      if (!isOpen) return;
      isOpen = false;
      document.documentElement.classList.remove("menu-open");
      document.body.classList.remove("menu-open");
      tl.reverse();
    }

    tl.eventCallback("onReverseComplete", syncClosedState);

    // Клик по burger
    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      isOpen ? closeMenu() : openMenu();
    });

    // Закрытие по клику на ссылку внутри панели
    panel.addEventListener("click", (e) => {
      if (e.target.closest(SELECTORS.navLink)) {
        closeMenu();
      }
    });

    // Закрытие по клику вне панели
    document.addEventListener(
      "pointerdown",
      (e) => {
        if (!isOpen) return;
        if (burger.contains(e.target) || panel.contains(e.target)) return;
        closeMenu();
      },
      { passive: true }
    );

    // Закрытие по Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // При resize, если меню закрыто, синхронизируем состояние
    window.addEventListener(
      "resize",
      debounce(() => {
        if (!isOpen) syncClosedState();
      }, 120)
    );
  }

  // ======================================================
  // HOVER НИЖНЕЙ ЛИНИИ BURGER
  // ======================================================
  function initBurgerHover() {
    if (!hasGSAP) return;

    const burger = document.querySelector(SELECTORS.burger);
    if (!burger) return;

    if (burger.dataset.burgerHoverInit === "true") return;
    burger.dataset.burgerHoverInit = "true";

    const bottomLine = burger.querySelector(SELECTORS.burgerBottomLine);
    if (!bottomLine) return;

    gsap.set(bottomLine, { width: "50%" });

    const hoverIn = () =>
      gsap.to(bottomLine, {
        width: "100%",
        duration: 0.25,
        ease: "bounce.out",
        overwrite: "auto"
      });

    const hoverOut = () =>
      gsap.to(bottomLine, {
        width: "50%",
        duration: 0.25,
        ease: "bounce.out",
        overwrite: "auto"
      });

    burger.addEventListener("mouseenter", hoverIn);
    burger.addEventListener("mouseleave", hoverOut);
    burger.addEventListener("focusin", hoverIn);
    burger.addEventListener("focusout", hoverOut);
  }

  // ======================================================
  // МОБИЛЬНЫЙ ФИЛЬТР
  // ======================================================
  function initMobileFilters() {
    const wraps = document.querySelectorAll(SELECTORS.mobileFilterWrap);
    if (!wraps.length) return;

    wraps.forEach((wrap) => {
      if (wrap.dataset.filterInit === "true") return;
      wrap.dataset.filterInit = "true";

      const toggle = wrap.querySelector(SELECTORS.mobileFilterToggle);
      const label = wrap.querySelector(SELECTORS.mobileFilterLabel);
      const list = wrap.querySelector(SELECTORS.mobileFilterList);

      if (!toggle || !label || !list) return;

      const headerClickTargets = [
        ".filter_dd_label",
        ".filter_dropdown_label",
        ".filter_dropdown_icon"
      ];

      function isOpen() {
        return !list.classList.contains("is-collapsed");
      }

      function open() {
        list.classList.remove("is-collapsed");
        toggle.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
      }

      function close() {
        list.classList.add("is-collapsed");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }

      // По умолчанию закрываем список
      close();

      // Делаем toggle доступным как кнопку
      toggle.setAttribute("role", "button");
      toggle.setAttribute("tabindex", "0");
      toggle.setAttribute("aria-expanded", "false");

      // Открытие/закрытие по клику на header
      toggle.addEventListener("click", (e) => {
        const clickedHeader = headerClickTargets.some((sel) =>
          e.target.closest(sel)
        );
        if (!clickedHeader) return;

        e.preventDefault();
        e.stopPropagation();
        isOpen() ? close() : open();
      });

      // Управление с клавиатуры
      toggle.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          isOpen() ? close() : open();
        }
        if (e.key === "Escape") close();
      });

      // Клик по фильтру
      wrap.querySelectorAll(SELECTORS.mobileFilterField).forEach((field) => {
        field.addEventListener("click", () => {
          const input = field.querySelector('input[type="radio"]');
          if (input && !input.checked) input.click();

          const text = getTextFromField(field);
          if (text) label.textContent = text;

          close();
        });
      });

      // Закрытие при клике вне блока
      document.addEventListener("click", (e) => {
        if (!wrap.contains(e.target)) close();
      });

      // Если уже есть выбранный radio, подставляем его текст в label
      const checked = wrap.querySelector(
        '.radio_field input[type="radio"]:checked'
      );
      if (checked) {
        const field = checked.closest(".radio_field");
        const text = getTextFromField(field);
        if (text) label.textContent = text;
      }
    });
  }

  // ======================================================
  // ACCORDION
  // ======================================================
  function initAccordion() {
    if (!hasGSAP) {
      console.warn("Accordion: GSAP не знайдено");
      return;
    }

    const rows = gsap.utils.toArray(SELECTORS.accordionRow);
    if (!rows.length) {
      console.warn("Accordion: не знайдено рядки");
      return;
    }

    // Определение line-height
    function getLineHeight(el) {
      const styles = getComputedStyle(el);
      let lineHeight = parseFloat(styles.lineHeight);

      if (Number.isNaN(lineHeight)) {
        const fontSize = parseFloat(styles.fontSize) || 16;
        lineHeight = Math.round(fontSize * 1.2);
      }

      return lineHeight;
    }

    // Первый текстовый элемент внутри панели
    function getFirstTextEl(inner) {
      return (
        inner.querySelector("p, li, span, div, h1, h2, h3, h4, h5, h6") || inner
      );
    }

    // Высота свернутого состояния аккордеона
    function computeCollapsedHeight(panel, inner) {
      const firstTextEl = getFirstTextEl(inner);
      const lineHeight = getLineHeight(firstTextEl);
      const panelStyles = getComputedStyle(panel);
      const padY =
        (parseFloat(panelStyles.paddingTop) || 0) +
        (parseFloat(panelStyles.paddingBottom) || 0);

      return Math.ceil(lineHeight * CONFIG.accordionPeekLines + padY);
    }

    rows.forEach((row) => {
      if (row.dataset.accordionInit === "true") return;
      row.dataset.accordionInit = "true";

      const trigger = row.querySelector(SELECTORS.accordionTrigger);
      const panel = row.querySelector(SELECTORS.accordionPanel);
      if (!trigger || !panel) return;

      // Оборачиваем контент панели во внутренний контейнер, если его нет
      let inner = panel.querySelector(".col3-panel-inner");
      if (!inner) {
        inner = document.createElement("div");
        inner.className = "col3-panel-inner";

        while (panel.firstChild) {
          inner.appendChild(panel.firstChild);
        }

        panel.appendChild(inner);
      }

      row._acc = {
        open: false,
        panel,
        inner,
        collapsedH: computeCollapsedHeight(panel, inner)
      };

      // Начальное состояние панели
      gsap.set(panel, {
        display: "block",
        overflow: "hidden",
        height: row._acc.collapsedH
      });

      row.classList.remove("is-open");
      trigger.style.cursor = "pointer";

      // Логика открытия/закрытия
      trigger.addEventListener("click", (e) => {
        if (e.target.closest("a")) e.preventDefault();

        // Если разрешено только одно открытое состояние
        if (CONFIG.accordionSingleOpen) {
          rows.forEach((otherRow) => {
            if (otherRow === row || !otherRow._acc?.open) return;

            gsap.to(otherRow._acc.panel, {
              height: otherRow._acc.collapsedH,
              duration: CONFIG.accordionDuration,
              ease: "power2.inOut",
              overwrite: "auto"
            });

            otherRow._acc.open = false;
            otherRow.classList.remove("is-open");
          });
        }

        // Открытие
        if (!row._acc.open) {
          gsap.to(panel, {
            height: "auto",
            duration: CONFIG.accordionDuration,
            ease: "power2.out",
            overwrite: "auto"
          });

          row._acc.open = true;
          row.classList.add("is-open");
        } else {
          // Закрытие
          gsap.to(panel, {
            height: row._acc.collapsedH,
            duration: CONFIG.accordionDuration,
            ease: "power2.inOut",
            overwrite: "auto"
          });

          row._acc.open = false;
          row.classList.remove("is-open");
        }
      });
    });

    // Пересчёт высоты при resize
    window.addEventListener(
      "resize",
      debounce(() => {
        rows.forEach((row) => {
          if (!row._acc?.panel || !row._acc?.inner) return;

          const { panel, inner, open } = row._acc;
          row._acc.collapsedH = computeCollapsedHeight(panel, inner);

          if (open) {
            gsap.set(panel, { height: "auto" });
          } else {
            gsap.set(panel, { height: row._acc.collapsedH });
          }
        });
      }, 150)
    );
  }

  // ======================================================
  // ЗАПУСК ИНИЦИАЛИЗАЦИЙ
  // ======================================================

  initFilterByLink();
  initProductButtonArrowHover();
  initProductCardHover();
  initNavMenu();
  initBurgerHover();
  initMobileFilters();
  initAccordion();
  initScrollReveal();
});

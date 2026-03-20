"use strict";

window.Webflow ||= [];
window.Webflow.push(() => {
  if (window.__siteAnimationsInitialized) return;
  window.__siteAnimationsInitialized = true;

  const hasGSAP = typeof gsap !== "undefined";
  const hasScrollTrigger = typeof ScrollTrigger !== "undefined";

  if (hasGSAP && hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

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

    revealContainer: ".container",

    productCard: ".section_products-grid-card",
    productButton: ".button-main_btn",
    productButtonArrow: ".awesome-arrow",
    blurLayer: ".blur_layer",
    verticalLine: ".vertical-line",
    hiddenText: ".hidden-text"
  };

  const CONFIG = {
    accordionSingleOpen: true,
    accordionDuration: 0.5,
    accordionPeekLines: 1,
    desktopMin: 992
  };

  function debounce(fn, wait = 150) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  }

  function getTextFromField(field) {
    const textEl =
      field?.querySelector(".w-form-label") ||
      field?.querySelector("label") ||
      field?.querySelector("div, span, p");

    return (textEl?.textContent || "").trim();
  }

  function initProductButtonArrowHover() {
    if (!hasGSAP) return;

    const buttons = document.querySelectorAll(
      `${SELECTORS.productCard} ${SELECTORS.productButton}`
    );
    if (!buttons.length) return;

    buttons.forEach((button) => {
      if (button.dataset.arrowHoverInit === "true") return;
      button.dataset.arrowHoverInit = "true";

      const arrow = button.querySelector(SELECTORS.productButtonArrow);
      if (!arrow) return;

      gsap.set(arrow, { x: 0 });

      const onEnter = () => {
        gsap.to(arrow, {
          x: 10,
          duration: 0.3,
          ease: "bounce.out",
          overwrite: "auto"
        });
      };

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

  function initProductCardHover() {
    if (!hasGSAP) {
      console.warn("GSAP не найден");
      return;
    }

    const mm = gsap.matchMedia();

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

        function getLineShiftToCenter() {
          const cardRect = card.getBoundingClientRect();
          const lineRect = verticalLine.getBoundingClientRect();

          const cardCenter = cardRect.left + cardRect.width / 2;
          const lineCenter = lineRect.left + lineRect.width / 2;

          return cardCenter - lineCenter;
        }

        function getTextShiftToCenter() {
          const cardRect = card.getBoundingClientRect();
          const textRect = hiddenText.getBoundingClientRect();

          const cardCenter = cardRect.left + cardRect.width / 2;
          const textCenter = textRect.left + textRect.width / 2;

          return cardCenter - textCenter;
        }

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

    gsap.set(panel, { x: "100%", opacity: 0 });
    if (items.length) {
      gsap.set(items, { yPercent: 200, opacity: 0 });
    }

    const tl = gsap.timeline({ paused: true });

    tl.to(panel, {
      x: "0%",
      opacity: 1,
      duration: 0.5,
      ease: "power3.out"
    });

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

    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      isOpen ? closeMenu() : openMenu();
    });

    panel.addEventListener("click", (e) => {
      if (e.target.closest(SELECTORS.navLink)) {
        closeMenu();
      }
    });

    document.addEventListener(
      "pointerdown",
      (e) => {
        if (!isOpen) return;
        if (burger.contains(e.target) || panel.contains(e.target)) return;
        closeMenu();
      },
      { passive: true }
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    window.addEventListener(
      "resize",
      debounce(() => {
        if (!isOpen) syncClosedState();
      }, 120)
    );
  }

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

      close();

      toggle.setAttribute("role", "button");
      toggle.setAttribute("tabindex", "0");
      toggle.setAttribute("aria-expanded", "false");

      toggle.addEventListener("click", (e) => {
        const clickedHeader = headerClickTargets.some((sel) =>
          e.target.closest(sel)
        );
        if (!clickedHeader) return;

        e.preventDefault();
        e.stopPropagation();
        isOpen() ? close() : open();
      });

      toggle.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          isOpen() ? close() : open();
        }
        if (e.key === "Escape") close();
      });

      wrap.querySelectorAll(SELECTORS.mobileFilterField).forEach((field) => {
        field.addEventListener("click", () => {
          const input = field.querySelector('input[type="radio"]');
          if (input && !input.checked) input.click();

          const text = getTextFromField(field);
          if (text) label.textContent = text;

          close();
        });
      });

      document.addEventListener("click", (e) => {
        if (!wrap.contains(e.target)) close();
      });

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

    function getLineHeight(el) {
      const styles = getComputedStyle(el);
      let lineHeight = parseFloat(styles.lineHeight);

      if (Number.isNaN(lineHeight)) {
        const fontSize = parseFloat(styles.fontSize) || 16;
        lineHeight = Math.round(fontSize * 1.2);
      }

      return lineHeight;
    }

    function getFirstTextEl(inner) {
      return (
        inner.querySelector("p, li, span, div, h1, h2, h3, h4, h5, h6") || inner
      );
    }

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

      gsap.set(panel, {
        display: "block",
        overflow: "hidden",
        height: row._acc.collapsedH
      });

      row.classList.remove("is-open");
      trigger.style.cursor = "pointer";

      trigger.addEventListener("click", (e) => {
        if (e.target.closest("a")) e.preventDefault();

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

        if (hasScrollTrigger) ScrollTrigger.refresh();
      }, 150)
    );
  }

  function initScrollReveal() {
    if (!hasGSAP || !hasScrollTrigger) return;

    const containers = gsap.utils.toArray(SELECTORS.revealContainer);
    if (!containers.length) return;

    function getStart(container) {
      const vh = window.innerHeight;
      const h = container.offsetHeight;

      if (h > vh * 0.9) return "top 90%";
      if (h > vh * 0.5) return "top 85%";
      return "top 75%";
    }

    containers.forEach((container, index) => {
      if (container.dataset.revealInit === "true") return;
      container.dataset.revealInit = "true";

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

    window.addEventListener(
      "load",
      () => {
        ScrollTrigger.refresh();
      },
      { once: true }
    );

    window.addEventListener(
      "resize",
      debounce(() => {
        ScrollTrigger.refresh();
      }, 150)
    );
  }

  initProductButtonArrowHover();
  initProductCardHover();
  initNavMenu();
  initBurgerHover();
  initMobileFilters();
  initAccordion();
  initScrollReveal();

  console.log("local site.js loaded");
});

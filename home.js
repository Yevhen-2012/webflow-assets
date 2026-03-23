"use strict";

console.log("home.js file fetched");

window.Webflow ||= [];
window.Webflow.push(() => {
  console.log("home.js Webflow callback start");

  if (window.__homeAnimationsInitialized) return;
  window.__homeAnimationsInitialized = true;

  const hasGSAP = typeof gsap !== "undefined";
  const hasScrollTrigger = typeof ScrollTrigger !== "undefined";

  if (hasGSAP && hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  const SELECTORS = {
    accordionRow: ".row-wraper, .row-wrapper",
    accordionTrigger: ".col-2-text, .col2-item",
    accordionPanel: ".col3-item",

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

      button.addEventListener("mouseenter", () => {
        gsap.to(arrow, {
          x: 10,
          duration: 0.3,
          ease: "bounce.out",
          overwrite: "auto"
        });
      });

      button.addEventListener("mouseleave", () => {
        gsap.to(arrow, {
          x: 0,
          duration: 0.3,
          ease: "bounce.out",
          overwrite: "auto"
        });
      });
    });
  }

  function initProductCardHover() {
    if (!hasGSAP) return;

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
          return cardRect.left + cardRect.width / 2 - (lineRect.left + lineRect.width / 2);
        }

        function getTextShiftToCenter() {
          const cardRect = card.getBoundingClientRect();
          const textRect = hiddenText.getBoundingClientRect();
          return cardRect.left + cardRect.width / 2 - (textRect.left + textRect.width / 2);
        }

        const tl = gsap.timeline({ paused: true });

        tl.to(blurLayer, {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power2.out",
          overwrite: "auto"
        }, 0);

        tl.to(verticalLine, {
          rotate: 90,
          height: "10rem",
          x: () => getLineShiftToCenter(),
          duration: 0.9,
          ease: "back.out(1.7)",
          overwrite: "auto"
        }, 0);

        tl.to(hiddenText, {
          opacity: 1,
          x: () => getTextShiftToCenter(),
          y: -20,
          duration: 0.6,
          ease: "power2.out",
          overwrite: "auto"
        }, 0.15);

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

      return () => cleanups.forEach((fn) => fn());
    });

    mm.add(`(max-width: ${CONFIG.desktopMin - 1}px)`, () => {
      document.querySelectorAll(SELECTORS.productCard).forEach((card) => {
        const blurLayer = card.querySelector(SELECTORS.blurLayer);
        const verticalLine = card.querySelector(SELECTORS.verticalLine);
        const hiddenText = card.querySelector(SELECTORS.hiddenText);

        if (blurLayer) gsap.set(blurLayer, { clearProps: "all", opacity: 1, scale: 1 });
        if (verticalLine) gsap.set(verticalLine, { clearProps: "all", rotate: 0, height: "3rem", x: 0 });
        if (hiddenText) gsap.set(hiddenText, { clearProps: "all", opacity: 1, x: 0, y: 0 });

        delete card.dataset.hoverInit;
      });
    });
  }

  function initAccordion() {
    if (!hasGSAP) return;

    const rows = gsap.utils.toArray(SELECTORS.accordionRow);
    if (!rows.length) return;

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
      return inner.querySelector("p, li, span, div, h1, h2, h3, h4, h5, h6") || inner;
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

        while (panel.firstChild) inner.appendChild(panel.firstChild);
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

    window.addEventListener("resize", debounce(() => {
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
    }, 150));
  }

  initProductButtonArrowHover();
  initProductCardHover();
  initAccordion();

  console.log("home.js loaded");
});

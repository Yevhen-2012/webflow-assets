"use strict";

window.Webflow ||= [];
window.Webflow.push(() => {
  if (window.__coreAnimationsInitialized) return;
  window.__coreAnimationsInitialized = true;

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
    revealContainer: ".container"
  };

  function debounce(fn, wait = 150) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  }

  function initNavMenu() {
    if (!hasGSAP) return;

    const burger = document.querySelector(SELECTORS.burger);
    const panel = document.querySelector(SELECTORS.navPanel);

    if (!burger || !panel) return;
    if (burger.dataset.navInit === "true") return;
    burger.dataset.navInit = "true";

    const items = panel.querySelectorAll(SELECTORS.navItemText);
    let isOpen = false;

    gsap.set(panel, { x: "100%", opacity: 0 });
    if (items.length) gsap.set(items, { yPercent: 200, opacity: 0 });

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
      if (items.length) gsap.set(items, { yPercent: 200, opacity: 0 });
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
      if (e.target.closest(SELECTORS.navLink)) closeMenu();
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
      () => ScrollTrigger.refresh(),
      { once: true }
    );

    window.addEventListener(
      "resize",
      debounce(() => {
        ScrollTrigger.refresh();
      }, 150)
    );
  }

  initNavMenu();
  initBurgerHover();
  initScrollReveal();

  console.log("core.js loaded");
});

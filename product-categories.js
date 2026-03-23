"use strict";

window.Webflow ||= [];
window.Webflow.push(() => {
  if (window.__productCategoriesInitialized) return;
  window.__productCategoriesInitialized = true;

  const SELECTORS = {
    mobileFilterWrap: ".filter_block-mobile",
    mobileFilterToggle: ".filter_dd_toggle",
    mobileFilterLabel: ".filter_dropdown_label, .filter_dd_label",
    mobileFilterList: ".filter_list-2",
    mobileFilterField: ".radio_field"
  };

  function getTextFromField(field) {
    const textEl =
      field?.querySelector(".w-form-label") ||
      field?.querySelector("label") ||
      field?.querySelector("div, span, p");

    return (textEl?.textContent || "").trim();
  }

  function initMobileFilters() {
    const wraps = [...document.querySelectorAll(SELECTORS.mobileFilterWrap)];
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

      wrap._filterApi = { open, close, isOpen };

      close();

      toggle.setAttribute("role", "button");
      toggle.setAttribute("tabindex", "0");
      toggle.setAttribute("aria-expanded", "false");

      toggle.addEventListener("click", (e) => {
        const clickedHeader = headerClickTargets.some((sel) => e.target.closest(sel));
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

      const checked = wrap.querySelector('.radio_field input[type="radio"]:checked');
      if (checked) {
        const field = checked.closest(".radio_field");
        const text = getTextFromField(field);
        if (text) label.textContent = text;
      }
    });

    document.addEventListener("click", (e) => {
      wraps.forEach((wrap) => {
        if (!wrap.dataset.filterInit) return;
        if (wrap.contains(e.target)) return;
        wrap._filterApi?.close?.();
      });
    });
  }

  initMobileFilters();

  console.log("product-categories.js loaded");
});

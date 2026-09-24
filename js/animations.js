/* ==========================================================================
   animations.js — site motion
   - Scroll reveal: elements with [data-reveal] fade/slide in once. Common
     blocks (section heads, cards, steps, grids) are tagged automatically,
     and grid children get a small stagger.
   - Scroll progress bar, back-to-top button, smooth same-page anchors.
   - Dashboard stat numbers count up when they change.
   Motion plays on every device. Visitors can switch it off with the
   "Animations" toggle in the footer (saved in this browser).
   ========================================================================== */

(function () {
  "use strict";
  // Motion is on by default on every screen. We deliberately don't follow the
  // operating system's "reduce motion" setting (Windows "Animation effects" off
  // would otherwise hide every animation on PCs); the footer toggle is the
  // opt-out and is remembered in this browser.
  const reduce = document.documentElement.classList.contains("reduce-motion");

  function initMotionToggle() {
    document.querySelectorAll("[data-motion-toggle]").forEach((btn) => {
      const sync = () => {
        const off = document.documentElement.classList.contains("reduce-motion");
        btn.setAttribute("aria-pressed", String(!off));
        btn.querySelector("[data-motion-state]").textContent = off ? "Off" : "On";
      };
      sync();
      btn.addEventListener("click", () => {
        const off = !document.documentElement.classList.contains("reduce-motion");
        try { localStorage.setItem("msb_reduce_motion", off ? "1" : "0"); } catch (e) {}
        window.location.reload();
      });
    });
  }

  // Blocks that get a reveal automatically (value = reveal variant).
  const AUTO = [
    [".section-head", ""],
    [".why__intro", "left"],
    [".prose-block", ""],
    [".audience-card--candidate", "left"],
    [".audience-card--employer", "right"],
    [".contact-info", "left"],
    [".contact-grid > :last-child", "right"],
    [".check-tool > *", ""],
    [".tool-intro", "left"],
    [".accordion", ""],
    [".legal > *", ""],
    [".article > *", ""],
    [".info-panel", "zoom"],
    [".final-cta", "zoom"],
    [".footer-grid > *", ""],
  ];
  // Containers whose children reveal with a stagger.
  const STAGGER = [".grid", ".grid-2", ".grid-3", ".grid-4", ".steps", ".industry-grid", ".feature-list",
    ".journey", ".values", ".apply-steps", ".contact-info"];

  function tagElements() {
    AUTO.forEach(([sel, variant]) => {
      document.querySelectorAll(sel).forEach((el) => {
        if (el.hasAttribute("data-reveal") || el.closest(".hero, .dash, .auth, .site-header, .filters")) return;
        el.setAttribute("data-reveal", variant);
      });
    });
    STAGGER.forEach((sel) => {
      document.querySelectorAll(sel).forEach((grid) => {
        if (grid.closest(".hero, .dash, .auth, .filters, .site-header")) return;
        Array.from(grid.children).forEach((child, i) => {
          if (child.hasAttribute("data-reveal")) return;
          child.setAttribute("data-reveal", "");
          child.style.setProperty("--reveal-delay", Math.min(i, 6) * 0.08 + "s");
        });
      });
    });
  }

  function initReveal() {
    tagElements();
    const items = document.querySelectorAll("[data-reveal]");
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    document.documentElement.classList.add("js-reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("is-visible");
        io.unobserve(el);
        // Hand transform back to the element's own hover styles once revealed.
        const delay = parseFloat(el.style.getPropertyValue("--reveal-delay")) || 0;
        setTimeout(() => { el.removeAttribute("data-reveal"); el.classList.remove("is-visible"); }, 700 + delay * 1000);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
    items.forEach((el) => io.observe(el));
    // Safety net: never leave content hidden (e.g. printing, very tall elements).
    window.addEventListener("beforeprint", () => items.forEach((el) => el.classList.add("is-visible")));
  }

  // Scroll progress bar + back-to-top visibility (one rAF-throttled listener).
  function initScrollUI() {
    const bar = document.querySelector(".scroll-progress");
    const top = document.querySelector(".back-to-top");
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (bar) bar.style.setProperty("--progress", p.toFixed(4));
      if (top) top.classList.toggle("is-visible", window.scrollY > 600);
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
    if (top) top.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      const skip = document.querySelector(".logo");
      if (skip) skip.focus({ preventScroll: true });
    });
  }

  // Count-up for numeric stats (dashboard numbers are set by dashboard.js).
  function initCountUp() {
    if (reduce) return;
    const animate = (el, to) => {
      el.dataset.counting = "1";
      const start = performance.now(), dur = 700;
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(step);
        else { el.textContent = to; delete el.dataset.counting; }
      };
      requestAnimationFrame(step);
    };
    document.querySelectorAll(".stat__n").forEach((el) => {
      new MutationObserver(() => {
        if (el.dataset.counting) return;
        const to = parseInt(el.textContent, 10);
        if (!isNaN(to) && to > 0 && String(to) === el.textContent.trim()) animate(el, to);
      }).observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  // Smooth scroll for same-page anchors; moves focus for keyboard/screen-reader users.
  function initSmoothAnchors() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute("href").length < 2 || a.closest("[data-view-link]")) return;
      const target = document.getElementById(a.getAttribute("href").slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      history.replaceState(null, "", a.getAttribute("href"));
    });
  }


  // Adds .is-inview once (no hiding) — used for drawn lines etc.
  function initInView() {
    const els = document.querySelectorAll("[data-inview]");
    if (reduce || !("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-inview")); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-inview"); io.unobserve(e.target); }
    }), { threshold: 0.3 });
    els.forEach((el) => io.observe(el));
  }

  // Numbers with [data-count] count up when they scroll into view.
  function initCounters() {
    const els = [...document.querySelectorAll("[data-count]")];
    if (!els.length) return;
    const jobsEl = document.querySelector("[data-count-jobs]");
    if (jobsEl) jobsEl.dataset.count = (window.MSB_JOBS || []).length;
    const run = (el) => {
      const to = Number(el.dataset.count) || 0, suffix = el.dataset.suffix || "";
      if (reduce) { el.textContent = to + suffix; return; }
      const start = performance.now(), dur = 1400;
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - t, 4))) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
    }), { threshold: 0.5 });
    els.forEach((el) => io.observe(el));
  }

  // Rotating word ("Now hiring in ICT / Hospitality / …").
  function initRotator() {
    document.querySelectorAll("[data-rotate]").forEach((el) => {
      const words = el.dataset.rotate.split("|");
      if (reduce || words.length < 2) return;
      let i = 0;
      setInterval(() => {
        el.classList.remove("is-in"); el.classList.add("is-out");
        setTimeout(() => {
          i = (i + 1) % words.length;
          el.textContent = words[i];
          el.classList.remove("is-out"); el.classList.add("is-in");
        }, 300);
      }, 2400);
    });
  }

  // Subtle 3D tilt + light spot on cards (mouse / pen only).
  function initTilt() {
    if (reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--ry", ((x - .5) * 8).toFixed(2) + "deg");
        el.style.setProperty("--rx", ((.5 - y) * 8).toFixed(2) + "deg");
        el.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
        el.style.setProperty("--my", (y * 100).toFixed(1) + "%");
        el.classList.add("is-tilting");
      });
      el.addEventListener("pointerleave", () => el.classList.remove("is-tilting"));
    });
  }

  // Material-style ripple where a button is clicked.
  function initRipple() {
    if (reduce) return;
    document.addEventListener("pointerdown", (e) => {
      const btn = e.target.closest(".btn");
      if (!btn || btn.disabled) return;
      const r = btn.getBoundingClientRect();
      const s = document.createElement("span");
      s.className = "ripple";
      s.style.left = e.clientX - r.left + "px";
      s.style.top = e.clientY - r.top + "px";
      s.style.width = Math.max(r.width, r.height) * 2.2 + "px";
      btn.appendChild(s);
      setTimeout(() => s.remove(), 650);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initReveal(); initScrollUI(); initCountUp(); initSmoothAnchors();
    initInView(); initCounters(); initRotator(); initTilt(); initRipple(); initMotionToggle();
  });
})();

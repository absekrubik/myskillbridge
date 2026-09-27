/* ==========================================================================
   main.js — shared UI behaviour used on every page
   Mobile nav, auth-aware header, toasts, modals, form validation,
   job card rendering, save-job buttons, apply flow, accordion.
   ========================================================================== */

(function () {
  "use strict";
  const { JobService, ApplicationService, AuthService } = window.MSB;

  /* ---------------------------------------------------------------- helpers */
  const UI = {};

  UI.esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  UI.icon = (id, cls = "icon") => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#${id}"></use></svg>`;

  UI.formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  };

  UI.daysAgo = (iso) => {
    const diff = Math.round((new Date() - new Date(iso + "T00:00:00")) / 86400000);
    if (diff <= 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 30) return `${diff} days ago`;
    return UI.formatDate(iso);
  };

  UI.qs = (name) => new URLSearchParams(window.location.search).get(name);

  /* ----------------------------------------------------------------- toasts */
  UI.toast = (message, type = "success") => {
    let region = document.getElementById("toast-region");
    if (!region) {
      region = document.createElement("div");
      region.id = "toast-region";
      region.className = "toast-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    const iconId = type === "error" ? "i-info" : "i-check";
    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    el.innerHTML = `${UI.icon(iconId)}<span>${UI.esc(message)}</span>`;
    region.appendChild(el);
    setTimeout(() => { el.classList.add("is-leaving"); setTimeout(() => el.remove(), 300); }, 3200);
  };

  /* ----------------------------------------------------------------- modals */
  let lastFocus = null;
  UI.openModal = ({ title, body, actions = "", size = "" }) => {
    UI.closeModal();
    lastFocus = document.activeElement;
    const wrap = document.createElement("div");
    wrap.className = "modal-backdrop";
    wrap.innerHTML = `
      <div class="modal ${size}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal__head">
          <h2 id="modal-title" class="modal__title">${UI.esc(title)}</h2>
          <button class="icon-btn" type="button" data-close-modal aria-label="Close dialog">${UI.icon("i-close")}</button>
        </div>
        <div class="modal__body">${body}</div>
        ${actions ? `<div class="modal__actions">${actions}</div>` : ""}
      </div>`;
    document.body.appendChild(wrap);
    document.body.classList.add("no-scroll");
    requestAnimationFrame(() => wrap.classList.add("is-open"));
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap || e.target.closest("[data-close-modal]")) UI.closeModal();
    });
    const focusable = wrap.querySelector("input, select, textarea, button:not([data-close-modal]), a") || wrap.querySelector("button");
    focusable && focusable.focus();
    return wrap.querySelector(".modal");
  };

  UI.closeModal = () => {
    const m = document.querySelector(".modal-backdrop");
    if (!m) return;
    m.remove();
    if (!document.querySelector(".filters.is-open, .dash-sidebar.is-open")) document.body.classList.remove("no-scroll");
    lastFocus && lastFocus.focus && lastFocus.focus();
  };

  // Escape closes modal / drawers; Tab is trapped inside an open modal.
  document.addEventListener("keydown", (e) => {
    const modal = document.querySelector(".modal-backdrop .modal");
    if (e.key === "Escape") {
      if (modal) UI.closeModal();
      document.dispatchEvent(new CustomEvent("msb:escape"));
    }
    if (e.key === "Tab" && modal) {
      const f = [...modal.querySelectorAll("a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex='-1'])")];
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* -------------------------------------------------------- form validation
     Uses native constraint attributes (required, type, minlength, pattern)
     plus data-match="otherFieldName" for confirm-password fields.
     Shows messages under each field; returns true if valid.            */
  UI.validateForm = (form) => {
    let firstInvalid = null;
    form.querySelectorAll("input, select, textarea").forEach((field) => {
      if (field.type === "hidden" || field.matches(":disabled")) return;
      const msg = UI.fieldError(field, form);
      UI.setFieldError(field, msg);
      if (msg && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  };

  UI.fieldError = (field, form) => {
    const v = field.type === "checkbox" ? field.checked : field.value.trim();
    const label = field.dataset.label || "details";
    if (field.required && !v) {
      if (field.type === "checkbox") return "Tick this box to continue.";
      if (field.type === "file") return `Choose your ${label} to upload.`;
      return field.tagName === "SELECT" ? `Choose your ${label}.` : `Enter your ${label}.`;
    }
    if (!v) return "";
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter an email address like name@example.com.";
    if (field.type === "tel" && !/^[+()\d\s-]{6,20}$/.test(v)) return "Enter a phone number using digits, spaces or +.";
    if (field.minLength > 0 && v.length < field.minLength) return `Use at least ${field.minLength} characters.`;
    if (field.dataset.match) {
      const other = form.querySelector(`[name="${field.dataset.match}"]`);
      if (other && other.value !== field.value) return "Passwords don't match.";
    }
    return "";
  };

  UI.setFieldError = (field, msg) => {
    const wrap = field.closest(".field") || field.parentElement;
    let el = wrap.querySelector(".field__error");
    if (!el) {
      el = document.createElement("p");
      el.className = "field__error";
      el.id = (field.id || field.name) + "-error";
      wrap.appendChild(el);
    }
    el.textContent = msg;
    field.setAttribute("aria-invalid", msg ? "true" : "false");
    if (msg) field.setAttribute("aria-describedby", el.id); else field.removeAttribute("aria-describedby");
  };

  // Live re-validation once a field has been flagged.
  document.addEventListener("input", (e) => {
    const f = e.target;
    if (f.matches && f.matches("[aria-invalid='true']")) UI.setFieldError(f, UI.fieldError(f, f.form || document));
  });

  UI.setBusy = (btn, busy, busyText = "Please wait…") => {
    if (!btn) return;
    if (busy) { btn.dataset.label = btn.innerHTML; btn.innerHTML = `<span class="spinner" aria-hidden="true"></span>${busyText}`; btn.disabled = true; }
    else { btn.innerHTML = btn.dataset.label || btn.innerHTML; btn.disabled = false; }
  };

  /* ------------------------------------------------------------- job cards */
  UI.jobCard = (job) => {
    const ind = window.MSB_INDUSTRIES[job.category] || window.MSB_INDUSTRIES.Other;
    const saved = JobService.isSaved(job.id);
    const url = `job-details.html?id=${encodeURIComponent(job.id)}`;
    return `
      <article class="job-card">
        <div class="job-card__top">
          <span class="industry-chip">${UI.icon(ind.icon)}${UI.esc(ind.filterLabel)}</span>
          ${UI.saveButton(job, saved)}
        </div>
        <h3 class="job-card__title"><a href="${url}">${UI.esc(job.title)}</a></h3>
        <p class="job-card__company">${UI.esc(job.company)}</p>
        <ul class="job-meta" aria-label="Job details">
          <li>${UI.icon("i-pin")}${UI.esc(job.location)}</li>
          <li>${UI.icon("i-briefcase")}${UI.esc(job.employment)}</li>
          <li>${UI.icon("i-clock")}${UI.esc(job.experience)}</li>
        </ul>
        <div class="job-card__foot">
          <span class="job-card__date"><span class="sr-only">Posted </span>${UI.daysAgo(job.postedDate)}</span>
          <a class="btn btn--ghost btn--sm" href="${url}" aria-label="View job: ${UI.esc(job.title)}">View job</a>
        </div>
      </article>`;
  };

  UI.saveButton = (job, saved, withText = false) => `
    <button type="button" class="save-btn ${saved ? "is-saved" : ""} ${withText ? "save-btn--text" : ""}"
      data-save-job="${UI.esc(job.id)}" aria-pressed="${saved}"
      aria-label="${saved ? "Remove" : "Save"} ${UI.esc(job.title)} ${saved ? "from" : "to"} saved jobs">
      ${UI.icon("i-bookmark")}${withText ? `<span>${saved ? "Saved" : "Save job"}</span>` : ""}
    </button>`;

  UI.skeletonCards = (n = 4) => Array.from({ length: n }, () => `
    <div class="job-card job-card--skeleton" aria-hidden="true">
      <div class="sk sk--chip"></div><div class="sk sk--title"></div><div class="sk sk--line"></div>
      <div class="sk sk--line sk--short"></div></div>`).join("");

  // One delegated handler for every save button on every page.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-save-job]");
    if (!btn) return;
    const id = btn.dataset.saveJob;
    const job = (window.MSB_JOBS || []).find((j) => j.id === id);
    const saved = JobService.toggleSave(id);
    document.querySelectorAll(`[data-save-job="${CSS.escape(id)}"]`).forEach((b) => {
      b.classList.toggle("is-saved", saved);
      b.setAttribute("aria-pressed", saved);
      b.setAttribute("aria-label", `${saved ? "Remove" : "Save"} ${job ? job.title : "job"} ${saved ? "from" : "to"} saved jobs`);
      const t = b.querySelector("span"); if (t) t.textContent = saved ? "Saved" : "Save job";
      b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
    });
    UI.toast(saved ? "Job saved. Find it under Saved jobs in your dashboard." : "Job removed from saved jobs.");
    document.dispatchEvent(new CustomEvent("msb:saved-changed"));
  });

  /* ------------------------------------------------------------ apply flow */
  UI.startApplication = (job) => {
    const user = AuthService.currentUser();
    if (!user) {
      UI.openModal({
        title: "Log in to apply",
        body: `<p class="muted">Create a free profile or log in to apply for <strong>${UI.esc(job.title)}</strong>. Your profile lets you track the application afterwards.</p>`,
        actions: `
          <a class="btn btn--ghost" href="login.html?next=${encodeURIComponent("job-details.html?id=" + job.id)}">Log in</a>
          <a class="btn btn--primary" href="register.html?next=${encodeURIComponent("job-details.html?id=" + job.id)}">Create your profile</a>`
      });
      return;
    }
    if (user.role !== "candidate") { UI.toast("Employer accounts can't apply for jobs. Log in with a candidate account.", "error"); return; }
    if (ApplicationService.hasApplied(job.id)) {
      UI.toast("You've already applied. Track it in your dashboard.");
      return;
    }
    const modal = UI.openModal({
      title: `Apply for ${job.title}`,
      body: `
        <form id="apply-form" novalidate>
          <div class="field">
            <label for="apply-cv">CV <span class="req" aria-hidden="true">*</span></label>
            <input id="apply-cv" name="cv" type="file" accept=".pdf,.doc,.docx" required data-label="CV file">
            <p class="field__hint">PDF or Word. In this demo only the file name is recorded — files are not stored in your browser.</p>
          </div>
          <div class="field">
            <label for="apply-note">Short message to the employer (optional)</label>
            <textarea id="apply-note" name="note" rows="4" maxlength="1000" placeholder="Tell the employer why this role suits your experience."></textarea>
          </div>
          <div class="field field--check">
            <input id="apply-consent" name="consent" type="checkbox" required>
            <label for="apply-consent">I confirm the information in my application is accurate and agree to the <a href="privacy.html">Privacy Policy</a>.</label>
          </div>
        </form>`,
      actions: `<button class="btn btn--ghost" type="button" data-close-modal>Cancel</button>
                <button class="btn btn--primary" type="submit" form="apply-form">Submit application</button>`
    });
    modal.querySelector("#apply-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      if (!UI.validateForm(form)) return;
      const btn = modal.querySelector("[type=submit]");
      UI.setBusy(btn, true, "Submitting…");
      try {
        await ApplicationService.applyForJob(job.id, {
          coverNote: form.note.value,
          cvFileName: form.cv.files[0] ? form.cv.files[0].name : null
        });
        UI.openModal({
          title: "Application submitted",
          body: `<div class="success-state">${UI.icon("i-check", "icon success-state__icon")}
                 <p>Your application for <strong>${UI.esc(job.title)}</strong> has been submitted. You can follow its progress from your dashboard.</p></div>`,
          actions: `<button class="btn btn--ghost" type="button" data-close-modal>Keep browsing</button>
                    <a class="btn btn--primary" href="candidate-dashboard.html#applications">Track application</a>`
        });
        document.dispatchEvent(new CustomEvent("msb:applied", { detail: job.id }));
      } catch (err) {
        UI.setBusy(btn, false);
        UI.toast(err.message, "error");
      }
    });
  };

  /* ------------------------------------------------------------ navigation */
  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.getElementById("primary-menu");
    if (toggle && menu) {
      const setOpen = (open) => {
        toggle.setAttribute("aria-expanded", open);
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        document.body.classList.toggle("nav-open", open);
      };
      toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
      menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
      document.addEventListener("msb:escape", () => setOpen(false));
      window.addEventListener("resize", () => { if (window.innerWidth > 1024) setOpen(false); });
    }

    // Header shadow once the page scrolls.
    const header = document.querySelector(".site-header");
    const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Swap Log in / Register for Dashboard / Log out when a demo session exists.
    const user = AuthService.currentUser();
    document.querySelectorAll("[data-auth-slot]").forEach((slot) => {
      if (!user) return;
      const dash = user.role === "candidate" ? "candidate-dashboard.html" : "employer-dashboard.html";
      slot.innerHTML = `
        <a class="nav-link nav-link--account" href="${dash}">${UI.icon("i-user")}${UI.esc(user.name.split(" ")[0])}</a>
        <button class="nav-link nav-link--btn" type="button" data-logout>Log out</button>`;
    });
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-logout]")) return;
    AuthService.logout();
    UI.toast("You're logged out.");
    setTimeout(() => (window.location.href = "index.html"), 500);
  });

  /* ------------------------------------------------------------- accordion */
  function initAccordions() {
    document.querySelectorAll(".accordion__trigger").forEach((btn) => {
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", !open);
        document.getElementById(btn.getAttribute("aria-controls")).hidden = open;
      });
    });
  }

  /* ------------------------------------------------ search forms → jobs page */
  function initSearchForms() {
    document.querySelectorAll("form[data-job-search]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const p = new URLSearchParams();
        ["q", "location", "industry"].forEach((k) => {
          const v = form.elements[k] && form.elements[k].value.trim();
          if (v) p.set(k, v);
        });
        window.location.href = "jobs.html" + (p.toString() ? "?" + p : "");
      });
    });
  }

  /* --------------------------------------------------------- contact form */
  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!UI.validateForm(form)) return;
      const btn = form.querySelector("[type=submit]");
      UI.setBusy(btn, true, "Opening your email app…");
      await window.MSB.ContactService.send(Object.fromEntries(new FormData(form)));
      UI.setBusy(btn, false);
      form.reset();
      UI.toast("Your email app has opened with your message. Press Send there to reach us.", "info");
    });
  }

  /* ----------------------------------------------------- footer year, etc. */
  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initAccordions();
    initSearchForms();
    initContactForm();
    document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
    // Placeholder links (e.g. social icons without URLs yet)
    document.querySelectorAll("a[data-placeholder]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault(); UI.toast("Link coming soon — add the real URL in the HTML.", "info");
    }));
  });

  window.UI = UI;
})();

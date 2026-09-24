/* ==========================================================================
   auth.js — Login & Register page behaviour (DEMO)
   Talks only to MSB.AuthService (services.js). When real authentication is
   added, only services.js needs to change.
   ========================================================================== */

(function () {
  "use strict";
  const { AuthService } = window.MSB;
  const UI = window.UI;

  // Only allow internal relative redirects (prevents open-redirects via ?next=)
  function safeNext(fallback) {
    const n = UI.qs("next");
    return n && /^[a-z0-9-]+\.html([?#].*)?$/i.test(n) ? n : fallback;
  }
  const homeFor = (user) => (user.role === "employer" ? "employer-dashboard.html" : "candidate-dashboard.html");

  /* ----------------------------------------------------------------- login */
  function initLogin() {
    const form = document.getElementById("login-form");
    if (!form) return;

    const existing = AuthService.currentUser();
    if (existing) {
      const note = document.getElementById("already-in");
      note.hidden = false;
      note.querySelector("[data-name]").textContent = existing.name;
      note.querySelector("a").href = homeFor(existing);
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!UI.validateForm(form)) return;
      const btn = form.querySelector("[type=submit]");
      UI.setBusy(btn, true, "Logging in…");
      try {
        const user = await AuthService.login(form.email.value, form.password.value);
        UI.toast(`Welcome back, ${user.name.split(" ")[0]}.`);
        setTimeout(() => (window.location.href = safeNext(homeFor(user))), 500);
      } catch (err) {
        UI.setBusy(btn, false);
        const box = document.getElementById("login-error");
        box.textContent = err.message;
        box.hidden = false;
      }
    });

    document.getElementById("demo-login").addEventListener("click", async (e) => {
      UI.setBusy(e.currentTarget, true, "Opening demo…");
      await AuthService.loginDemo();
      window.location.href = safeNext("candidate-dashboard.html");
    });

    const demoEmp = document.getElementById("demo-login-employer");
    demoEmp && demoEmp.addEventListener("click", async (e) => {
      UI.setBusy(e.currentTarget, true, "Opening demo…");
      await AuthService.loginDemoEmployer();
      window.location.href = "employer-dashboard.html";
    });

    document.getElementById("toggle-password").addEventListener("click", togglePassword);
  }

  function togglePassword(e) {
    const btn = e.currentTarget;
    const input = document.getElementById(btn.getAttribute("aria-controls"));
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.textContent = show ? "Hide" : "Show";
    btn.setAttribute("aria-pressed", show);
  }

  /* -------------------------------------------------------------- register */
  function initRegister() {
    const form = document.getElementById("register-form");
    if (!form) return;

    const tabs = form.querySelectorAll("input[name=role]");
    const groups = form.querySelectorAll("[data-role-fields]");

    function setRole(role) {
      groups.forEach((g) => {
        const on = g.dataset.roleFields === role;
        g.hidden = !on;
        g.disabled = !on; // disabled fieldsets are skipped by validation & FormData
      });
      document.getElementById("register-submit").textContent =
        role === "employer" ? "Register as an employer" : "Create free profile";
    }

    const preset = UI.qs("role") === "employer" ? "employer" : "candidate";
    form.querySelector(`input[name=role][value=${preset}]`).checked = true;
    setRole(preset);
    tabs.forEach((t) => t.addEventListener("change", () => setRole(t.value)));

    form.querySelectorAll("[data-toggle-password]").forEach((b) => b.addEventListener("click", togglePassword));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!UI.validateForm(form)) return;
      const data = Object.fromEntries(new FormData(form));
      const btn = document.getElementById("register-submit");
      UI.setBusy(btn, true, "Creating account…");
      try {
        const user = await AuthService.register(data);
        UI.toast(user.role === "employer" ? "Employer account created (demo)." : "Your profile is ready.");
        setTimeout(() => (window.location.href = safeNext(homeFor(user))), 600);
      } catch (err) {
        UI.setBusy(btn, false);
        const box = document.getElementById("register-error");
        box.textContent = err.message;
        box.hidden = false;
        box.focus();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => { initLogin(); initRegister(); });
})();

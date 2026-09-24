/* ==========================================================================
   dashboard.js — Candidate dashboard (hash-routed views), application
   tracking timeline, and the "Check your job profile" questionnaire.
   ========================================================================== */

(function () {
  "use strict";
  const { JobService, ApplicationService, AuthService, ProfileService, NotificationService } = window.MSB;
  const UI = window.UI;
  const STAGES = ApplicationService.STAGES;

  const jobById = (id) => (window.MSB_JOBS || []).find((j) => j.id === id);

  /** Status badge: always text + icon so meaning never relies on colour alone. */
  function badge(app) {
    const status = ApplicationService.statusFor(app);
    const map = {
      "Submitted": ["badge--neutral", "i-send"],
      "Under review": ["badge--info", "i-eye"],
      "Shortlisted": ["badge--success", "i-star"],
      "Decision made": ["badge--dark", "i-check"],
      "Hired": ["badge--success", "i-check"],
      "Unsuccessful": ["badge--neutral", "i-info"]
    };
    const [cls, ic] = map[status] || map.Submitted;
    return `<span class="badge ${cls}">${UI.icon(ic, "icon icon--xs")}${status}</span>`;
  }

  /* ========================================================= DASHBOARD */
  function initDashboard() {
    const root = document.getElementById("dashboard");
    if (!root) return;

    const user = AuthService.currentUser();
    if (!user || user.role !== "candidate") {
      if (user && user.role === "employer") {
        const p = document.querySelector("#dash-gate p");
        p.innerHTML = `You're logged in as an employer. <a href="employer-dashboard.html">Go to the employer dashboard</a>, or switch to the demo candidate.`;
      }
      document.getElementById("dash-gate").hidden = false;
      root.hidden = true;
      document.getElementById("gate-demo").addEventListener("click", async (e) => {
        UI.setBusy(e.currentTarget, true, "Opening demo…");
        if (user) AuthService.logout();
        await AuthService.loginDemo();
        window.location.reload();
      });
      return;
    }

    ApplicationService.seedDemoApplications();
    root.hidden = false;
    document.querySelectorAll("[data-user-name]").forEach((el) => (el.textContent = user.name.split(" ")[0]));
    document.querySelectorAll("[data-user-full]").forEach((el) => (el.textContent = user.name));
    document.querySelectorAll("[data-user-email]").forEach((el) => (el.textContent = user.email));

    const views = [...document.querySelectorAll("[data-view]")];
    const links = [...document.querySelectorAll("[data-view-link]")];
    const sidebar = document.getElementById("dash-sidebar");
    const menuBtn = document.getElementById("dash-menu");
    const titleEl = document.getElementById("dash-view-title");

    const renderers = { overview, applications, saved, profile, documents, notifications, settings };
    let selectedApp = null;

    async function show(name) {
      if (!renderers[name]) name = "overview";
      views.forEach((v) => (v.hidden = v.dataset.view !== name));
      links.forEach((link) => {
        const on = link.dataset.viewLink === name;
        if (on) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
        if (on) titleEl.textContent = link.dataset.title || link.textContent.trim();
      });
      await renderers[name]();
      updateBell();
      setSidebar(false);
    }

    function route() { show((location.hash || "#overview").slice(1)); }
    window.addEventListener("hashchange", route);

    // Mobile sidebar drawer
    function setSidebar(open) {
      if (!sidebar) return;
      sidebar.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", open);
      document.body.classList.toggle("no-scroll", open);
    }
    menuBtn.addEventListener("click", () => setSidebar(!sidebar.classList.contains("is-open")));
    document.querySelectorAll("[data-close-sidebar]").forEach((b) => b.addEventListener("click", () => setSidebar(false)));
    document.addEventListener("msb:escape", () => setSidebar(false));

    function updateBell() {
      const n = NotificationService.unreadCount();
      document.querySelectorAll("[data-unread]").forEach((el) => { el.textContent = n; el.hidden = n === 0; });
    }

    /* ----------------------------------------------------------- overview */
    async function overview() {
      const [apps, jobs] = [await ApplicationService.getApplications(), await JobService.getJobs()];
      const savedIds = JobService.getSavedIds();
      const comp = ProfileService.completion();

      document.getElementById("stat-apps").textContent = apps.length;
      document.getElementById("stat-saved").textContent = savedIds.length;
      document.getElementById("stat-shortlisted").textContent = apps.filter((a) => a.stage >= 3).length;

      // Profile completion ring
      const ring = document.getElementById("completion-ring");
      ring.style.setProperty("--p", comp.percent);
      ring.setAttribute("aria-valuenow", comp.percent);
      document.getElementById("completion-value").textContent = comp.percent + "%";
      document.getElementById("completion-missing").innerHTML = comp.missing.length
        ? comp.missing.slice(0, 4).map((f) => `<li>${UI.icon("i-plus", "icon icon--xs")}Add ${f.label.toLowerCase()}</li>`).join("")
        : `<li>${UI.icon("i-check", "icon icon--xs")}Your profile is complete</li>`;

      document.getElementById("recent-apps").innerHTML = apps.length
        ? apps.slice(0, 4).map((a) => appRow(a)).join("")
        : `<li class="empty-inline">You haven't applied yet. <a href="jobs.html">Find jobs</a></li>`;

      // Recommended = featured jobs not yet applied for
      const appliedIds = apps.map((a) => a.jobId);
      document.getElementById("recommended").innerHTML = jobs
        .filter((j) => !appliedIds.includes(j.id)).slice(0, 3).map(UI.jobCard).join("");
    }

    function appRow(a) {
      const j = jobById(a.jobId);
      if (!j) return "";
      return `<li class="app-row">
        <div class="app-row__main">
          <a class="app-row__title" href="job-details.html?id=${j.id}">${UI.esc(j.title)}</a>
          <span class="app-row__meta">${UI.esc(j.location.split(",")[0])} · Applied ${UI.formatDate(a.appliedOn)}</span>
        </div>
        ${badge(a)}
        <a class="btn btn--ghost btn--sm" href="#applications" data-track="${a.id}">Track</a>
      </li>`;
    }

    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-track]");
      if (t) selectedApp = t.dataset.track;
    });

    /* ------------------------------------------------------- applications */
    async function applications() {
      const apps = await ApplicationService.getApplications();
      const list = document.getElementById("app-list");
      const panel = document.getElementById("app-timeline");
      if (!apps.length) {
        list.innerHTML = `<li class="empty-inline">No applications yet. <a href="jobs.html">Browse jobs</a> to get started.</li>`;
        panel.innerHTML = "";
        return;
      }
      if (!selectedApp || !apps.find((a) => a.id === selectedApp)) selectedApp = apps[0].id;
      list.innerHTML = apps.map((a) => {
        const j = jobById(a.jobId);
        return `<li><button type="button" class="app-select ${a.id === selectedApp ? "is-active" : ""}" data-select-app="${a.id}" aria-pressed="${a.id === selectedApp}">
          <span class="app-select__title">${UI.esc(j ? j.title : a.jobId)}</span>
          <span class="app-select__meta">${UI.esc(j ? j.location : "")}</span>
          ${badge(a)}</button></li>`;
      }).join("");
      renderTimeline(apps.find((a) => a.id === selectedApp));
    }

    function renderTimeline(app) {
      const j = jobById(app.jobId);
      const panel = document.getElementById("app-timeline");
      panel.innerHTML = `
        <div class="timeline-card">
          <div class="timeline-card__head">
            <div>
              <h3>${UI.esc(j.title)}</h3>
              <p class="muted">${UI.esc(j.location)} · Applied ${UI.formatDate(app.appliedOn)}${app.cvFileName ? " · CV: " + UI.esc(app.cvFileName) : ""}</p>
            </div>
            ${badge(app)}
          </div>
          <ol class="timeline">
            ${STAGES.map((s, i) => {
              const state = i < app.stage ? "done" : i === app.stage ? "current" : "upcoming";
              let txt = { done: "Completed", current: "In progress", upcoming: "Not started" }[state];
              if (state === "current" && app.outcome) txt = app.outcome === "hired" ? "Selected – hired" : "Not progressed";
              return `<li class="timeline__step is-${state}" ${state === "current" ? 'aria-current="step"' : ""}>
                <span class="timeline__dot" aria-hidden="true">${state === "done" ? UI.icon("i-check", "icon icon--xs") : ""}</span>
                <div><p class="timeline__label">${s.label}</p><p class="timeline__state">${txt}</p></div>
              </li>`;
            }).join("")}
          </ol>
          ${app.employerEmail ? `<p class="demo-controls__label">${UI.icon("i-info", "icon icon--xs")}The employer updates this status. You'll get a notification when it changes.</p>
          <div class="demo-controls__btns"><button type="button" class="btn btn--danger-ghost btn--sm" data-withdraw>Withdraw</button></div>` : `
          <div class="demo-controls" role="group" aria-label="Demo status controls">
            <p class="demo-controls__label">${UI.icon("i-info", "icon icon--xs")}Demo only: simulate the employer moving this application.</p>
            <div class="demo-controls__btns">
              <button type="button" class="btn btn--ghost btn--sm" data-stage="-1" ${app.stage === 0 ? "disabled" : ""}>Previous stage</button>
              <button type="button" class="btn btn--primary btn--sm" data-stage="1" ${app.stage === STAGES.length - 1 ? "disabled" : ""}>Next stage</button>
              <button type="button" class="btn btn--danger-ghost btn--sm" data-withdraw>Withdraw</button>
            </div>
          </div>`}
        </div>`;

      panel.querySelectorAll("[data-stage]").forEach((b) => b.addEventListener("click", async () => {
        const updated = await ApplicationService.setStage(app.id, app.stage + Number(b.dataset.stage));
        UI.toast(`Status updated: ${STAGES[updated.stage].label}.`);
        applications(); updateBell();
      }));
      panel.querySelector("[data-withdraw]").addEventListener("click", () => {
        UI.openModal({
          title: "Withdraw this application?",
          body: `<p>Your application for <strong>${UI.esc(j.title)}</strong> will be removed. You can apply again later if the job is still open.</p>`,
          actions: `<button class="btn btn--ghost" data-close-modal type="button">Keep application</button>
                    <button class="btn btn--danger" type="button" id="confirm-withdraw">Withdraw application</button>`
        });
        document.getElementById("confirm-withdraw").addEventListener("click", async () => {
          await ApplicationService.withdraw(app.id);
          UI.closeModal(); selectedApp = null;
          UI.toast("Application withdrawn.");
          applications();
        });
      });
    }

    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-select-app]");
      if (!b) return;
      selectedApp = b.dataset.selectApp;
      applications().then(() => {
        if (window.innerWidth < 900) document.getElementById("app-timeline").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    /* -------------------------------------------------------------- saved */
    async function saved() {
      const ids = JobService.getSavedIds();
      const jobs = (await JobService.getJobs()).filter((j) => ids.includes(j.id));
      document.getElementById("saved-grid").innerHTML = jobs.length
        ? jobs.map(UI.jobCard).join("")
        : `<div class="empty-state">${UI.icon("i-bookmark", "icon empty-state__icon")}
           <h3>No saved jobs yet</h3><p>Tap the bookmark on any job to keep it here.</p>
           <a class="btn btn--primary" href="jobs.html">Find jobs</a></div>`;
    }
    document.addEventListener("msb:saved-changed", () => {
      if (!document.querySelector('[data-view="saved"]').hidden) saved();
    });

    /* ------------------------------------------------------------ profile */
    async function profile() {
      const form = document.getElementById("profile-form");
      const p = ProfileService.get();
      ["fullName", "phone", "country", "headline", "location", "skills", "experience"].forEach((k) => {
        if (form.elements[k]) form.elements[k].value = p[k] || "";
      });
    }
    document.getElementById("profile-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      if (!UI.validateForm(form)) return;
      ProfileService.save(Object.fromEntries(new FormData(form)));
      UI.toast(`Profile saved. ${ProfileService.completion().percent}% complete.`);
    });

    /* ---------------------------------------------------------- documents */
    async function documents() {
      const p = ProfileService.get();
      document.getElementById("cv-current").innerHTML = p.cvFileName
        ? `${UI.icon("i-doc")}<span><strong>${UI.esc(p.cvFileName)}</strong><br><span class="muted">Recorded ${UI.esc(p.cvDate || "")}</span></span>
           <button type="button" class="btn btn--ghost btn--sm" id="cv-remove">Remove</button>`
        : `${UI.icon("i-doc")}<span class="muted">No CV added yet.</span>`;
      const rm = document.getElementById("cv-remove");
      rm && rm.addEventListener("click", () => { ProfileService.save({ cvFileName: "", cvDate: "" }); documents(); UI.toast("CV removed."); });
    }
    document.getElementById("cv-input").addEventListener("change", (e) => {
      const f = e.target.files[0];
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) { UI.toast("That file is over 5 MB. Upload a smaller PDF or Word file.", "error"); e.target.value = ""; return; }
      // Only the file NAME is kept. The file itself is never stored in localStorage.
      ProfileService.save({ cvFileName: f.name, cvDate: UI.formatDate(new Date().toISOString().slice(0, 10)) });
      e.target.value = "";
      documents();
      UI.toast("CV added to your profile.");
    });

    /* ------------------------------------------------------ notifications */
    async function notifications() {
      const list = NotificationService.list();
      document.getElementById("note-list").innerHTML = list.length
        ? list.map((n) => `<li class="note ${n.read ? "" : "is-unread"}">${UI.icon("i-bell")}<div><p>${UI.esc(n.text)}</p><span class="muted">${UI.formatDate(n.date)}${n.read ? "" : " · New"}</span></div></li>`).join("")
        : `<li class="empty-inline">No notifications yet. Updates about your applications appear here.</li>`;
    }
    document.getElementById("mark-read").addEventListener("click", () => {
      NotificationService.markAllRead(); notifications(); updateBell(); UI.toast("All notifications marked as read.");
    });

    /* ----------------------------------------------------------- settings */
    async function settings() {}
    document.getElementById("reset-demo").addEventListener("click", () => {
      UI.openModal({
        title: "Reset demo data?",
        body: "<p>This clears your demo applications, saved jobs, notifications and profile details from this browser.</p>",
        actions: `<button class="btn btn--ghost" data-close-modal type="button">Cancel</button>
                  <button class="btn btn--danger" id="confirm-reset" type="button">Reset demo data</button>`
      });
      document.getElementById("confirm-reset").addEventListener("click", () => {
        const S = window.MSB.Store;
        ["msb_apps_", "msb_profile_", "msb_notes_"].forEach((k) => S.remove(k + user.email));
        S.remove("msb_saved_jobs");
        UI.closeModal(); UI.toast("Demo data reset.");
        location.hash = "#overview"; route();
      });
    });

    route();
  }

  /* ====================================================== PROFILE CHECK
     A general comparison between what the user enters and a listing's
     stated criteria. NOT employment, migration or visa advice.        */
  const QUAL_RANK = { none: 0, certificate: 1, diploma: 2, bachelor: 3, postgraduate: 4 };
  const QUAL_LABEL = { none: "No formal qualification", certificate: "Certificate III / IV", diploma: "Diploma / Advanced Diploma", bachelor: "Bachelor degree", postgraduate: "Postgraduate degree" };

  function requiredQual(text) {
    const t = text.toLowerCase();
    if (/no formal/.test(t)) return 0;
    if (/master|postgrad/.test(t)) return 4;
    if (/bachelor|degree/.test(t)) return 3;
    if (/diploma/.test(t)) return 2;
    if (/certificate|trade/.test(t)) return 1;
    return 0;
  }
  const requiredYears = (job) => { const m = job.experience.match(/(\d+)/); return m ? Number(m[1]) : 0; };

  function initProfileCheck() {
    const form = document.getElementById("profile-check-form");
    if (!form) return;
    const select = form.elements.occupation;
    select.innerHTML = `<option value="">Choose a role</option>` +
      window.MSB_JOBS.map((j) => `<option value="${j.id}">${UI.esc(j.title)} (${UI.esc(j.location)})</option>`).join("");
    const pre = UI.qs("job");
    if (pre) select.value = pre;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!UI.validateForm(form)) return;
      const job = window.MSB_JOBS.find((j) => j.id === select.value);
      const years = Number(form.years.value);
      const qual = form.qualification.value;
      const skillsIn = form.skills.value.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      const loc = form.location.value;
      const eng = form.english.value;

      const needYears = requiredYears(job);
      const needQual = requiredQual(job.qualification);
      const matched = job.skills.filter((s) => skillsIn.some((u) => s.toLowerCase().includes(u) || u.includes(s.toLowerCase())));

      const rows = [
        {
          label: "Experience",
          ok: years >= needYears,
          text: years >= needYears ? "Matches listed experience" : `Listing asks for ${job.experience.toLowerCase()}; you entered ${years} ${years === 1 ? "year" : "years"}`
        },
        {
          label: "Qualification",
          ok: QUAL_RANK[qual] >= needQual,
          text: QUAL_RANK[qual] >= needQual ? "Meets listed qualification level" : `Listing mentions: ${job.qualification}`
        },
        {
          label: "Skills",
          ok: matched.length >= Math.ceil(job.skills.length / 2),
          text: matched.length >= Math.ceil(job.skills.length / 2)
            ? `${matched.length} of ${job.skills.length} listed skills matched`
            : `Review required: ${matched.length} of ${job.skills.length} listed skills matched`
        },
        {
          label: "Location",
          ok: loc === job.state,
          text: loc === job.state ? `You're in the same state (${job.state})` : `Role is in ${job.location}. Check whether you can work there`
        },
        {
          label: "English",
          ok: null,
          text: `You rated yourself: ${eng}. Check any language requirements the employer lists`
        }
      ];

      const out = document.getElementById("profile-check-result");
      out.hidden = false;
      out.innerHTML = `
        <div class="result-card__head">
          <h3>Profile summary</h3>
          <p class="muted">Compared with: <a href="job-details.html?id=${job.id}">${UI.esc(job.title)}, ${UI.esc(job.location)}</a></p>
        </div>
        <ul class="result-list">
          ${rows.map((r) => {
            const st = r.ok === null ? ["info", "i-info", "For your information"] : r.ok ? ["ok", "i-check", "Matches"] : ["review", "i-alert", "Review"];
            return `<li class="result-row is-${st[0]}">
              <span class="result-row__icon">${UI.icon(st[1])}</span>
              <div><p class="result-row__label">${r.label} <span class="result-row__state">${st[2]}</span></p><p>${UI.esc(r.text)}</p></div>
            </li>`;
          }).join("")}
        </ul>
        <p class="disclaimer">${UI.icon("i-info", "icon icon--xs")}This tool provides a general profile comparison based on information entered by the user. It does not determine employment eligibility, visa eligibility or immigration outcomes.</p>
        <div class="btn-row">
          <a class="btn btn--primary" href="job-details.html?id=${job.id}">View job details</a>
          <button type="button" class="btn btn--ghost" id="check-again">Check another role</button>
        </div>`;
      out.focus();
      out.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById("check-again").addEventListener("click", () => {
        out.hidden = true; form.reset(); select.focus();
      });
    });

    // Pre-fill qualification labels
    form.qualification.innerHTML = `<option value="">Choose your highest qualification</option>` +
      Object.entries(QUAL_LABEL).map(([k, v]) => `<option value="${k}">${v}</option>`).join("");
  }

  document.addEventListener("DOMContentLoaded", () => { initDashboard(); initProfileCheck(); });
})();

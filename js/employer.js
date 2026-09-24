/* ==========================================================================
   employer.js — Employer dashboard (hash-routed views)
   Post / edit / close jobs, review applicants through the hiring pipeline,
   hire, and assign new employees to a site, team, supervisor and shift.
   Data comes only from MSB.EmployerService (services.js).
   ========================================================================== */

(function () {
  "use strict";
  const { AuthService, EmployerService: ES, NotificationService, Store } = window.MSB;
  const UI = window.UI;
  const STAGES = ES.STAGES;
  const STAGE_SHORT = ["New", "Screening", "Reviewing", "Interview", "Decision"];

  const initials = (name) => String(name || "?").split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const expLabel = (v) => (window.MSB_EXPERIENCE_LEVELS || {})[v] || "Not stated";

  function stageBadge(a) {
    if (a.outcome === "hired") return `<span class="badge badge--success">${UI.icon("i-check", "icon icon--xs")}Hired</span>`;
    if (a.outcome === "unsuccessful") return `<span class="badge badge--neutral">${UI.icon("i-close", "icon icon--xs")}Unsuccessful</span>`;
    const cls = ["badge--info", "badge--neutral", "badge--neutral", "badge--success", "badge--dark"][a.stage];
    const ic = ["i-send", "i-doc", "i-eye", "i-calendar", "i-clipboard"][a.stage];
    return `<span class="badge ${cls}">${UI.icon(ic, "icon icon--xs")}${STAGE_SHORT[a.stage]}</span>`;
  }

  function init() {
    const root = document.getElementById("dashboard");
    if (!root) return;
    const user = AuthService.currentUser();

    if (!user || user.role !== "employer") {
      const gate = document.getElementById("dash-gate");
      gate.hidden = false;
      if (user) document.getElementById("gate-text").innerHTML =
        `You're logged in as a candidate. <a href="candidate-dashboard.html">Go to your candidate dashboard</a>, or switch to the demo employer.`;
      document.getElementById("gate-demo").addEventListener("click", async (e) => {
        UI.setBusy(e.currentTarget, true, "Opening demo…");
        if (user) AuthService.logout();
        await AuthService.loginDemoEmployer();
        window.location.reload();
      });
      return;
    }
    root.hidden = false;

    let jobs = [], applicants = [], employees = [];
    let selectedApplicant = null, jobFilter = "all", empFilter = "all";
    const jobById = (id) => jobs.find((j) => j.id === id) || (window.MSB_JOBS || []).find((j) => j.id === id);

    async function load() {
      [jobs, applicants, employees] = await Promise.all([ES.myJobs(), ES.applicants(), ES.employees()]);
    }

    function fillIdentity() {
      const c = ES.company();
      document.querySelectorAll("[data-user-name]").forEach((el) => (el.textContent = (c.contactPerson || user.name).split(" ")[0]));
      document.querySelectorAll("[data-company-name]").forEach((el) => (el.textContent = c.companyName || user.name));
      document.querySelectorAll("[data-user-email]").forEach((el) => (el.textContent = user.email));
    }
    fillIdentity();

    /* ------------------------------------------------------------ routing */
    const views = [...document.querySelectorAll("[data-view]")];
    const links = [...document.querySelectorAll("[data-view-link]")];
    const sidebar = document.getElementById("dash-sidebar");
    const menuBtn = document.getElementById("dash-menu");
    const titleEl = document.getElementById("dash-view-title");
    const renderers = { overview, jobs: jobPosts, post: postForm, applicants: applicantsView, employees: employeesView, company, notifications, settings };

    async function show(name) {
      if (!renderers[name]) name = "overview";
      await load();
      views.forEach((v) => {
        const on = v.dataset.view === name;
        v.hidden = !on;
        if (on) { v.classList.remove("view-enter"); void v.offsetWidth; v.classList.add("view-enter"); }
      });
      links.forEach((link) => {
        const on = link.dataset.viewLink === name;
        if (on) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
        if (on) titleEl.textContent = link.dataset.title || link.textContent.trim();
      });
      document.querySelector(".dash-top__cta").hidden = name === "post";
      await renderers[name]();
      updateBadges();
      setSidebar(false);
    }
    const route = () => show((location.hash || "#overview").slice(1));
    window.addEventListener("hashchange", route);

    function setSidebar(open) {
      sidebar.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", open);
      document.body.classList.toggle("no-scroll", open);
    }
    menuBtn.addEventListener("click", () => setSidebar(!sidebar.classList.contains("is-open")));
    document.querySelectorAll("[data-close-sidebar]").forEach((b) => b.addEventListener("click", () => setSidebar(false)));
    document.addEventListener("msb:escape", () => setSidebar(false));

    function setCount(sel, n) { document.querySelectorAll(sel).forEach((el) => { el.textContent = n; el.hidden = n === 0; }); }
    function updateBadges() {
      setCount("[data-unread]", NotificationService.unreadCount());
      setCount("[data-new-applicants]", applicants.filter((a) => a.stage === 0 && !a.outcome).length);
      setCount("[data-unassigned]", employees.filter((e) => !e.assignment).length);
    }

    /* ----------------------------------------------------------- overview */
    function overview() {
      const active = applicants.filter((a) => !a.outcome);
      document.getElementById("st-jobs").textContent = jobs.filter((j) => j.status === "open").length;
      document.getElementById("st-apps").textContent = applicants.length;
      document.getElementById("st-interview").textContent = active.filter((a) => a.stage === 3).length;
      document.getElementById("st-hired").textContent = applicants.filter((a) => a.outcome === "hired").length;

      const rows = STAGES.map((s, i) => ({ label: s.label, n: active.filter((a) => a.stage === i).length, cls: "" }))
        .concat([{ label: "Hired", n: applicants.filter((a) => a.outcome === "hired").length, cls: "is-hired" },
                 { label: "Unsuccessful", n: applicants.filter((a) => a.outcome === "unsuccessful").length, cls: "is-muted" }]);
      const max = Math.max(1, ...rows.map((r) => r.n));
      const pipe = document.getElementById("pipeline");
      pipe.innerHTML = rows.map((r) => `<li class="pipeline__row ${r.cls}">
          <span class="pipeline__label">${r.label}</span>
          <span class="pipeline__track"><span class="pipeline__bar" style="--w:${(r.n / max) * 100}%"></span></span>
          <span class="pipeline__n">${r.n}</span></li>`).join("");
      requestAnimationFrame(() => requestAnimationFrame(() => pipe.classList.add("is-drawn")));

      const un = employees.filter((e) => !e.assignment);
      document.getElementById("unassigned-list").innerHTML = un.length
        ? un.map((e) => `<li class="mini-row"><span class="avatar avatar--sm" aria-hidden="true">${initials(e.name)}</span>
            <span class="mini-row__main"><strong>${UI.esc(e.name)}</strong><span>${UI.esc(e.role)}</span></span>
            <button type="button" class="btn btn--primary btn--sm" data-assign="${e.id}">Assign</button></li>`).join("")
        : `<li class="empty-inline">${UI.icon("i-check", "icon icon--xs")} Everyone you've hired has an assignment.</li>`;

      const recent = applicants.slice().sort((a, b) => b.appliedOn.localeCompare(a.appliedOn)).slice(0, 5);
      document.getElementById("recent-applicants").innerHTML = recent.length
        ? recent.map((a) => {
          const j = jobById(a.jobId);
          return `<li class="app-row">
            <div class="app-row__main"><span class="app-row__title">${UI.esc(a.name)}</span>
              <span class="app-row__meta">${UI.esc(j ? j.title : "")} · Applied ${UI.formatDate(a.appliedOn)}</span></div>
            ${stageBadge(a)}
            <a class="btn btn--ghost btn--sm" href="#applicants" data-open-applicant="${a.id}">Review</a></li>`;
        }).join("")
        : `<li class="empty-inline">No applicants yet. Once candidates apply for your jobs they'll appear here.</li>`;

      document.getElementById("overview-jobs").innerHTML = jobs.length
        ? jobs.slice(0, 3).map(postCard).join("")
        : emptyJobs();
    }

    /* -------------------------------------------------------------- jobs */
    const emptyJobs = () => `<div class="empty-state">${UI.icon("i-briefcase", "icon empty-state__icon")}
      <h3>No job posts yet</h3><p>Post your first vacancy and it will appear on the public Jobs page.</p>
      <a class="btn btn--primary" href="#post" data-new-job>Post a job</a></div>`;

    function postCard(j) {
      const list = applicants.filter((a) => a.jobId === j.id);
      const open = j.status === "open";
      return `<article class="post-card ${open ? "" : "is-closed"}">
        <div class="post-card__top">
          <span class="badge ${open ? "badge--success" : "badge--neutral"}">${open ? "Open" : "Closed"}</span>
          <span class="post-card__date">Posted ${UI.formatDate(j.postedDate)}</span>
        </div>
        <h3 class="post-card__title">${UI.esc(j.title)}</h3>
        <p class="post-card__meta">${UI.icon("i-pin", "icon icon--xs")}${UI.esc(j.location)} · ${UI.esc(j.employment)}</p>
        <p class="post-card__meta">${UI.icon("i-calendar", "icon icon--xs")}Closes ${UI.formatDate(j.deadline)}</p>
        <div class="post-card__stats">
          <span><strong>${list.length}</strong> applicants</span>
          <span><strong>${list.filter((a) => a.stage === 3 && !a.outcome).length}</strong> interview</span>
          <span><strong>${list.filter((a) => a.outcome === "hired").length}</strong> hired</span>
        </div>
        <div class="post-card__actions">
          <a class="btn btn--primary btn--sm" href="#applicants" data-filter-job="${j.id}">Applicants</a>
          <button type="button" class="btn btn--ghost btn--sm" data-edit-job="${j.id}">Edit</button>
          <button type="button" class="btn btn--ghost btn--sm" data-toggle-job="${j.id}">${open ? "Close" : "Reopen"}</button>
          ${open ? `<a class="btn btn--ghost btn--sm" href="job-details.html?id=${encodeURIComponent(j.id)}">View listing</a>` : ""}
          <button type="button" class="btn btn--danger-ghost btn--sm" data-delete-job="${j.id}">Delete</button>
        </div>
      </article>`;
    }

    function jobPosts() {
      const list = jobs.filter((j) => jobFilter === "all" || j.status === jobFilter);
      document.getElementById("job-posts").innerHTML = jobs.length
        ? (list.length ? list.map(postCard).join("") : `<p class="empty-inline">No ${jobFilter} job posts.</p>`)
        : emptyJobs();
    }
    document.querySelectorAll("[data-job-filter]").forEach((b) => b.addEventListener("click", () => {
      jobFilter = b.dataset.jobFilter;
      document.querySelectorAll("[data-job-filter]").forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-pressed", x === b); });
      jobPosts();
    }));

    /* ---------------------------------------------------------- post form */
    const form = document.getElementById("job-form");
    let editingId = null;
    function postForm() {
      const j = editingId ? jobs.find((x) => x.id === editingId) : null;
      form.reset();
      form.querySelectorAll("[aria-invalid]").forEach((f) => UI.setFieldError(f, ""));
      document.getElementById("job-form-title").textContent = j ? "Edit job" : "Job details";
      document.getElementById("job-submit").innerHTML = UI.icon("i-send") + (j ? "Save changes" : "Publish job");
      titleEl.textContent = j ? "Edit job post" : "Post a job";
      const el = form.elements;
      if (j) {
        el.title.value = j.title; el.category.value = j.category; el.employment.value = j.employment;
        el.city.value = j.city || j.location.split(",")[0]; el.state.value = j.state; el.experienceLevel.value = j.experienceLevel;
        el.salary.value = j.salary === "Not disclosed" ? "" : j.salary; el.qualification.value = j.qualification;
        el.deadline.value = j.deadline; el.description.value = j.description;
        el.responsibilities.value = (j.responsibilities || []).join("\n"); el.requirements.value = (j.requirements || []).join("\n");
        el.skills.value = (j.skills || []).join(", ");
      } else {
        el.deadline.value = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
        const c = ES.company(); if (c.industry) el.category.value = c.industry;
      }
    }
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!UI.validateForm(form)) return;
      const btn = document.getElementById("job-submit");
      const data = Object.fromEntries(new FormData(form));
      UI.setBusy(btn, true, editingId ? "Saving…" : "Publishing…");
      try {
        if (editingId) { await ES.updateJob(editingId, data); UI.toast("Job post updated."); }
        else { const j = await ES.postJob(data); UI.toast(`"${j.title}" is now live on the Jobs page.`); }
        editingId = null;
        UI.setBusy(btn, false);
        location.hash = "#jobs";
      } catch (err) { UI.setBusy(btn, false); UI.toast(err.message, "error"); }
    });

    /* --------------------------------------------------------- applicants */
    const fJob = document.getElementById("f-job"), fStage = document.getElementById("f-stage"), fQ = document.getElementById("f-q");
    [fJob, fStage].forEach((el) => el.addEventListener("change", () => { selectedApplicant = null; applicantsView(); }));
    fQ.addEventListener("input", () => applicantsView());

    function filteredApplicants() {
      const q = fQ.value.trim().toLowerCase();
      return applicants.filter((a) => {
        if (fJob.value && a.jobId !== fJob.value) return false;
        if (fStage.value === "hired" || fStage.value === "unsuccessful") { if (a.outcome !== fStage.value) return false; }
        else if (fStage.value !== "" && (a.outcome || String(a.stage) !== fStage.value)) return false;
        if (q && !(a.name + " " + a.skills + " " + a.headline).toLowerCase().includes(q)) return false;
        return true;
      });
    }

    function applicantsView() {
      const current = fJob.value;
      fJob.innerHTML = `<option value="">All jobs</option>` + jobs.map((j) => `<option value="${j.id}">${UI.esc(j.title)}</option>`).join("");
      fJob.value = current;
      const list = filteredApplicants();
      const ul = document.getElementById("applicant-list");
      const detail = document.getElementById("applicant-detail");
      if (!list.length) {
        ul.innerHTML = `<li class="empty-inline">${applicants.length ? "No applicants match these filters." : "No applicants yet. Share your job posts to start receiving applications."}</li>`;
        detail.innerHTML = "";
        return;
      }
      if (!selectedApplicant || !list.some((a) => a.id === selectedApplicant)) selectedApplicant = list[0].id;
      ul.innerHTML = list.map((a) => {
        const j = jobById(a.jobId);
        const on = a.id === selectedApplicant;
        return `<li><button type="button" class="app-select app-select--person ${on ? "is-active" : ""}" data-select-applicant="${a.id}" aria-pressed="${on}">
          <span class="avatar avatar--sm" aria-hidden="true">${initials(a.name)}</span>
          <span class="app-select__body"><span class="app-select__title">${UI.esc(a.name)}</span>
          <span class="app-select__meta">${UI.esc(j ? j.title : "")}</span>${stageBadge(a)}</span></button></li>`;
      }).join("");
      renderApplicant(applicants.find((a) => a.id === selectedApplicant));
    }

    function renderApplicant(a) {
      const j = jobById(a.jobId);
      const detail = document.getElementById("applicant-detail");
      const last = STAGES.length - 1;
      const skills = String(a.skills || "").split(",").map((s) => s.trim()).filter(Boolean);
      const emp = employees.find((e) => e.applicantId === a.id);
      detail.innerHTML = `<div class="timeline-card applicant-card">
        <div class="applicant-card__head">
          <span class="avatar avatar--lg" aria-hidden="true">${initials(a.name)}</span>
          <div class="applicant-card__who"><h3>${UI.esc(a.name)}</h3>
            <p class="muted">${UI.esc(a.headline || "Candidate")} · applied for <strong>${UI.esc(j ? j.title : "")}</strong></p></div>
          ${stageBadge(a)}
        </div>
        <dl class="info-grid">
          <div><dt>Email</dt><dd><a href="mailto:${UI.esc(a.email)}">${UI.esc(a.email)}</a></dd></div>
          <div><dt>Phone</dt><dd>${UI.esc(a.phone || "Not provided")}</dd></div>
          <div><dt>Location</dt><dd>${UI.esc(a.location || "Not provided")}</dd></div>
          <div><dt>Experience</dt><dd>${UI.esc(expLabel(a.experience))}</dd></div>
          <div><dt>Applied</dt><dd>${UI.formatDate(a.appliedOn)}</dd></div>
          <div><dt>CV</dt><dd>${a.cvFileName ? UI.icon("i-doc", "icon icon--xs") + " " + UI.esc(a.cvFileName) : "Not provided"}</dd></div>
        </dl>
        ${skills.length ? `<div class="skill-chips">${skills.map((s) => `<span class="skill-chip">${UI.esc(s)}</span>`).join("")}</div>` : ""}
        ${a.coverNote ? `<blockquote class="cover-note">${UI.esc(a.coverNote)}</blockquote>` : ""}
        <h4 class="applicant-card__sub">Hiring stage</h4>
        <ol class="timeline timeline--compact">
          ${STAGES.map((s, i) => {
            const state = i < a.stage ? "done" : i === a.stage ? (a.outcome ? "done" : "current") : "upcoming";
            let txt = { done: "Completed", current: "Current stage", upcoming: "Not started" }[state];
            if (i === last && a.outcome) txt = a.outcome === "hired" ? "Hired" : "Unsuccessful";
            return `<li class="timeline__step is-${state}"><span class="timeline__dot" aria-hidden="true">${state === "done" ? UI.icon("i-check", "icon icon--xs") : ""}</span>
              <div><p class="timeline__label">${s.label}</p><p class="timeline__state">${txt}</p></div></li>`;
          }).join("")}
        </ol>
        <div class="stage-actions">
          ${a.outcome ? `
            ${a.outcome === "hired" ? `<a class="btn btn--primary btn--sm" href="#employees" data-assign-after="${emp ? emp.id : ""}">${UI.icon("i-clipboard")}${emp && emp.assignment ? "View assignment" : "Assign to a site"}</a>` : ""}
            <button type="button" class="btn btn--ghost btn--sm" data-reopen="${a.id}">Reopen application</button>`
          : `
            <button type="button" class="btn btn--ghost btn--sm" data-move="${a.id}" data-dir="-1" ${a.stage === 0 ? "disabled" : ""}>Move back</button>
            ${a.stage < last ? `<button type="button" class="btn btn--primary btn--sm" data-move="${a.id}" data-dir="1">Move to ${STAGES[a.stage + 1].label.toLowerCase()}</button>` : ""}
            <button type="button" class="btn btn--success btn--sm" data-outcome="hired" data-id="${a.id}">${UI.icon("i-check")}Hire</button>
            <button type="button" class="btn btn--danger-ghost btn--sm" data-outcome="unsuccessful" data-id="${a.id}">Not suitable</button>`}
        </div>
        ${a.candidateEmail ? `<p class="field__hint">${UI.icon("i-info", "icon icon--xs")} This candidate applied through the site. They're notified when you change their stage.</p>` : ""}
        <div class="field applicant-note"><label for="a-note">Private note</label>
          <textarea id="a-note" rows="3" maxlength="1000" placeholder="Interview feedback, reference checks…">${UI.esc(a.note || "")}</textarea>
          <button type="button" class="btn btn--ghost btn--sm" data-save-note="${a.id}">Save note</button></div>
      </div>`;
    }

    async function refresh(viewFn) { await load(); viewFn(); updateBadges(); }

    /* ---------------------------------------------------------- employees */
    function employeesView() {
      const list = employees.filter((e) => empFilter === "all" || (empFilter === "assigned" ? e.assignment : !e.assignment));
      const grid = document.getElementById("employee-grid");
      if (!employees.length) {
        grid.innerHTML = `<div class="empty-state">${UI.icon("i-users", "icon empty-state__icon")}<h3>No employees yet</h3>
          <p>When you hire an applicant they'll appear here, ready to be assigned.</p><a class="btn btn--primary" href="#applicants">Review applicants</a></div>`;
        return;
      }
      grid.innerHTML = list.length ? list.map((e) => {
        const s = e.assignment;
        return `<article class="emp-card ${s ? "is-assigned" : "is-unassigned"}">
          <div class="emp-card__head">
            <span class="avatar" aria-hidden="true">${initials(e.name)}</span>
            <div class="emp-card__who"><h3>${UI.esc(e.name)}</h3><p>${UI.esc(e.role)}</p></div>
            <span class="badge ${s ? "badge--success" : "badge--warn"}">${s ? "Assigned" : "Unassigned"}</span>
          </div>
          ${s ? `<dl class="emp-card__facts">
              <div><dt>${UI.icon("i-pin", "icon icon--xs")}Site</dt><dd>${UI.esc(s.site)}</dd></div>
              <div><dt>${UI.icon("i-users", "icon icon--xs")}Team</dt><dd>${UI.esc(s.team || "—")}</dd></div>
              <div><dt>${UI.icon("i-user", "icon icon--xs")}Supervisor</dt><dd>${UI.esc(s.supervisor || "—")}</dd></div>
              <div><dt>${UI.icon("i-calendar", "icon icon--xs")}Starts</dt><dd>${UI.formatDate(s.startDate)}</dd></div>
              <div><dt>${UI.icon("i-clock", "icon icon--xs")}Shift</dt><dd>${UI.esc(s.shift || "—")}</dd></div>
            </dl>${s.notes ? `<p class="emp-card__notes">${UI.esc(s.notes)}</p>` : ""}`
            : `<p class="emp-card__empty">Hired ${UI.formatDate(e.hiredOn)}. Not yet assigned to a site or team.</p>`}
          <div class="emp-card__actions">
            <button type="button" class="btn ${s ? "btn--ghost" : "btn--primary"} btn--sm" data-assign="${e.id}">${s ? "Edit assignment" : "Assign now"}</button>
            ${s ? `<button type="button" class="btn btn--danger-ghost btn--sm" data-unassign="${e.id}">Unassign</button>` : ""}
            <a class="btn btn--ghost btn--sm" href="mailto:${UI.esc(e.email)}">${UI.icon("i-mail")}Email</a>
          </div>
        </article>`;
      }).join("") : `<p class="empty-inline">No ${empFilter} employees.</p>`;
    }
    document.querySelectorAll("[data-emp-filter]").forEach((b) => b.addEventListener("click", () => {
      empFilter = b.dataset.empFilter;
      document.querySelectorAll("[data-emp-filter]").forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-pressed", x === b); });
      employeesView();
    }));

    function openAssign(empId) {
      const e = employees.find((x) => x.id === empId);
      if (!e) return;
      const s = e.assignment || {};
      const c = ES.company();
      const sites = [...new Set(employees.map((x) => x.assignment && x.assignment.site).filter(Boolean).concat(c.location ? [c.location] : []))];
      const job = jobById(e.jobId);
      const start = s.startDate || new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
      UI.openModal({
        title: `Assign ${e.name}`,
        size: "modal--wide",
        body: `<p class="muted">Role: <strong>${UI.esc(e.role)}</strong>. Set where and when they'll work.</p>
          <form id="assign-form" novalidate>
            <div class="field"><label for="as-site">Work site / location</label>
              <input id="as-site" name="site" type="text" required data-label="work site" list="site-list" value="${UI.esc(s.site || (job ? job.location : ""))}" placeholder="e.g. Riverside Care Home, Melbourne VIC">
              <datalist id="site-list">${sites.map((x) => `<option value="${UI.esc(x)}">`).join("")}</datalist></div>
            <div class="form-row">
              <div class="field"><label for="as-team">Team / department</label><input id="as-team" name="team" type="text" data-label="team" value="${UI.esc(s.team || "")}" placeholder="e.g. Dispatch team"></div>
              <div class="field"><label for="as-sup">Supervisor</label><input id="as-sup" name="supervisor" type="text" data-label="supervisor" value="${UI.esc(s.supervisor || "")}" placeholder="Name of their manager"></div>
            </div>
            <div class="form-row">
              <div class="field"><label for="as-start">Start date</label><input id="as-start" name="startDate" type="date" required data-label="start date" value="${start}"></div>
              <div class="field"><label for="as-shift">Shift</label><select id="as-shift" name="shift" data-label="shift">
                ${ES.SHIFTS.map((x) => `<option ${x === s.shift ? "selected" : ""}>${x}</option>`).join("")}</select></div>
            </div>
            <div class="field"><label for="as-notes">Notes for the employee <span class="muted">(optional)</span></label>
              <textarea id="as-notes" name="notes" rows="3" maxlength="500" placeholder="Induction details, what to bring…">${UI.esc(s.notes || "")}</textarea></div>
          </form>`,
        actions: `<button class="btn btn--ghost" type="button" data-close-modal>Cancel</button>
                  <button class="btn btn--primary" type="button" id="assign-save">${UI.icon("i-check")}Save assignment</button>`
      });
      document.getElementById("assign-save").addEventListener("click", async () => {
        const f = document.getElementById("assign-form");
        if (!UI.validateForm(f)) return;
        ES.assign(empId, Object.fromEntries(new FormData(f)));
        UI.closeModal();
        UI.toast(`${e.name} assigned to ${f.site.value}.`);
        await load();
        const view = (location.hash || "#overview").slice(1);
        (view === "employees" ? employeesView : view === "overview" ? overview : () => {})();
        updateBadges();
      });
    }

    /* ------------------------------------------------------------ company */
    const cForm = document.getElementById("company-form");
    function company() {
      const c = ES.company();
      ["companyName", "industry", "contactPerson", "phone", "location", "website", "about"].forEach((k) => { if (cForm.elements[k]) cForm.elements[k].value = c[k] || ""; });
    }
    cForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!UI.validateForm(cForm)) return;
      ES.saveCompany(Object.fromEntries(new FormData(cForm)));
      fillIdentity();
      UI.toast("Company profile saved.");
    });

    /* ------------------------------------------------------ notifications */
    function notifications() {
      const list = NotificationService.list();
      document.getElementById("note-list").innerHTML = list.length
        ? list.map((n) => `<li class="note ${n.read ? "" : "is-unread"}">${UI.icon("i-bell")}<div><p>${UI.esc(n.text)}</p><span class="muted">${UI.formatDate(n.date)}${n.read ? "" : " · New"}</span></div></li>`).join("")
        : `<li class="empty-inline">No notifications yet.</li>`;
    }
    document.getElementById("mark-read").addEventListener("click", () => {
      NotificationService.markAllRead(); notifications(); updateBadges(); UI.toast("All notifications marked as read.");
    });

    /* ----------------------------------------------------------- settings */
    function settings() {}
    document.getElementById("reset-demo").addEventListener("click", () => {
      UI.openModal({
        title: "Reset demo data?",
        body: "<p>This removes this employer's job posts, applicants, employees and notifications from this browser.</p>",
        actions: `<button class="btn btn--ghost" data-close-modal type="button">Cancel</button>
                  <button class="btn btn--danger" id="confirm-reset" type="button">Reset demo data</button>`
      });
      document.getElementById("confirm-reset").addEventListener("click", () => {
        ["msb_emp_applicants_", "msb_emp_employees_", "msb_emp_company_", "msb_notes_"].forEach((k) => Store.remove(k + user.email));
        Store.set("msb_posted_jobs", Store.get("msb_posted_jobs", []).filter((j) => j.ownerEmail !== user.email));
        if (user.email === "demo.employer@example.com") ES.seedDemo();
        UI.closeModal(); UI.toast("Demo data reset.");
        location.hash = "#overview"; route();
      });
    });

    /* ------------------------------------------------ delegated click actions */
    document.addEventListener("click", async (e) => {
      const t = (sel) => e.target.closest(sel);
      let el;
      if ((el = t("[data-new-job]"))) { editingId = null; if (location.hash === "#post") postForm(); }
      else if ((el = t("[data-edit-job]"))) { editingId = el.dataset.editJob; if (location.hash === "#post") postForm(); else location.hash = "#post"; }
      else if ((el = t("[data-filter-job]"))) { fJob.innerHTML += `<option value="${el.dataset.filterJob}"></option>`; fJob.value = el.dataset.filterJob; fStage.value = ""; selectedApplicant = null; }
      else if ((el = t("[data-open-applicant]"))) { selectedApplicant = el.dataset.openApplicant; fJob.value = ""; fStage.value = ""; fQ.value = ""; }
      else if ((el = t("[data-toggle-job]"))) {
        const j = jobs.find((x) => x.id === el.dataset.toggleJob);
        ES.setJobStatus(j.id, j.status === "open" ? "closed" : "open");
        UI.toast(j.status === "open" ? "Job closed. It's no longer shown on the Jobs page." : "Job reopened and visible on the Jobs page.");
        await refresh(location.hash === "#overview" || !location.hash ? overview : jobPosts);
      }
      else if ((el = t("[data-delete-job]"))) {
        const j = jobs.find((x) => x.id === el.dataset.deleteJob);
        UI.openModal({
          title: "Delete this job post?",
          body: `<p><strong>${UI.esc(j.title)}</strong> and its applicants will be removed. To just stop new applications, close the job instead.</p>`,
          actions: `<button class="btn btn--ghost" data-close-modal type="button">Keep job</button><button class="btn btn--danger" id="confirm-del" type="button">Delete job</button>`
        });
        document.getElementById("confirm-del").addEventListener("click", async () => {
          ES.deleteJob(j.id); UI.closeModal(); UI.toast("Job post deleted.");
          await refresh(location.hash === "#jobs" ? jobPosts : overview);
        });
      }
      else if ((el = t("[data-select-applicant]"))) {
        selectedApplicant = el.dataset.selectApplicant; applicantsView();
        if (window.innerWidth < 1025) document.getElementById("applicant-detail").scrollIntoView({ behavior: "smooth", block: "start" });
      }
      else if ((el = t("[data-move]"))) {
        const a = applicants.find((x) => x.id === el.dataset.move);
        const u = ES.setStage(a.id, a.stage + Number(el.dataset.dir));
        UI.toast(`${a.name}: ${STAGES[u.stage].label}.`);
        await refresh(applicantsView);
      }
      else if ((el = t("[data-outcome]"))) {
        const a = applicants.find((x) => x.id === el.dataset.id);
        const hire = el.dataset.outcome === "hired";
        UI.openModal({
          title: hire ? `Hire ${a.name}?` : `Mark ${a.name} as not suitable?`,
          body: hire ? `<p>${UI.esc(a.name)} will be added to your employees so you can assign them to a site and team.</p>`
                     : `<p>The application will be closed as unsuccessful. You can reopen it later.</p>`,
          actions: `<button class="btn btn--ghost" data-close-modal type="button">Cancel</button>
                    <button class="btn ${hire ? "btn--success" : "btn--danger"}" id="confirm-outcome" type="button">${hire ? "Hire" : "Mark unsuccessful"}</button>`
        });
        document.getElementById("confirm-outcome").addEventListener("click", async () => {
          ES.setOutcome(a.id, el.dataset.outcome); UI.closeModal();
          UI.toast(hire ? `${a.name} hired. Next: assign them to a site.` : "Application marked unsuccessful.");
          await refresh(applicantsView);
          if (hire) celebrate();
        });
      }
      else if ((el = t("[data-reopen]"))) {
        const a = applicants.find((x) => x.id === el.dataset.reopen);
        ES.setStage(a.id, 3); ES._removeEmployeeFor(a.id);
        UI.toast("Application reopened at the interview stage.");
        await refresh(applicantsView);
      }
      else if ((el = t("[data-save-note]"))) { ES.saveNote(el.dataset.saveNote, document.getElementById("a-note").value); UI.toast("Note saved."); await load(); }
      else if ((el = t("[data-assign]"))) { openAssign(el.dataset.assign); }
      else if ((el = t("[data-assign-after]")) && el.dataset.assignAfter) { const id = el.dataset.assignAfter; setTimeout(() => openAssign(id), 350); }
      else if ((el = t("[data-unassign]"))) {
        ES.assign(el.dataset.unassign, null); UI.toast("Assignment removed.");
        await refresh(employeesView);
      }
    });

    /* Small celebration when someone is hired (skipped for reduced motion). */
    function celebrate() {
      if (document.documentElement.classList.contains("reduce-motion")) return;
      const wrap = document.createElement("div");
      wrap.className = "confetti"; wrap.setAttribute("aria-hidden", "true");
      const colors = ["#15639E", "#4BB6F4", "#067647", "#F5B400", "#ffffff"];
      for (let i = 0; i < 40; i++) {
        const p = document.createElement("i");
        p.style.cssText = `left:${Math.random() * 100}%;background:${colors[i % colors.length]};animation-delay:${Math.random() * .3}s;--x:${(Math.random() - .5) * 200}px;--r:${Math.random() * 720}deg`;
        wrap.appendChild(p);
      }
      document.body.appendChild(wrap);
      setTimeout(() => wrap.remove(), 2200);
    }

    route();
  }

  document.addEventListener("DOMContentLoaded", init);
})();

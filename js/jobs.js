/* ==========================================================================
   jobs.js — homepage featured jobs, Jobs page, Job details page
   ========================================================================== */

(function () {
  "use strict";
  const { JobService, ApplicationService } = window.MSB;
  const F = window.MSBFilters;
  const UI = window.UI;

  /* =========================================================== HOMEPAGE */
  async function initFeatured() {
    const grid = document.getElementById("featured-jobs");
    if (!grid) return;
    grid.innerHTML = UI.skeletonCards(4);
    const jobs = await JobService.getFeaturedJobs();
    grid.innerHTML = jobs.slice(0, 4).map(UI.jobCard).join("");

    // Live job counts on the industry tiles
    const all = await JobService.getJobs();
    document.querySelectorAll("[data-industry-count]").forEach((el) => {
      const n = all.filter((j) => j.category === el.dataset.industryCount).length;
      el.textContent = n === 1 ? "1 open role" : `${n} open roles`;
    });
  }

  /* =========================================================== JOBS PAGE */
  function initJobsPage() {
    const results = document.getElementById("job-results");
    if (!results) return;

    const filterForm = document.getElementById("filter-form");
    const searchForm = document.getElementById("jobs-search");
    const sortSelect = document.getElementById("sort");
    const countEl = document.getElementById("job-count");
    const chipsEl = document.getElementById("active-filters");
    const drawer = document.getElementById("filters");
    const openBtn = document.getElementById("open-filters");
    const badge = document.getElementById("filter-badge");
    const showBtn = document.getElementById("show-results");

    let allJobs = [];
    let state = F.stateFromURL();

    // Push state into the controls
    function syncControls() {
      searchForm.q.value = state.q;
      searchForm.location.value = state.location;
      sortSelect.value = state.sort;
      filterForm.querySelectorAll("input[type=checkbox]").forEach((cb) => {
        cb.checked = cb.name === "sponsor" ? state.sponsorInfo : (state[cb.name] || []).includes(cb.value);
      });
    }

    // Read controls back into state
    function readControls() {
      state.q = searchForm.q.value.trim();
      state.location = searchForm.location.value.trim();
      state.sort = sortSelect.value;
      ["industry", "state", "employment", "experience"].forEach((k) => {
        state[k] = [...filterForm.querySelectorAll(`input[name="${k}"]:checked`)].map((c) => c.value);
      });
      state.sponsorInfo = filterForm.querySelector("input[name=sponsor]").checked;
    }

    function labelFor(key, value) {
      if (key === "industry") return window.MSB_INDUSTRIES[value].filterLabel;
      if (key === "experience") return window.MSB_EXPERIENCE_LEVELS[value];
      return value;
    }

    function renderChips() {
      const chips = [];
      if (state.q) chips.push({ key: "q", value: state.q, text: `“${state.q}”` });
      if (state.location) chips.push({ key: "location", value: state.location, text: state.location });
      ["industry", "state", "employment", "experience"].forEach((k) =>
        state[k].forEach((v) => chips.push({ key: k, value: v, text: labelFor(k, v) })));
      if (state.sponsorInfo) chips.push({ key: "sponsor", value: "1", text: "Sponsorship info provided" });
      chipsEl.innerHTML = chips.length
        ? chips.map((c) => `<button type="button" class="chip" data-chip-key="${c.key}" data-chip-value="${UI.esc(c.value)}" aria-label="Remove filter ${UI.esc(c.text)}">${UI.esc(c.text)}${UI.icon("i-close", "icon icon--xs")}</button>`).join("")
          + `<button type="button" class="link-btn" data-clear-filters>Clear all</button>`
        : "";
      const n = F.activeCount(state);
      badge.textContent = n;
      badge.hidden = n === 0;
    }

    function render() {
      const list = F.sortJobs(F.filterJobs(allJobs, state), state.sort);
      countEl.textContent = `${list.length} ${list.length === 1 ? "opportunity" : "opportunities"} found`;
      showBtn.textContent = `Show ${list.length} ${list.length === 1 ? "job" : "jobs"}`;
      results.innerHTML = list.length
        ? list.map(UI.jobCard).join("")
        : `<div class="empty-state">
             ${UI.icon("i-search", "icon empty-state__icon")}
             <h3>No jobs match these filters</h3>
             <p>Try removing a filter or searching a broader term, such as an industry name.</p>
             <button type="button" class="btn btn--primary" data-clear-filters>Clear all filters</button>
           </div>`;
      renderChips();
      history.replaceState(null, "", "jobs.html" + F.stateToURL(state));
    }

    function update() { readControls(); render(); }

    searchForm.addEventListener("submit", (e) => { e.preventDefault(); update(); results.focus({ preventScroll: true }); });
    filterForm.addEventListener("change", update);
    sortSelect.addEventListener("change", update);

    // Debounced live keyword search
    let t;
    searchForm.q.addEventListener("input", () => { clearTimeout(t); t = setTimeout(update, 250); });

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-clear-filters]")) {
        const sort = state.sort;
        state = F.emptyState(); state.sort = sort;
        syncControls(); render();
        UI.toast("Filters cleared.");
      }
      const chip = e.target.closest("[data-chip-key]");
      if (chip) {
        const k = chip.dataset.chipKey, v = chip.dataset.chipValue;
        if (k === "q" || k === "location") state[k] = "";
        else if (k === "sponsor") state.sponsorInfo = false;
        else state[k] = state[k].filter((x) => x !== v);
        syncControls(); render();
      }
    });

    // Mobile filter drawer
    const setDrawer = (open) => {
      drawer.classList.toggle("is-open", open);
      openBtn.setAttribute("aria-expanded", open);
      document.body.classList.toggle("no-scroll", open);
      if (open) drawer.querySelector("button, input").focus(); else openBtn.focus();
    };
    openBtn.addEventListener("click", () => setDrawer(true));
    drawer.querySelectorAll("[data-close-filters]").forEach((b) => b.addEventListener("click", () => setDrawer(false)));
    document.addEventListener("msb:escape", () => drawer.classList.contains("is-open") && setDrawer(false));

    syncControls();
    results.innerHTML = UI.skeletonCards(6);
    JobService.getJobs().then((jobs) => { allJobs = jobs; render(); });
  }

  /* ======================================================= JOB DETAILS */
  async function initDetails() {
    const root = document.getElementById("job-detail");
    if (!root) return;
    const id = UI.qs("id");
    const job = id ? await JobService.getJobById(id) : null;

    if (!job) {
      root.innerHTML = `
        <div class="container empty-state empty-state--page">
          ${UI.icon("i-search", "icon empty-state__icon")}
          <h1>This job isn't available</h1>
          <p>The link may be out of date, or the vacancy has closed. Browse current opportunities instead.</p>
          <a class="btn btn--primary" href="jobs.html">Browse jobs</a>
        </div>`;
      document.title = "Job not found | My SkillBridge Recruitment Services";
      return;
    }

    const ind = window.MSB_INDUSTRIES[job.category] || window.MSB_INDUSTRIES.Other;
    document.title = `${job.title} in ${job.location} | My SkillBridge Recruitment Services`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", `${job.title}, ${job.employment}, ${job.location}. ${job.description.slice(0, 110)}…`);

    const saved = JobService.isSaved(job.id);
    const applied = ApplicationService.hasApplied(job.id);
    const applyLabel = applied ? "Applied" : "Apply now";

    const criteria = [
      ["Experience", job.experience, "i-clock"],
      ["Qualification", job.qualification, "i-book"],
      ["Skills", job.skills.slice(0, 3).join(", ") + (job.skills.length > 3 ? " and more" : ""), "i-star"],
      ["Employment type", job.employment, "i-briefcase"],
      ["Location", job.location, "i-pin"],
      ["Salary", job.salary, "i-dollar"],
      ["Application deadline", UI.formatDate(job.deadline), "i-calendar"]
    ];

    const fit = [
      ["Experience", `This role asks for ${job.experience.toLowerCase()}. Compare it with your own relevant experience.`, "i-clock"],
      ["Qualification", job.qualification + ".", "i-book"],
      ["Skills", `Look for ${job.skills.slice(0, 3).join(", ")} in your recent work.`, "i-star"],
      ["Location", `Based in ${job.location}. Check you can work from this location.`, "i-pin"]
    ];

    root.innerHTML = `
      <section class="detail-hero">
        <div class="container">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a><span aria-hidden="true">/</span>
            <a href="jobs.html">Jobs</a><span aria-hidden="true">/</span>
            <span aria-current="page">${UI.esc(job.title)}</span>
          </nav>
          <div class="detail-hero__grid">
            <div>
              <p class="detail-hero__cat">${UI.icon(ind.icon)}<span class="sr-only">Job category: </span>${UI.esc(ind.filterLabel)}</p>
              <h1 class="detail-hero__title">${UI.esc(job.title)}</h1>
              <p class="detail-hero__company">${UI.esc(job.company)}</p>
              <ul class="job-meta job-meta--lg">
                <li>${UI.icon("i-pin")}${UI.esc(job.location)}</li>
                <li>${UI.icon("i-briefcase")}${UI.esc(job.employment)}</li>
                <li>${UI.icon("i-clock")}${UI.esc(job.experience)}</li>
              </ul>
            </div>
            <div class="detail-hero__actions">
              <button type="button" class="btn btn--primary btn--lg" data-apply ${applied ? "disabled" : ""}>${applyLabel}</button>
              ${UI.saveButton(job, saved, true)}
              <p class="detail-hero__posted">Posted ${UI.formatDate(job.postedDate)}. Closes ${UI.formatDate(job.deadline)}.</p>
            </div>
          </div>
        </div>
      </section>

      <div class="container detail-layout">
        <div class="detail-main">
          <section class="detail-section" aria-labelledby="about-role">
            <h2 id="about-role">About the role</h2>
            <p>${UI.esc(job.description)}</p>
          </section>

          <section class="detail-section" aria-labelledby="resp">
            <h2 id="resp">Key responsibilities</h2>
            <ul class="check-list">${job.responsibilities.map((r) => `<li>${UI.icon("i-check")}${UI.esc(r)}</li>`).join("")}</ul>
          </section>

          <section class="detail-section" aria-labelledby="reqs">
            <h2 id="reqs">Requirements</h2>
            <ul class="check-list">${job.requirements.map((r) => `<li>${UI.icon("i-check")}${UI.esc(r)}</li>`).join("")}</ul>
          </section>

          <section class="detail-section" aria-labelledby="skills">
            <h2 id="skills">Required skills</h2>
            <ul class="tag-list">${job.skills.map((s) => `<li class="tag">${UI.esc(s)}</li>`).join("")}</ul>
          </section>

          <section class="detail-section" aria-labelledby="fit">
            <h2 id="fit">Is this role right for you?</h2>
            <p class="muted">Compare your background with what the employer has listed. This is a general guide to the job criteria only.</p>
            <div class="fit-grid">
              ${fit.map(([t, d, ic]) => `<div class="fit-card">${UI.icon(ic)}<h3>${t}</h3><p>${UI.esc(d)}</p></div>`).join("")}
            </div>
            <a class="text-link" href="candidates.html#profile-check">Check your job profile against these criteria</a>
          </section>

          <section class="detail-section info-panel" aria-labelledby="visa">
            <div class="info-panel__icon">${UI.icon("i-info")}</div>
            <div>
              <h2 id="visa">Visa and work information</h2>
              <p>Visa and work-right requirements depend on the specific role and the individual's circumstances. Review the relevant official Australian Government information before making immigration decisions.</p>
              ${job.sponsorshipInfo ? `<p class="info-panel__note"><strong>Vacancy note:</strong> ${UI.esc(job.sponsorshipInfo)}</p>` : ""}
              <a class="btn btn--ghost btn--sm" href="https://immi.homeaffairs.gov.au/" target="_blank" rel="noopener noreferrer">View official information<span class="sr-only"> (opens in a new tab)</span></a>
            </div>
          </section>

          <section class="detail-section" aria-labelledby="how-apply">
            <h2 id="how-apply">How to apply</h2>
            <ol class="apply-steps">
              <li><span class="apply-steps__n">1</span><div><h3>Create your profile</h3><p>Register for free as a candidate.</p></div></li>
              <li><span class="apply-steps__n">2</span><div><h3>Upload your CV</h3><p>Attach an up-to-date CV in PDF or Word.</p></div></li>
              <li><span class="apply-steps__n">3</span><div><h3>Submit your application</h3><p>Add a short message and send it.</p></div></li>
              <li><span class="apply-steps__n">4</span><div><h3>Track your application</h3><p>Follow each stage in your dashboard.</p></div></li>
            </ol>
            <button type="button" class="btn btn--primary btn--lg" data-apply ${applied ? "disabled" : ""}>${applyLabel}</button>
          </section>
        </div>

        <aside class="detail-aside" aria-labelledby="criteria-title">
          <div class="criteria-card">
            <h2 id="criteria-title">Job criteria</h2>
            <dl class="criteria-list">
              ${criteria.map(([k, v, ic]) => `<div class="criteria-list__row">${UI.icon(ic)}<dt>${k}</dt><dd>${UI.esc(v)}</dd></div>`).join("")}
            </dl>
            <button type="button" class="btn btn--primary btn--block" data-apply ${applied ? "disabled" : ""}>${applyLabel}</button>
          </div>
        </aside>
      </div>

      <div class="mobile-apply-bar">
        ${UI.saveButton(job, saved)}
        <button type="button" class="btn btn--primary btn--block" data-apply ${applied ? "disabled" : ""}>${applyLabel}</button>
      </div>`;

    root.addEventListener("click", (e) => { if (e.target.closest("[data-apply]")) UI.startApplication(job); });
    document.addEventListener("msb:applied", () => {
      root.querySelectorAll("[data-apply]").forEach((b) => { b.disabled = true; b.textContent = "Applied"; });
    });

    // Related jobs in the same industry
    const related = document.getElementById("related-jobs");
    if (related) {
      const all = await JobService.getJobs();
      const list = all.filter((j) => j.category === job.category && j.id !== job.id).slice(0, 3);
      if (list.length) related.querySelector(".job-grid").innerHTML = list.map(UI.jobCard).join("");
      else related.hidden = true;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initFeatured();
    initJobsPage();
    initDetails();
  });
})();

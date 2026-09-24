/* ==========================================================================
   filters.js — pure search / filter / sort functions (no DOM access)
   Kept separate so the same logic can later move server-side as API
   query parameters (e.g. /api/jobs?q=analyst&state=VIC&sort=newest).
   ========================================================================== */

(function () {
  "use strict";

  const STATE_NAMES = {
    NSW: "new south wales sydney", VIC: "victoria melbourne", QLD: "queensland brisbane",
    WA: "western australia perth", SA: "south australia adelaide", TAS: "tasmania hobart",
    ACT: "australian capital territory canberra", NT: "northern territory darwin"
  };

  /** Empty filter state. Arrays = multi-select checkboxes. */
  function emptyState() {
    return { q: "", location: "", industry: [], state: [], employment: [], experience: [], sponsorInfo: false, sort: "newest" };
  }

  /** Free text matched against title, skills, industry, description. */
  function matchesKeyword(job, q) {
    if (!q) return true;
    const ind = window.MSB_INDUSTRIES[job.category];
    const hay = [job.title, job.category, ind && ind.label, ind && ind.tags.join(" "), job.skills.join(" "), job.description]
      .join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
  }

  function matchesLocation(job, loc) {
    if (!loc) return true;
    const hay = (job.location + " " + (STATE_NAMES[job.state] || "")).toLowerCase();
    return hay.includes(loc.toLowerCase().trim());
  }

  function filterJobs(jobs, s) {
    return jobs.filter((j) =>
      matchesKeyword(j, s.q) &&
      matchesLocation(j, s.location) &&
      (!s.industry.length || s.industry.includes(j.category)) &&
      (!s.state.length || s.state.includes(j.state)) &&
      (!s.employment.length || s.employment.includes(j.employment)) &&
      (!s.experience.length || s.experience.includes(j.experienceLevel)) &&
      (!s.sponsorInfo || Boolean(j.sponsorshipInfo))
    );
  }

  function sortJobs(jobs, sort) {
    const list = jobs.slice();
    const bySalary = (dir) => (a, b) => {
      if (a.salaryMin == null && b.salaryMin == null) return 0;
      if (a.salaryMin == null) return 1;           // undisclosed always last
      if (b.salaryMin == null) return -1;
      return dir * (a.salaryMin - b.salaryMin);
    };
    switch (sort) {
      case "oldest":  return list.sort((a, b) => a.postedDate.localeCompare(b.postedDate));
      case "title":   return list.sort((a, b) => a.title.localeCompare(b.title));
      case "salary-high": return list.sort(bySalary(-1));
      case "deadline": return list.sort((a, b) => a.deadline.localeCompare(b.deadline));
      default:        return list.sort((a, b) => b.postedDate.localeCompare(a.postedDate));
    }
  }

  /** Reads ?q=&location=&industry=ICT,Healthcare&state=VIC … into a state. */
  function stateFromURL(search = window.location.search) {
    const p = new URLSearchParams(search);
    const s = emptyState();
    s.q = p.get("q") || "";
    s.location = p.get("location") || "";
    const list = (k) => (p.get(k) ? p.get(k).split(",").filter(Boolean) : []);
    s.industry = list("industry");
    s.state = list("state");
    s.employment = list("employment");
    s.experience = list("experience");
    s.sponsorInfo = p.get("sponsor") === "1";
    s.sort = p.get("sort") || "newest";
    // Allow a single location param that is exactly a state code to tick that state
    if (s.location && STATE_NAMES[s.location.toUpperCase()]) { s.state = [s.location.toUpperCase()]; s.location = ""; }
    return s;
  }

  function stateToURL(s) {
    const p = new URLSearchParams();
    if (s.q) p.set("q", s.q);
    if (s.location) p.set("location", s.location);
    ["industry", "state", "employment", "experience"].forEach((k) => s[k].length && p.set(k, s[k].join(",")));
    if (s.sponsorInfo) p.set("sponsor", "1");
    if (s.sort !== "newest") p.set("sort", s.sort);
    return p.toString() ? "?" + p : "";
  }

  function activeCount(s) {
    return s.industry.length + s.state.length + s.employment.length + s.experience.length + (s.sponsorInfo ? 1 : 0);
  }

  window.MSBFilters = { emptyState, filterJobs, sortJobs, stateFromURL, stateToURL, activeCount };
})();

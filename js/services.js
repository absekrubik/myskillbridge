/* ==========================================================================
   services.js — DATA ACCESS LAYER
   --------------------------------------------------------------------------
   All pages talk to data ONLY through these functions. Today they read the
   sample arrays and localStorage. To connect a real backend, replace the
   body of each function with a fetch() to your REST API — the UI code does
   not need to change, because every function already returns a Promise.

   Example future implementation:
     async getJobs() { const r = await fetch('/api/jobs'); return r.json(); }
   ========================================================================== */

(function () {
  "use strict";

  /* ---- Small localStorage wrapper (safe if storage is blocked) ---------- */
  const Store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (e) { return false; }
    },
    remove(key) { try { localStorage.removeItem(key); } catch (e) {} }
  };

  const KEYS = {
    saved: "msb_saved_jobs",
    users: "msb_demo_users",
    session: "msb_demo_session",
    apps: (email) => "msb_apps_" + email,
    profile: (email) => "msb_profile_" + email,
    notes: (email) => "msb_notes_" + email,
    posted: "msb_posted_jobs",                          // jobs posted by employer accounts (all employers)
    applicants: (email) => "msb_emp_applicants_" + email,
    employees: (email) => "msb_emp_employees_" + email,
    company: (email) => "msb_emp_company_" + email
  };

  // Employer-posted jobs that are open are shown on the public site alongside
  // the sample jobs (jobs-data.js loads first, so we extend the same array).
  (function mergePostedJobs() {
    const open = Store.get(KEYS.posted, []).filter((j) => j.status === "open");
    window.MSB_JOBS = (window.MSB_JOBS || []).filter((j) => !j.ownerEmail).concat(open);
  })();

  // Simulated network delay so loading states are visible in the demo.
  const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

  /* ======================================================================
     JOBS
     ====================================================================== */
  const JobService = {
    async getJobs() {
      await delay();
      return (window.MSB_JOBS || []).slice();
    },
    async getJobById(id) {
      await delay(150);
      return (window.MSB_JOBS || []).find((j) => j.id === id) || null;
    },
    async getFeaturedJobs() {
      const jobs = await this.getJobs();
      return jobs.filter((j) => j.featured);
    },

    /* Saved jobs are kept per browser (no login needed). */
    getSavedIds() { return Store.get(KEYS.saved, []); },
    isSaved(id) { return this.getSavedIds().includes(id); },
    saveJob(id) {
      const ids = this.getSavedIds();
      if (!ids.includes(id)) { ids.push(id); Store.set(KEYS.saved, ids); }
      return true;
    },
    unsaveJob(id) {
      Store.set(KEYS.saved, this.getSavedIds().filter((x) => x !== id));
      return false;
    },
    /** Returns the new saved state (true = saved). */
    toggleSave(id) { return this.isSaved(id) ? this.unsaveJob(id) : this.saveJob(id); }
  };

  /* ======================================================================
     APPLICATIONS
     Stages are shared by the dashboard timeline and status badges.
     ====================================================================== */
  const STAGES = [
    { key: "submitted",       label: "Application submitted", status: "Submitted" },
    { key: "document-review", label: "Document review",       status: "Under review" },
    { key: "employer-review", label: "Employer review",       status: "Under review" },
    { key: "interview",       label: "Interview",             status: "Shortlisted" },
    { key: "decision",        label: "Final decision",        status: "Decision made" }
  ];

  const ApplicationService = {
    STAGES,

    async getApplications() {
      await delay(200);
      const user = AuthService.currentUser();
      if (!user) return [];
      return Store.get(KEYS.apps(user.email), []);
    },

    hasApplied(jobId) {
      const user = AuthService.currentUser();
      if (!user) return false;
      return Store.get(KEYS.apps(user.email), []).some((a) => a.jobId === jobId);
    },

    /**
     * Create an application. `data` holds non-sensitive fields only.
     * NOTE: CV files are NOT stored in the browser — only the file name is
     * recorded for the demo. A real system must upload files to secure
     * server-side/cloud storage.
     */
    async applyForJob(jobId, data = {}) {
      await delay(400);
      const user = AuthService.currentUser();
      if (!user) throw new Error("Log in as a candidate to apply.");
      if (user.role !== "candidate") throw new Error("Only candidate accounts can apply for jobs.");
      const apps = Store.get(KEYS.apps(user.email), []);
      if (apps.some((a) => a.jobId === jobId)) throw new Error("You have already applied for this job.");
      const app = {
        id: "app-" + Date.now(),
        jobId,
        stage: 0,
        appliedOn: new Date().toISOString().slice(0, 10),
        coverNote: (data.coverNote || "").slice(0, 1000),
        cvFileName: data.cvFileName || null
      };
      const posted = Store.get(KEYS.posted, []).find((j) => j.id === jobId);
      if (posted) app.employerEmail = posted.ownerEmail;
      apps.unshift(app);
      Store.set(KEYS.apps(user.email), apps);
      NotificationService.add("Application submitted for " + (jobTitle(jobId) || "a job") + ".");
      if (posted) EmployerService._receiveApplication(posted, user, app);
      return app;
    },

    async setStage(appId, stage) {
      const user = AuthService.currentUser();
      if (!user) return null;
      const apps = Store.get(KEYS.apps(user.email), []);
      const app = apps.find((a) => a.id === appId);
      if (!app) return null;
      app.stage = Math.max(0, Math.min(STAGES.length - 1, stage));
      Store.set(KEYS.apps(user.email), apps);
      NotificationService.add(jobTitle(app.jobId) + ": moved to " + STAGES[app.stage].label.toLowerCase() + ".");
      return app;
    },

    async withdraw(appId) {
      const user = AuthService.currentUser();
      if (!user) return;
      Store.set(KEYS.apps(user.email), Store.get(KEYS.apps(user.email), []).filter((a) => a.id !== appId));
    },

    statusFor(app) {
      if (app.outcome === "hired") return "Hired";
      if (app.outcome === "unsuccessful") return "Unsuccessful";
      return STAGES[app.stage].status;
    },

    /** Seeds example applications the first time a demo account opens the dashboard. */
    seedDemoApplications() {
      const user = AuthService.currentUser();
      if (!user || Store.get(KEYS.apps(user.email), null) !== null) return;
      Store.set(KEYS.apps(user.email), [
        { id: "app-demo-1", jobId: "ict-business-analyst", stage: 2, appliedOn: "2026-09-20", coverNote: "", cvFileName: "CV-demo.pdf" },
        { id: "app-demo-2", jobId: "restaurant-manager",   stage: 3, appliedOn: "2026-09-18", coverNote: "", cvFileName: "CV-demo.pdf" },
        { id: "app-demo-3", jobId: "accountant-brisbane",  stage: 0, appliedOn: "2026-09-23", coverNote: "", cvFileName: "CV-demo.pdf" }
      ]);
    }
  };

  function jobTitle(id) {
    const j = findJob(id);
    return j ? j.title : "";
  }

  /* ======================================================================
     AUTH — FRONT-END DEMONSTRATION ONLY
     ----------------------------------------------------------------------
     !! This is NOT secure. Accounts live in this browser's localStorage and
     !! the password "hash" below is a simple checksum, not cryptography.
     Replace register/login/logout/currentUser with calls to a real auth
     provider (your API, Auth0, Cognito, Firebase Auth, etc.) that uses
     HTTPS, server-side password hashing and secure HTTP-only cookies.
     ====================================================================== */
  function demoChecksum(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
    return "demo_" + (h >>> 0).toString(16);
  }

  const AuthService = {
    async register(data) {
      await delay(400);
      const users = Store.get(KEYS.users, []);
      const email = String(data.email || "").trim().toLowerCase();
      if (users.some((u) => u.email === email)) throw new Error("An account with this email already exists. Log in instead.");
      const user = {
        role: data.role === "employer" ? "employer" : "candidate",
        email,
        name: data.role === "employer" ? data.contactPerson : data.fullName,
        company: data.companyName || null,
        phone: data.phone || "",
        country: data.country || "",
        createdOn: new Date().toISOString().slice(0, 10),
        pw: demoChecksum(data.password)
      };
      users.push(user);
      Store.set(KEYS.users, users);
      this._startSession(user);
      if (user.role === "candidate") {
        ProfileService.save({ fullName: user.name, email, phone: user.phone, country: user.country });
      }
      return this.currentUser();
    },

    async login(email, password) {
      await delay(400);
      email = String(email || "").trim().toLowerCase();
      const user = Store.get(KEYS.users, []).find((u) => u.email === email);
      if (!user || user.pw !== demoChecksum(password)) throw new Error("Email or password is incorrect.");
      this._startSession(user);
      return this.currentUser();
    },

    /** One-click demo candidate so reviewers can explore the dashboard. */
    async loginDemo() {
      const email = "demo.candidate@example.com";
      const users = Store.get(KEYS.users, []);
      if (!users.some((u) => u.email === email)) {
        await this.register({ role: "candidate", fullName: "Alex Demo", email, password: "demo1234", phone: "", country: "Australia" });
        ProfileService.save({ headline: "Business Analyst", location: "Melbourne, VIC", skills: "Business Analysis, Documentation, Stakeholder Management", experience: "3-5", cvFileName: "CV-demo.pdf" });
      } else {
        await this.login(email, "demo1234");
      }
      return this.currentUser();
    },

    /** One-click demo employer with sample job posts, applicants and employees. */
    async loginDemoEmployer() {
      const email = "demo.employer@example.com";
      const users = Store.get(KEYS.users, []);
      if (!users.some((u) => u.email === email)) {
        await this.register({ role: "employer", companyName: "BrightPath Services (demo)", contactPerson: "Jordan Lee",
          email, phone: "+61 2 5550 1234", password: "demo1234" });
      } else {
        await this.login(email, "demo1234");
      }
      EmployerService.seedDemo();
      return this.currentUser();
    },

    logout() { Store.remove(KEYS.session); },

    currentUser() {
      const s = Store.get(KEYS.session, null);
      if (!s) return null;
      const u = Store.get(KEYS.users, []).find((x) => x.email === s.email);
      if (!u) return null;
      const { pw, ...safe } = u; // never expose the checksum to the UI
      return safe;
    },

    _startSession(user) { Store.set(KEYS.session, { email: user.email, started: Date.now() }); }
  };

  /* ======================================================================
     PROFILE — non-sensitive profile fields only
     ====================================================================== */
  const PROFILE_FIELDS = [
    { key: "fullName", label: "Full name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "country", label: "Country" },
    { key: "headline", label: "Professional headline" },
    { key: "location", label: "Preferred location" },
    { key: "skills", label: "Key skills" },
    { key: "experience", label: "Experience" },
    { key: "cvFileName", label: "CV uploaded" }
  ];

  const ProfileService = {
    FIELDS: PROFILE_FIELDS,
    get() {
      const u = AuthService.currentUser();
      return u ? Store.get(KEYS.profile(u.email), {}) : {};
    },
    save(patch) {
      const u = AuthService.currentUser();
      if (!u) return {};
      const next = Object.assign({}, this.get(), patch);
      Store.set(KEYS.profile(u.email), next);
      return next;
    },
    completion() {
      const p = this.get();
      const done = PROFILE_FIELDS.filter((f) => p[f.key] && String(p[f.key]).trim());
      return {
        percent: Math.round((done.length / PROFILE_FIELDS.length) * 100),
        missing: PROFILE_FIELDS.filter((f) => !done.includes(f))
      };
    }
  };

  /* ======================================================================
     NOTIFICATIONS (demo inbox)
     ====================================================================== */
  const NotificationService = {
    list() {
      const u = AuthService.currentUser();
      return u ? Store.get(KEYS.notes(u.email), []) : [];
    },
    add(text) {
      const u = AuthService.currentUser();
      if (!u) return;
      const list = this.list();
      list.unshift({ id: Date.now(), text, date: new Date().toISOString().slice(0, 10), read: false });
      Store.set(KEYS.notes(u.email), list.slice(0, 30));
    },
    markAllRead() {
      const u = AuthService.currentUser();
      if (!u) return;
      Store.set(KEYS.notes(u.email), this.list().map((n) => Object.assign(n, { read: true })));
    },
    unreadCount() { return this.list().filter((n) => !n.read).length; }
  };


  /* ======================================================================
     EMPLOYER — job posts, applicant pipeline (hiring) and employee
     assignment. Replace with: /api/employer/jobs, /api/employer/applicants,
     /api/employer/employees, /api/employer/company
     ====================================================================== */
  const today = () => new Date().toISOString().slice(0, 10);
  const addDays = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
  const uid = (p) => p + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const EXP_TEXT = { "entry": "Entry Level", "1-2": "1–2 Years Experience", "3-5": "3–5 Years Experience", "5+": "5+ Years Experience" };
  const lines = (v) => Array.isArray(v) ? v : String(v || "").split(/\n+/).map((x) => x.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);

  const EmployerService = {
    STAGES,
    SHIFTS: ["Day shift", "Evening shift", "Night shift", "Rotating roster", "Flexible / office hours"],

    _me() {
      const u = AuthService.currentUser();
      if (!u || u.role !== "employer") throw new Error("Log in with an employer account.");
      return u;
    },

    /* ---------------- company profile ---------------- */
    company() {
      const u = this._me();
      return Object.assign({ companyName: u.company || "", contactPerson: u.name, email: u.email, phone: u.phone || "" },
        Store.get(KEYS.company(u.email), {}));
    },
    saveCompany(patch) {
      const u = this._me();
      Store.set(KEYS.company(u.email), Object.assign(Store.get(KEYS.company(u.email), {}), patch));
      return this.company();
    },

    /* ---------------- job posts ---------------- */
    async myJobs() {
      await delay(120);
      const u = this._me();
      return Store.get(KEYS.posted, []).filter((j) => j.ownerEmail === u.email);
    },
    _buildJob(data, existing = {}) {
      const u = this._me();
      const company = this.company().companyName || u.company || "Employer";
      const exp = data.experienceLevel || "entry";
      return Object.assign({}, existing, {
        title: String(data.title || "").trim(),
        category: data.category || "Other",
        company,
        location: `${String(data.city || "").trim()}, ${data.state}`,
        city: String(data.city || "").trim(),
        state: data.state,
        employment: data.employment || "Full Time",
        experienceLevel: exp,
        experience: EXP_TEXT[exp],
        salary: String(data.salary || "").trim() || "Not disclosed",
        salaryMin: Number(String(data.salary || "").replace(/[^\d]/g, "").slice(0, 6)) || null,
        qualification: String(data.qualification || "").trim() || "No formal qualification required",
        description: String(data.description || "").trim(),
        responsibilities: lines(data.responsibilities),
        requirements: lines(data.requirements),
        skills: String(data.skills || "").split(",").map((x) => x.trim()).filter(Boolean),
        deadline: data.deadline || addDays(30),
        sponsorshipInfo: null,
        featured: false,
        ownerEmail: u.email
      });
    },
    async postJob(data) {
      await delay(300);
      const job = this._buildJob(data, { id: uid("job"), status: "open", postedDate: today() });
      const all = Store.get(KEYS.posted, []);
      all.unshift(job);
      Store.set(KEYS.posted, all);
      NotificationService.add(`Job posted: ${job.title}. It's now visible on the Jobs page.`);
      return job;
    },
    async updateJob(id, data) {
      await delay(250);
      const all = Store.get(KEYS.posted, []);
      const i = all.findIndex((j) => j.id === id && j.ownerEmail === this._me().email);
      if (i < 0) throw new Error("Job not found.");
      all[i] = this._buildJob(data, all[i]);
      Store.set(KEYS.posted, all);
      return all[i];
    },
    setJobStatus(id, status) {
      const all = Store.get(KEYS.posted, []);
      const j = all.find((x) => x.id === id && x.ownerEmail === this._me().email);
      if (j) { j.status = status; Store.set(KEYS.posted, all); }
      return j;
    },
    deleteJob(id) {
      const me = this._me().email;
      Store.set(KEYS.posted, Store.get(KEYS.posted, []).filter((j) => !(j.id === id && j.ownerEmail === me)));
      Store.set(KEYS.applicants(me), Store.get(KEYS.applicants(me), []).filter((a) => a.jobId !== id));
    },

    /* ---------------- applicants (hiring pipeline) ---------------- */
    async applicants() {
      await delay(120);
      return Store.get(KEYS.applicants(this._me().email), []);
    },
    _saveApplicant(a) {
      const me = this._me().email;
      const list = Store.get(KEYS.applicants(me), []);
      const i = list.findIndex((x) => x.id === a.id);
      if (i >= 0) list[i] = a; else list.unshift(a);
      Store.set(KEYS.applicants(me), list);
    },
    _getApplicant(id) {
      return Store.get(KEYS.applicants(this._me().email), []).find((a) => a.id === id) || null;
    },
    /** Keeps the candidate's own dashboard in sync and notifies them. */
    _syncCandidate(a, message) {
      if (!a.candidateEmail || !a.appId) return;
      const apps = Store.get(KEYS.apps(a.candidateEmail), []);
      const app = apps.find((x) => x.id === a.appId);
      if (app) { app.stage = a.stage; app.outcome = a.outcome || null; Store.set(KEYS.apps(a.candidateEmail), apps); }
      const notes = Store.get(KEYS.notes(a.candidateEmail), []);
      notes.unshift({ id: Date.now(), text: message, date: today(), read: false });
      Store.set(KEYS.notes(a.candidateEmail), notes.slice(0, 30));
    },
    setStage(id, stage) {
      const a = this._getApplicant(id);
      if (!a) return null;
      a.stage = Math.max(0, Math.min(STAGES.length - 1, stage));
      if (a.stage < STAGES.length - 1) a.outcome = null;
      this._saveApplicant(a);
      this._syncCandidate(a, `${jobTitle(a.jobId) || "Your application"}: moved to ${STAGES[a.stage].label.toLowerCase()}.`);
      return a;
    },
    setOutcome(id, outcome) {
      const a = this._getApplicant(id);
      if (!a) return null;
      a.outcome = outcome;
      a.stage = STAGES.length - 1;
      this._saveApplicant(a);
      if (outcome === "hired") this._addEmployee(a);
      else this._removeEmployeeFor(a.id);
      this._syncCandidate(a, outcome === "hired"
        ? `Good news: you've been selected for ${jobTitle(a.jobId) || "the role"}. The employer will contact you about next steps.`
        : `Update on ${jobTitle(a.jobId) || "your application"}: the employer has decided not to progress your application.`);
      NotificationService.add(outcome === "hired" ? `${a.name} hired. Assign them to a site or team under Assign employees.` : `${a.name} marked as unsuccessful.`);
      return a;
    },
    saveNote(id, note) {
      const a = this._getApplicant(id);
      if (a) { a.note = String(note || "").slice(0, 1000); this._saveApplicant(a); }
    },

    /* ---------------- employees & assignments ---------------- */
    async employees() {
      await delay(120);
      return Store.get(KEYS.employees(this._me().email), []);
    },
    _addEmployee(a) {
      const me = this._me().email;
      const list = Store.get(KEYS.employees(me), []);
      if (list.some((e) => e.applicantId === a.id)) return;
      const job = findJob(a.jobId);
      list.unshift({ id: uid("emp"), applicantId: a.id, name: a.name, email: a.email, phone: a.phone || "",
        role: job ? job.title : "New hire", jobId: a.jobId, hiredOn: today(), assignment: null });
      Store.set(KEYS.employees(me), list);
    },
    _removeEmployeeFor(applicantId) {
      const me = this._me().email;
      Store.set(KEYS.employees(me), Store.get(KEYS.employees(me), []).filter((e) => e.applicantId !== applicantId));
    },
    assign(empId, assignment) {
      const me = this._me().email;
      const list = Store.get(KEYS.employees(me), []);
      const e = list.find((x) => x.id === empId);
      if (!e) return null;
      e.assignment = assignment ? Object.assign({ assignedOn: today() }, assignment) : null;
      Store.set(KEYS.employees(me), list);
      NotificationService.add(assignment ? `${e.name} assigned to ${assignment.site}${assignment.team ? " · " + assignment.team : ""}.` : `${e.name} is now unassigned.`);
      return e;
    },

    /** Candidate application arriving for a job this employer posted. */
    _receiveApplication(job, candidate, app) {
      const key = KEYS.applicants(job.ownerEmail);
      const p = Store.get(KEYS.profile(candidate.email), {});
      const list = Store.get(key, []);
      list.unshift({ id: uid("apl"), jobId: job.id, name: candidate.name, email: candidate.email, phone: p.phone || candidate.phone || "",
        headline: p.headline || "", location: p.location || candidate.country || "", experience: p.experience || "",
        skills: p.skills || "", appliedOn: app.appliedOn, stage: 0, outcome: null, cvFileName: app.cvFileName || p.cvFileName || null,
        coverNote: app.coverNote || "", note: "", candidateEmail: candidate.email, appId: app.id });
      Store.set(key, list);
      const notes = Store.get(KEYS.notes(job.ownerEmail), []);
      notes.unshift({ id: Date.now(), text: `New applicant: ${candidate.name} applied for ${job.title}.`, date: today(), read: false });
      Store.set(KEYS.notes(job.ownerEmail), notes.slice(0, 30));
    },

    /** Sample data for the demo employer (only created once). */
    seedDemo() {
      const u = this._me();
      if (Store.get(KEYS.applicants(u.email), null) !== null) return;
      const mk = (id, d) => Object.assign(this._buildJob(d), { id, status: "open", postedDate: addDays(-d.age) });
      const jobs = [
        mk("demo-warehouse-supervisor", { age: 5, title: "Warehouse Supervisor", category: "Other", city: "Sydney", state: "NSW", employment: "Full Time", experienceLevel: "3-5",
          salary: "$75,000 – $85,000 + super", qualification: "Certificate IV in Warehousing Operations or equivalent experience",
          description: "Lead a team of warehouse staff across receiving, picking and dispatch in a busy distribution centre.",
          responsibilities: "Supervise daily warehouse operations\nRoster and coach a team of 12\nKeep stock accuracy and safety records up to date",
          requirements: "3+ years in a warehouse leadership role\nForklift licence (LF)\nConfident with WMS software", skills: "Team Leadership, Inventory Control, WHS, Rostering" }),
        mk("demo-aged-care-worker", { age: 3, title: "Aged Care Support Worker", category: "Healthcare", city: "Melbourne", state: "VIC", employment: "Part Time", experienceLevel: "1-2",
          salary: "$32 – $36 per hour", qualification: "Certificate III in Individual Support (Ageing)",
          description: "Provide respectful day-to-day support to residents in a community aged care home.",
          responsibilities: "Assist residents with personal care and mobility\nRecord care notes accurately\nWork with nurses and families",
          requirements: "Certificate III in Individual Support\nCurrent First Aid and CPR\nNDIS worker screening check", skills: "Personal Care, Communication, Documentation, Manual Handling" }),
        mk("demo-junior-accountant", { age: 1, title: "Junior Accountant", category: "Accounting", city: "Brisbane", state: "QLD", employment: "Full Time", experienceLevel: "entry",
          salary: "$62,000 – $70,000 + super", qualification: "Bachelor degree in Accounting or Commerce",
          description: "Support the finance team with reconciliations, accounts payable and month-end reporting.",
          responsibilities: "Prepare bank and ledger reconciliations\nProcess supplier invoices\nHelp with month-end close",
          requirements: "Accounting degree (completed or final year)\nStrong Excel skills\nAttention to detail", skills: "Reconciliations, Xero, Excel, Accounts Payable" })
      ];
      Store.set(KEYS.posted, Store.get(KEYS.posted, []).filter((j) => j.ownerEmail !== u.email).concat(jobs));
      jobs.forEach((j) => { if (!window.MSB_JOBS.some((x) => x.id === j.id)) window.MSB_JOBS.push(j); });

      const A = (id, jobId, name, headline, location, experience, skills, age, stage, outcome) => ({
        id, jobId, name, email: name.toLowerCase().replace(/[^a-z]+/g, ".") + "@example.com", phone: "+61 4XX XXX XXX",
        headline, location, experience, skills, appliedOn: addDays(-age), stage, outcome: outcome || null,
        cvFileName: name.split(" ")[0] + "-CV.pdf", coverNote: "", note: "" });
      const applicants = [
        A("apl-d1", "demo-warehouse-supervisor", "Daniel Nguyen", "Warehouse Team Leader", "Parramatta, NSW", "5+", "Team Leadership, WMS, Forklift", 4, 3),
        A("apl-d2", "demo-warehouse-supervisor", "Maria Santos", "Logistics Coordinator", "Sydney, NSW", "3-5", "Inventory Control, Rostering", 3, 1),
        A("apl-d3", "demo-warehouse-supervisor", "James O'Brien", "Forklift Operator", "Liverpool, NSW", "1-2", "Forklift, WHS", 2, 0),
        A("apl-d4", "demo-aged-care-worker", "Priya Sharma", "Individual Support Worker", "Melbourne, VIC", "1-2", "Personal Care, Documentation", 3, 4, "hired"),
        A("apl-d5", "demo-aged-care-worker", "Aisha Rahman", "Disability Support Worker", "Dandenong, VIC", "3-5", "Personal Care, Manual Handling", 2, 2),
        A("apl-d6", "demo-aged-care-worker", "Tom Wilson", "Care Assistant", "Geelong, VIC", "entry", "Communication", 2, 4, "unsuccessful"),
        A("apl-d7", "demo-junior-accountant", "Sofia Rossi", "Accounting Graduate", "Brisbane, QLD", "entry", "Xero, Excel, Reconciliations", 1, 1),
        A("apl-d8", "demo-junior-accountant", "Kenji Tanaka", "Accounts Assistant", "Gold Coast, QLD", "1-2", "Accounts Payable, Excel", 1, 4, "hired")
      ];
      Store.set(KEYS.applicants(u.email), applicants);
      Store.set(KEYS.employees(u.email), [
        { id: "emp-d1", applicantId: "apl-d4", name: "Priya Sharma", email: applicants[3].email, phone: applicants[3].phone, role: "Aged Care Support Worker",
          jobId: "demo-aged-care-worker", hiredOn: addDays(-1),
          assignment: { site: "Riverside Care Home, Melbourne VIC", team: "Residential care – Wing B", supervisor: "Helen Carter", startDate: addDays(7), shift: "Day shift", notes: "Induction on first day.", assignedOn: addDays(-1) } },
        { id: "emp-d2", applicantId: "apl-d8", name: "Kenji Tanaka", email: applicants[7].email, phone: applicants[7].phone, role: "Junior Accountant",
          jobId: "demo-junior-accountant", hiredOn: today(), assignment: null }
      ]);
      Store.set(KEYS.notes(u.email), [
        { id: 3, text: "Kenji Tanaka hired. Assign them to a site or team under Assign employees.", date: today(), read: false },
        { id: 2, text: "New applicant: Sofia Rossi applied for Junior Accountant.", date: addDays(-1), read: false },
        { id: 1, text: "Job posted: Warehouse Supervisor. It's now visible on the Jobs page.", date: addDays(-5), read: true }
      ]);
      this.saveCompany({ industry: "Other", website: "", location: "Sydney, NSW",
        about: "BrightPath Services is a demo employer used to show how hiring and employee assignment work on My SkillBridge." });
    }
  };

  function findJob(id) { return (window.MSB_JOBS || []).find((x) => x.id === id) || Store.get(KEYS.posted, []).find((x) => x.id === id); }

  /* ======================================================================
     CONTACT — replace with an email service / API endpoint later
     ====================================================================== */
  const ContactService = {
    async send(message) {
      await delay(500);
      // e.g. return fetch('/api/contact', { method: 'POST', body: JSON.stringify(message) })
      return { ok: true };
    }
  };

  // Public API (also exposed as the plain function names from the brief).
  window.MSB = { Store, JobService, ApplicationService, AuthService, ProfileService, NotificationService, ContactService, EmployerService };
  window.getJobs = () => JobService.getJobs();
  window.getJobById = (id) => JobService.getJobById(id);
  window.saveJob = (id) => JobService.saveJob(id);
  window.applyForJob = (id, data) => ApplicationService.applyForJob(id, data);
  window.getApplications = () => ApplicationService.getApplications();
})();

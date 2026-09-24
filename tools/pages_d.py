"""Employer dashboard page (post jobs, review applicants, hire, assign employees)."""
from partials import icon, page


def _select(name, label, options, required=True, id_=None):
    id_ = id_ or "j-" + name
    opts = "".join(f'<option value="{v}">{t}</option>' for v, t in options)
    req = " required" if required else ""
    return (f'<div class="field"><label for="{id_}">{label}</label><select id="{id_}" name="{name}"{req} data-label="{label.lower()}">'
            f'<option value="">Choose</option>{opts}</select></div>')


CATS = [("ICT", "ICT / Technology"), ("Hospitality", "Hospitality"), ("Accounting", "Accounting &amp; Finance"),
        ("Construction", "Construction &amp; Trades"), ("Healthcare", "Healthcare &amp; Support"), ("Other", "Other")]
STATES = [(x, x) for x in ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]]
EMP = [("Full Time", "Full time"), ("Part Time", "Part time"), ("Contract", "Contract")]
EXP = [("entry", "Entry level"), ("1-2", "1–2 years"), ("3-5", "3–5 years"), ("5+", "5+ years")]
STAGES = [("0", "Application submitted"), ("1", "Document review"), ("2", "Employer review"), ("3", "Interview"), ("4", "Final decision")]

NAV = [("overview", "i-grid", "Dashboard", "Employer dashboard"), ("jobs", "i-briefcase", "My Job Posts", "My job posts"),
       ("post", "i-plus", "Post a Job", "Post a job"), ("applicants", "i-users", "Applicants", "Applicants"),
       ("employees", "i-clipboard", "Assign Employees", "Assign employees"), ("company", "i-building", "Company Profile", "Company profile"),
       ("notifications", "i-bell", "Notifications", "Notifications"), ("settings", "i-settings", "Settings", "Settings")]
BADGES = {"notifications": '<span class="count" data-unread hidden>0</span>',
          "applicants": '<span class="count count--soft" data-new-applicants hidden>0</span>',
          "employees": '<span class="count count--warn" data-unassigned hidden>0</span>'}


def employer_dashboard():
    links = "".join(f'<li><a href="#{k}" data-view-link="{k}" data-title="{t}">{icon(ic)}{label}{BADGES.get(k, "")}</a></li>'
                    for k, ic, label, t in NAV)
    links += f'<li><a href="jobs.html">{icon("i-search")}View public jobs</a></li>'
    stage_opts = "".join(f'<option value="{v}">{t}</option>' for v, t in STAGES)

    body = f'''<main id="main">
<div class="gate" id="dash-gate" hidden>
  {icon("i-building")}
  <h1 style="font-size:2rem">Employer dashboard</h1>
  <p class="muted" id="gate-text">Log in with an employer account to post jobs, review applicants and assign new employees. Or explore with sample data.</p>
  <div class="btn-row"><a class="btn btn--primary" href="login.html?next=employer-dashboard.html">Log in</a>
    <button class="btn btn--ghost" type="button" id="gate-demo">Explore demo employer</button></div>
</div>

<div class="dash dash--employer" id="dashboard" hidden>
  <aside class="dash-sidebar" id="dash-sidebar" aria-label="Employer dashboard">
    <div class="dash-user">
      <span class="avatar avatar--company" aria-hidden="true">{icon("i-building")}</span>
      <div><p class="dash-user__name" data-company-name></p><p class="dash-user__email" data-user-email></p></div>
      <button type="button" class="icon-btn dash-sidebar__close" data-close-sidebar aria-label="Close menu">{icon("i-close")}</button>
    </div>
    <nav aria-label="Dashboard sections"><ul class="dash-nav">{links}
      <li><button type="button" class="nav-link" data-logout style="width:100%;padding:10px 12px;gap:12px">{icon("i-logout")}Log out</button></li></ul></nav>
  </aside>
  <button class="dash-scrim" type="button" data-close-sidebar aria-label="Close menu" tabindex="-1"></button>

  <div class="dash-main">
    <div class="dash-top">
      <button type="button" class="btn btn--ghost btn--sm dash-menu" id="dash-menu" aria-controls="dash-sidebar" aria-expanded="false">{icon("i-menu")}Menu</button>
      <h1 id="dash-view-title">Employer dashboard</h1>
      <a class="btn btn--primary btn--sm dash-top__cta" href="#post" data-new-job>{icon("i-plus")}Post a job</a>
    </div>

    <!-- OVERVIEW -->
    <section data-view="overview" aria-labelledby="dash-view-title">
      <div class="welcome-card welcome-card--wide">
        <div>
          <h2>Welcome back, <span data-user-name></span></h2>
          <p>Here's how hiring is going at <strong data-company-name></strong>.</p>
        </div>
        <div class="stats stats--4">
          <div class="stat"><span class="stat__n" id="st-jobs">0</span><span class="stat__l">Open jobs</span></div>
          <div class="stat"><span class="stat__n" id="st-apps">0</span><span class="stat__l">Applicants</span></div>
          <div class="stat"><span class="stat__n" id="st-interview">0</span><span class="stat__l">In interview</span></div>
          <div class="stat"><span class="stat__n" id="st-hired">0</span><span class="stat__l">Hired</span></div>
        </div>
      </div>
      <div class="dash-cols">
        <div class="panel">
          <div class="panel__head"><h2>Hiring pipeline</h2><a class="link-btn" href="#applicants">Review applicants</a></div>
          <ul class="pipeline" id="pipeline"></ul>
        </div>
        <div class="panel">
          <div class="panel__head"><h2>Waiting for assignment</h2><a class="link-btn" href="#employees">Assign</a></div>
          <ul class="mini-list" id="unassigned-list"></ul>
        </div>
      </div>
      <div class="panel">
        <div class="panel__head"><h2>Latest applicants</h2><a class="link-btn" href="#applicants">View all</a></div>
        <ul class="app-list" id="recent-applicants"></ul>
      </div>
      <div class="panel">
        <div class="panel__head"><h2>Your job posts</h2><a class="link-btn" href="#jobs">Manage</a></div>
        <div class="post-grid" id="overview-jobs"></div>
      </div>
    </section>

    <!-- JOBS -->
    <section data-view="jobs" hidden aria-labelledby="dash-view-title">
      <div class="toolbar">
        <div class="seg" role="group" aria-label="Filter job posts">
          <button type="button" class="seg__btn is-active" data-job-filter="all" aria-pressed="true">All</button>
          <button type="button" class="seg__btn" data-job-filter="open" aria-pressed="false">Open</button>
          <button type="button" class="seg__btn" data-job-filter="closed" aria-pressed="false">Closed</button>
        </div>
        <a class="btn btn--primary btn--sm" href="#post" data-new-job>{icon("i-plus")}Post a job</a>
      </div>
      <div class="post-grid" id="job-posts"></div>
    </section>

    <!-- POST / EDIT JOB -->
    <section data-view="post" hidden aria-labelledby="dash-view-title">
      <form class="panel form-panel" id="job-form" novalidate>
        <input type="hidden" name="id">
        <div class="panel__head"><h2 id="job-form-title">Job details</h2></div>
        <div class="field"><label for="j-title">Job title</label><input id="j-title" name="title" type="text" required data-label="job title" placeholder="e.g. Warehouse Supervisor"></div>
        <div class="form-row">{_select("category", "Industry", CATS)}{_select("employment", "Employment type", EMP)}</div>
        <div class="form-row">
          <div class="field"><label for="j-city">City or suburb</label><input id="j-city" name="city" type="text" required data-label="city" placeholder="e.g. Sydney"></div>
          {_select("state", "State", STATES)}
        </div>
        <div class="form-row">
          {_select("experienceLevel", "Experience", EXP)}
          <div class="field"><label for="j-salary">Salary <span class="muted">(optional)</span></label><input id="j-salary" name="salary" type="text" data-label="salary" placeholder="e.g. $75,000 – $85,000 + super"></div>
        </div>
        <div class="form-row">
          <div class="field"><label for="j-qual">Qualification <span class="muted">(optional)</span></label><input id="j-qual" name="qualification" type="text" data-label="qualification" placeholder="e.g. Certificate III or equivalent"></div>
          <div class="field"><label for="j-deadline">Closing date</label><input id="j-deadline" name="deadline" type="date" required data-label="closing date"></div>
        </div>
        <div class="field"><label for="j-desc">About the role</label><textarea id="j-desc" name="description" rows="4" required data-label="role description" maxlength="1500"></textarea></div>
        <div class="form-row">
          <div class="field"><label for="j-resp">Responsibilities</label><textarea id="j-resp" name="responsibilities" rows="4" data-label="responsibilities" placeholder="One per line"></textarea></div>
          <div class="field"><label for="j-req">Requirements</label><textarea id="j-req" name="requirements" rows="4" data-label="requirements" placeholder="One per line"></textarea></div>
        </div>
        <div class="field"><label for="j-skills">Key skills</label><input id="j-skills" name="skills" type="text" data-label="skills" placeholder="Separate skills with commas"></div>
        <p class="field__hint">Describe the job criteria only. Don't make promises about visas, sponsorship or migration outcomes.</p>
        <div class="btn-row">
          <button class="btn btn--primary" type="submit" id="job-submit">{icon("i-send")}Publish job</button>
          <a class="btn btn--ghost" href="#jobs">Cancel</a>
        </div>
      </form>
    </section>

    <!-- APPLICANTS -->
    <section data-view="applicants" hidden aria-labelledby="dash-view-title">
      <div class="toolbar toolbar--filters">
        <div class="field field--inline"><label for="f-job">Job</label><select id="f-job"><option value="">All jobs</option></select></div>
        <div class="field field--inline"><label for="f-stage">Stage</label><select id="f-stage"><option value="">All stages</option>{stage_opts}<option value="hired">Hired</option><option value="unsuccessful">Unsuccessful</option></select></div>
        <div class="field field--inline field--grow"><label for="f-q">Search</label><input id="f-q" type="search" placeholder="Name or skill"></div>
      </div>
      <div class="apps-layout">
        <ul class="app-select-list" id="applicant-list" aria-label="Applicants"></ul>
        <div id="applicant-detail" aria-live="polite"></div>
      </div>
    </section>

    <!-- EMPLOYEES -->
    <section data-view="employees" hidden aria-labelledby="dash-view-title">
      <p class="muted section-lead">People you've hired appear here. Assign each one to a work site, team and supervisor, and set their start date and shift.</p>
      <div class="toolbar">
        <div class="seg" role="group" aria-label="Filter employees">
          <button type="button" class="seg__btn is-active" data-emp-filter="all" aria-pressed="true">All</button>
          <button type="button" class="seg__btn" data-emp-filter="unassigned" aria-pressed="false">Unassigned</button>
          <button type="button" class="seg__btn" data-emp-filter="assigned" aria-pressed="false">Assigned</button>
        </div>
      </div>
      <div class="emp-grid" id="employee-grid"></div>
    </section>

    <!-- COMPANY -->
    <section data-view="company" hidden aria-labelledby="dash-view-title">
      <form class="panel form-panel" id="company-form" novalidate>
        <div class="form-row">
          <div class="field"><label for="c-name">Company name</label><input id="c-name" name="companyName" type="text" required data-label="company name"></div>
          {_select("industry", "Industry", CATS, required=False, id_="c-industry")}
        </div>
        <div class="form-row">
          <div class="field"><label for="c-contact">Contact person</label><input id="c-contact" name="contactPerson" type="text" required data-label="contact person"></div>
          <div class="field"><label for="c-phone">Phone</label><input id="c-phone" name="phone" type="tel" data-label="phone"></div>
        </div>
        <div class="form-row">
          <div class="field"><label for="c-loc">Head office location</label><input id="c-loc" name="location" type="text" data-label="location" placeholder="e.g. Sydney, NSW"></div>
          <div class="field"><label for="c-web">Website <span class="muted">(optional)</span></label><input id="c-web" name="website" type="url" data-label="website" placeholder="https://"></div>
        </div>
        <div class="field"><label for="c-about">About the company</label><textarea id="c-about" name="about" rows="4" maxlength="1000" data-label="company description"></textarea></div>
        <button class="btn btn--primary" type="submit">Save company profile</button>
      </form>
    </section>

    <!-- NOTIFICATIONS -->
    <section data-view="notifications" hidden aria-labelledby="dash-view-title">
      <div class="panel form-panel">
        <div class="panel__head"><h2>Updates</h2><button class="link-btn" type="button" id="mark-read">Mark all as read</button></div>
        <ul class="note-list" id="note-list"></ul>
      </div>
    </section>

    <!-- SETTINGS -->
    <section data-view="settings" hidden aria-labelledby="dash-view-title">
      <div class="panel form-panel">
        <div class="panel__head"><h2>Account</h2></div>
        <p class="muted">Signed in as <strong data-user-email></strong>.</p>
        <div class="btn-row"><button class="btn btn--ghost" type="button" data-logout>{icon("i-logout")}Log out</button></div>
      </div>
      <div class="panel form-panel">
        <div class="panel__head"><h2>Demo data</h2></div>
        <p class="muted">Clear this employer's job posts, applicants, employees and notifications from this browser, then reload the sample data.</p>
        <button class="btn btn--danger-ghost" type="button" id="reset-demo">Reset demo data</button>
      </div>
    </section>
  </div>
</div>
</main>'''
    return page("employer-dashboard.html", "Employer Dashboard | My SkillBridge Recruitment Services",
                "Post jobs, review applicants, hire and assign employees.", "dashboard", body, ["employer.js"], show_footer=False)

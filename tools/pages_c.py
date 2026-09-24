from partials import icon, page
from pages_b import page_hero

DEMO_NOTE = f'''<p class="demo-note">{icon("i-lock")}<span><strong>Demo only.</strong> Accounts are stored in this browser for demonstration and are not secure. Don't use a real password. Real sign-in will be handled by a secure server.</span></p>'''

ASIDE = f'''<div class="auth__aside">
  <h2>Connecting talent with opportunities</h2>
  <ul class="auth__points">
    <li>{icon("i-bookmark")}Save jobs and come back later</li>
    <li>{icon("i-send")}Apply in a few steps</li>
    <li>{icon("i-clock")}Track every application</li>
    <li>{icon("i-clipboard")}See clear job criteria up front</li>
  </ul>
</div>'''


def login():
    body = f'''<main id="main" class="auth">
{ASIDE}
<div class="auth__main"><div class="auth__card">
  <h1>Log in</h1>
  <p class="auth__sub">Welcome back. Log in to manage your applications or hiring.</p>
  <p class="alert alert--info" id="already-in" hidden>You're already logged in as <strong data-name></strong>. <a href="candidate-dashboard.html">Go to dashboard</a></p>
  <p class="alert alert--error" id="login-error" role="alert" hidden></p>
  <form id="login-form" novalidate>
    <div class="field"><label for="l-email">Email</label>
      <input id="l-email" name="email" type="email" autocomplete="email" required data-label="email"></div>
    <div class="field"><label for="l-pw">Password</label>
      <div class="pw-wrap"><input id="l-pw" name="password" type="password" autocomplete="current-password" required data-label="password">
        <button type="button" class="pw-toggle" id="toggle-password" aria-controls="l-pw" aria-pressed="false">Show</button></div></div>
    <button class="btn btn--primary btn--block btn--lg" type="submit">Log in</button>
  </form>
  <div class="divider">or</div>
  <div class="demo-logins">
    <button type="button" class="btn btn--ghost btn--block" id="demo-login">{icon("i-user")}Demo candidate</button>
    <button type="button" class="btn btn--ghost btn--block" id="demo-login-employer">{icon("i-building")}Demo employer</button>
  </div>
  <p class="auth__alt">New to My SkillBridge? <a href="register.html">Create your profile</a></p>
  {DEMO_NOTE}
</div></div>
</main>'''
    return page("login.html", "Log in | My SkillBridge Recruitment Services",
                "Log in to your My SkillBridge account to manage saved jobs and applications.", "login", body, ["auth.js"], show_footer=False)


def register():
    body = f'''<main id="main" class="auth">
{ASIDE}
<div class="auth__main"><div class="auth__card">
  <h1>Create your account</h1>
  <p class="auth__sub">It's free and takes a couple of minutes.</p>
  <p class="alert alert--error" id="register-error" role="alert" tabindex="-1" hidden></p>
  <form id="register-form" novalidate>
    <fieldset class="role-switch"><legend>I'm registering as</legend>
      <div class="role-option"><input type="radio" id="role-c" name="role" value="candidate" checked>
        <label for="role-c">{icon("i-user")}<span>Candidate<small>Looking for work</small></span></label></div>
      <div class="role-option"><input type="radio" id="role-e" name="role" value="employer">
        <label for="role-e">{icon("i-building")}<span>Employer<small>Hiring talent</small></span></label></div>
    </fieldset>

    <fieldset data-role-fields="candidate">
      <legend class="sr-only">Candidate details</legend>
      <div class="field"><label for="r-name">Full name</label>
        <input id="r-name" name="fullName" type="text" autocomplete="name" required data-label="full name"></div>
      <div class="field"><label for="r-email">Email</label>
        <input id="r-email" name="email" type="email" autocomplete="email" required data-label="email"></div>
      <div class="field"><label for="r-pw">Password</label>
        <div class="pw-wrap"><input id="r-pw" name="password" type="password" autocomplete="new-password" minlength="8" required data-label="password">
          <button type="button" class="pw-toggle" data-toggle-password aria-controls="r-pw" aria-pressed="false">Show</button></div>
        <p class="field__hint">At least 8 characters.</p></div>
      <div class="form-row">
        <div class="field"><label for="r-phone">Phone <span class="muted">(optional)</span></label>
          <input id="r-phone" name="phone" type="tel" autocomplete="tel" data-label="phone"></div>
        <div class="field"><label for="r-country">Country</label>
          <input id="r-country" name="country" type="text" autocomplete="country-name" required data-label="country" list="countries">
          <datalist id="countries"><option value="Australia"><option value="India"><option value="Nepal"><option value="Philippines"><option value="New Zealand"><option value="United Kingdom"><option value="Sri Lanka"><option value="Pakistan"><option value="Bangladesh"></datalist></div>
      </div>
    </fieldset>

    <fieldset data-role-fields="employer" hidden disabled>
      <legend class="sr-only">Employer details</legend>
      <div class="field"><label for="e-company">Company name</label>
        <input id="e-company" name="companyName" type="text" autocomplete="organization" required data-label="company name"></div>
      <div class="field"><label for="e-contact">Contact person</label>
        <input id="e-contact" name="contactPerson" type="text" autocomplete="name" required data-label="contact person"></div>
      <div class="form-row">
        <div class="field"><label for="e-email">Email</label>
          <input id="e-email" name="email" type="email" autocomplete="email" required data-label="email"></div>
        <div class="field"><label for="e-phone">Phone</label>
          <input id="e-phone" name="phone" type="tel" autocomplete="tel" required data-label="phone"></div>
      </div>
      <div class="field"><label for="e-pw">Password</label>
        <div class="pw-wrap"><input id="e-pw" name="password" type="password" autocomplete="new-password" minlength="8" required data-label="password">
          <button type="button" class="pw-toggle" data-toggle-password aria-controls="e-pw" aria-pressed="false">Show</button></div>
        <p class="field__hint">At least 8 characters.</p></div>
    </fieldset>

    <div class="field field--check"><input id="r-terms" name="terms" type="checkbox" required>
      <label for="r-terms">I agree to the <a href="terms.html">Terms &amp; Conditions</a> and <a href="privacy.html">Privacy Policy</a>.</label></div>
    <button class="btn btn--primary btn--block btn--lg" type="submit" id="register-submit">Create free profile</button>
  </form>
  <p class="auth__alt">Already have an account? <a href="login.html">Log in</a></p>
  {DEMO_NOTE}
</div></div>
</main>'''
    return page("register.html", "Register | My SkillBridge Recruitment Services",
                "Create a free candidate profile or register as an employer with My SkillBridge Recruitment Services.", "register", body, ["auth.js"], show_footer=False)


def dashboard():
    nav = [("overview", "i-grid", "Dashboard", "Dashboard"), ("jobs", "i-search", "Find Jobs", None),
           ("applications", "i-folder", "My Applications", "My applications"), ("saved", "i-bookmark", "Saved Jobs", "Saved jobs"),
           ("profile", "i-user", "My Profile", "My profile"), ("documents", "i-doc", "My Documents", "My documents"),
           ("notifications", "i-bell", "Notifications", "Notifications"), ("settings", "i-settings", "Settings", "Settings")]
    links = ""
    for key, ic, label, title in nav:
        if key == "jobs":
            links += f'<li><a href="jobs.html">{icon(ic)}{label}</a></li>'
        else:
            extra = '<span class="count" data-unread hidden>0</span>' if key == "notifications" else ""
            links += f'<li><a href="#{key}" data-view-link="{key}" data-title="{title}">{icon(ic)}{label}{extra}</a></li>'

    body = f'''<main id="main">
<div class="gate" id="dash-gate" hidden>
  {icon("i-lock")}
  <h1 style="font-size:2rem">Log in to see your dashboard</h1>
  <p class="muted">Your dashboard shows your applications, saved jobs and profile. Log in with a candidate account, or explore with demo data.</p>
  <div class="btn-row"><a class="btn btn--primary" href="login.html?next=candidate-dashboard.html">Log in</a>
    <button class="btn btn--ghost" type="button" id="gate-demo">Explore demo dashboard</button></div>
</div>

<div class="dash" id="dashboard" hidden>
  <aside class="dash-sidebar" id="dash-sidebar" aria-label="Dashboard">
    <div class="dash-user">
      <span class="avatar" aria-hidden="true">{icon("i-user")}</span>
      <div><p class="dash-user__name" data-user-full></p><p class="dash-user__email" data-user-email></p></div>
      <button type="button" class="icon-btn dash-sidebar__close" data-close-sidebar aria-label="Close menu">{icon("i-close")}</button>
    </div>
    <nav aria-label="Dashboard sections"><ul class="dash-nav">{links}
      <li><button type="button" class="nav-link" data-logout style="width:100%;padding:10px 12px;gap:12px">{icon("i-logout")}Log out</button></li></ul></nav>
  </aside>
  <button class="dash-scrim" type="button" data-close-sidebar aria-label="Close menu" tabindex="-1"></button>

  <div class="dash-main">
    <div class="dash-top">
      <button type="button" class="btn btn--ghost btn--sm dash-menu" id="dash-menu" aria-controls="dash-sidebar" aria-expanded="false">{icon("i-menu")}Menu</button>
      <h1 id="dash-view-title">Dashboard</h1>
    </div>

    <!-- OVERVIEW -->
    <section data-view="overview" aria-labelledby="dash-view-title">
      <div class="dash-welcome">
        <div class="welcome-card">
          <h2>Welcome back, <span data-user-name></span></h2>
          <p>Here's where your job search stands today.</p>
          <div class="stats">
            <div class="stat"><span class="stat__n" id="stat-apps">0</span><span class="stat__l">Applications</span></div>
            <div class="stat"><span class="stat__n" id="stat-shortlisted">0</span><span class="stat__l">Shortlisted</span></div>
            <div class="stat"><span class="stat__n" id="stat-saved">0</span><span class="stat__l">Saved jobs</span></div>
          </div>
        </div>
        <div class="panel">
          <div class="panel__head"><h2>Profile completion</h2><a class="link-btn" href="#profile">Edit</a></div>
          <div class="completion">
            <div class="ring" id="completion-ring" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Profile completion">
              <div class="ring__inner" id="completion-value">0%</div></div>
            <ul id="completion-missing"></ul>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel__head"><h2>My applications</h2><a class="link-btn" href="#applications">View all</a></div>
        <ul class="app-list" id="recent-apps"></ul>
      </div>
      <div class="panel">
        <div class="panel__head"><h2>Recommended for you</h2><a class="link-btn" href="jobs.html">Find more jobs</a></div>
        <div class="dash-grid-3" id="recommended"></div>
      </div>
    </section>

    <!-- APPLICATIONS -->
    <section data-view="applications" hidden aria-labelledby="dash-view-title">
      <div class="apps-layout">
        <ul class="app-select-list" id="app-list" aria-label="Your applications"></ul>
        <div id="app-timeline" aria-live="polite"></div>
      </div>
    </section>

    <!-- SAVED -->
    <section data-view="saved" hidden aria-labelledby="dash-view-title">
      <div class="dash-grid-3" id="saved-grid"></div>
    </section>

    <!-- PROFILE -->
    <section data-view="profile" hidden aria-labelledby="dash-view-title">
      <form class="panel" id="profile-form" novalidate style="max-width:760px">
        <div class="form-row">
          <div class="field"><label for="p-name">Full name</label><input id="p-name" name="fullName" type="text" autocomplete="name" required data-label="full name"></div>
          <div class="field"><label for="p-phone">Phone</label><input id="p-phone" name="phone" type="tel" autocomplete="tel" data-label="phone"></div>
        </div>
        <div class="form-row">
          <div class="field"><label for="p-country">Country</label><input id="p-country" name="country" type="text" autocomplete="country-name" data-label="country"></div>
          <div class="field"><label for="p-loc">Preferred location</label><input id="p-loc" name="location" type="text" placeholder="e.g. Melbourne, VIC" data-label="preferred location"></div>
        </div>
        <div class="field"><label for="p-head">Professional headline</label><input id="p-head" name="headline" type="text" placeholder="e.g. Business Analyst" data-label="headline"></div>
        <div class="field"><label for="p-skills">Key skills</label><input id="p-skills" name="skills" type="text" placeholder="Separate skills with commas" data-label="skills"></div>
        <div class="field"><label for="p-exp">Experience</label>
          <select id="p-exp" name="experience" data-label="experience"><option value="">Choose</option><option value="entry">Entry level</option><option value="1-2">1–2 years</option><option value="3-5">3–5 years</option><option value="5+">5+ years</option></select></div>
        <button class="btn btn--primary" type="submit">Save profile</button>
      </form>
    </section>

    <!-- DOCUMENTS -->
    <section data-view="documents" hidden aria-labelledby="dash-view-title">
      <div class="panel" style="max-width:760px">
        <div class="panel__head"><h2>CV</h2></div>
        <div class="cv-current" id="cv-current"></div>
        <div class="field"><label for="cv-input">Add or replace your CV</label>
          <input id="cv-input" type="file" accept=".pdf,.doc,.docx">
          <p class="field__hint">PDF or Word, up to 5 MB. In this demo only the file name is recorded. Files are never stored in your browser; a live site will upload them to secure storage.</p></div>
      </div>
    </section>

    <!-- NOTIFICATIONS -->
    <section data-view="notifications" hidden aria-labelledby="dash-view-title">
      <div class="panel" style="max-width:760px">
        <div class="panel__head"><h2>Updates</h2><button class="link-btn" type="button" id="mark-read">Mark all as read</button></div>
        <ul class="note-list" id="note-list"></ul>
      </div>
    </section>

    <!-- SETTINGS -->
    <section data-view="settings" hidden aria-labelledby="dash-view-title">
      <div class="panel" style="max-width:760px">
        <div class="panel__head"><h2>Account</h2></div>
        <p class="muted">Signed in as <strong data-user-email></strong>.</p>
        <div class="btn-row"><button class="btn btn--ghost" type="button" data-logout>{icon("i-logout")}Log out</button></div>
      </div>
      <div class="panel" style="max-width:760px">
        <div class="panel__head"><h2>Demo data</h2></div>
        <p class="muted">Clear the applications, saved jobs, notifications and profile details stored in this browser.</p>
        <button class="btn btn--danger-ghost" type="button" id="reset-demo">Reset demo data</button>
      </div>
    </section>
  </div>
</div>
</main>'''
    return page("candidate-dashboard.html", "Candidate Dashboard | My SkillBridge Recruitment Services",
                "Manage your applications, saved jobs, profile and documents.", "dashboard", body, ["dashboard.js"], show_footer=False)


# ====================================================================== LEGAL
LEGAL_NOTE = f'<p class="alert alert--warn">{icon("i-alert", "icon icon--xs")} Template text. Have this page reviewed by a qualified legal professional before the website goes live.</p>'


def legal(filename, title, lead, sections, description):
    secs = ""
    for h, items in sections:
        secs += f"<h2>{h}</h2>"
        for it in items:
            secs += f"<ul>{''.join(f'<li>{x}</li>' for x in it)}</ul>" if isinstance(it, list) else f"<p>{it}</p>"
    body = f'''<main id="main">
{page_hero(title, lead, title)}
<div class="container container--narrow legal">{LEGAL_NOTE}<p class="muted">Last updated: [date]</p>{secs}</div>
</main>'''
    return page(filename, f"{title} | My SkillBridge Recruitment Services", description, "", body)


def privacy():
    return legal("privacy.html", "Privacy Policy", "How My SkillBridge collects, uses and protects personal information.", [
        ("Information we collect", ["We collect information you give us when you create a profile, apply for a job or contact us, such as:",
                                    ["Name, email address, phone number and country", "Your CV and information about your skills, qualifications and experience", "Messages you send us"],
                                    "We only ask for information needed to provide our recruitment services."]),
        ("How we use your information", [["To create and manage your account", "To share your application with the employer you applied to", "To keep you informed about your applications", "To respond to enquiries"]]),
        ("Sharing your information", ["We share application information with the employer you apply to. We do not sell personal information."]),
        ("Storage and security", ["[Describe where data is stored and the security measures used.]"]),
        ("Access and correction", ["You can view and update your profile in your dashboard, or contact us to request access to or correction of your information."]),
        ("Contact", ['Questions about privacy can be sent through our <a href="contact.html">contact page</a>.']),
    ], "How My SkillBridge Recruitment Services collects, uses and protects personal information.")


def terms():
    return legal("terms.html", "Terms & Conditions", "The terms that apply when you use the My SkillBridge website and services.", [
        ("Using this website", ["By using this website you agree to these terms. [Add full terms.]"]),
        ("Accounts", [["Keep your login details secure", "Provide accurate information in your profile and applications", "You are responsible for activity on your account"]]),
        ("Job listings", ["Listings are provided by employers. My SkillBridge does not guarantee that any role will result in employment, and does not provide migration or visa advice."]),
        ("Employers", ["Employers are responsible for the accuracy of their listings and for their recruitment decisions, including compliance with employment and migration laws."]),
        ("Changes", ["We may update these terms from time to time. [Add details.]"]),
    ], "Terms and conditions for using the My SkillBridge Recruitment Services website.")


def disclaimer():
    return legal("disclaimer.html", "Disclaimer", "Important information about the content on this website.", [
        ("General information only", ["Content on this website is general information and is not legal, financial, migration or visa advice."]),
        ("Visa and work rights", ["Visa and work-right requirements depend on the specific role and each individual's circumstances. A job listing does not mean that a candidate is eligible for a visa or that sponsorship is available. Review official Australian Government information, and seek advice from a registered migration agent or legal practitioner where appropriate."]),
        ("Profile comparison tool", ["The job profile tool provides a general comparison based on information entered by the user. It does not determine employment eligibility, visa eligibility or immigration outcomes."]),
        ("Job listings", ["Listings, including salary information, are supplied by employers or are sample content and may change without notice."]),
    ], "Disclaimer for the My SkillBridge Recruitment Services website.")

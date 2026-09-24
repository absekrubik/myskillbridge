from partials import icon, page

AU = open("au_path.txt").read()

INDUSTRIES = [
    ("ICT", "Technology", "i-chip", "Software, ICT, cyber security and IT"),
    ("Hospitality", "Hospitality", "i-cup", "Restaurants, hotels and management"),
    ("Accounting", "Accounting", "i-calc", "Accounting, finance and payroll"),
    ("Construction", "Construction", "i-helmet", "Trades, construction and engineering"),
    ("Healthcare", "Healthcare", "i-heart", "Healthcare, support and allied health"),
]

# Industry tags spelled the way the brief lists them (with bullets)
IND_TAGS = {
    "ICT": "Software • ICT • Cyber Security • IT",
    "Hospitality": "Restaurants • Hotels • Management",
    "Accounting": "Accounting • Finance • Payroll",
    "Construction": "Trades • Construction • Engineering",
    "Healthcare": "Healthcare • Support • Allied Health",
}


def search_panel(title_tag="h2"):
    opts = "".join(f'<option value="{k}">{label}</option>' for k, label, *_ in INDUSTRIES) + '<option value="Other">Other</option>'
    return f'''<div class="search-panel">
  <{title_tag} class="search-panel__title" id="search-title">Find your opportunity</{title_tag}>
  <form class="search-form" data-job-search role="search" aria-labelledby="search-title">
    <div class="search-field">{icon("i-search")}
      <label class="sr-only" for="s-q">Job title, skill or keyword</label>
      <input id="s-q" name="q" type="search" placeholder="e.g. ICT Business Analyst" autocomplete="off">
    </div>
    <div class="search-field">{icon("i-pin")}
      <label class="sr-only" for="s-loc">Location</label>
      <input id="s-loc" name="location" type="text" placeholder="City or state, e.g. VIC">
    </div>
    <div class="search-field">{icon("i-grid")}
      <label class="sr-only" for="s-ind">Industry</label>
      <select id="s-ind" name="industry"><option value="">All industries</option>{opts}</select>
    </div>
    <button class="btn btn--primary" type="submit">{icon("i-search")}Search jobs</button>
  </form>
</div>'''


def map_panel():
    cities = [("Sydney", 376.4, 231.0, "end", -10, 4), ("Melbourne", 317.5, 268.1, "end", -10, 16),
              ("Brisbane", 393.5, 170.2, "end", -10, 4), ("Perth", 41.1, 212.5, "start", 10, 4),
              ("Adelaide", 256.7, 240.5, "end", -10, -8), ("Darwin", 182.6, 27.8, "start", 10, 4)]
    dots = "".join(
        f'<circle class="city-dot" cx="{x}" cy="{y}" r="4"/>'
        f'<text class="city-label" x="{x + dx}" y="{y + dy}" text-anchor="{a}">{n}</text>'
        for n, x, y, a, dx, dy in cities)
    return f'''<div class="map-panel" role="img" aria-label="Map of Australia showing opportunities in major cities, connecting a candidate in Perth with a role in Melbourne">
  <svg class="map-panel__svg" viewBox="0 0 408 336" aria-hidden="true" focusable="false">
    <defs>
      <pattern id="au-dots" width="7" height="7" patternUnits="userSpaceOnUse">
        <rect width="7" height="7" fill="#0E2A5E"/><circle cx="3.5" cy="3.5" r="1.4" fill="#5C8BE8"/>
      </pattern>
    </defs>
    <path class="au-glow" d="{AU}"/>
    <path class="au-land" d="{AU}"/>
    <path class="bridge-path" d="M41 212 C 120 120, 250 150, 317 268"/>
    <circle class="city-pulse" cx="41.1" cy="212.5" r="8"/>
    <circle class="city-pulse" cx="317.5" cy="268.1" r="8"/>
    {dots}
  </svg>
  <div class="float-card float-card--job">
    <span class="float-card__icon">{icon("i-briefcase")}</span>
    <div><p class="float-card__title">ICT Business Analyst</p><p class="float-card__meta">Melbourne, VIC, full time</p></div>
  </div>
  <div class="float-card float-card--match">
    <span class="float-card__icon">{icon("i-check")}</span>
    <div><p class="float-card__title">Experience matches criteria</p><p class="float-card__meta">3+ years listed</p></div>
  </div>
</div>'''


# ======================================================================= HOME
def home():
    steps = [("Discover", "Find opportunities that match your skills."),
             ("Check", "Review the job requirements and criteria."),
             ("Apply", "Create your profile and submit your application."),
             ("Connect", "Connect with employers through the recruitment process.")]
    steps_html = "".join(f'<li class="step"><span class="step__n">0{i+1}</span><h3>{t}</h3><p>{d}</p></li>'
                         for i, (t, d) in enumerate(steps))
    ind_html = "".join(f'''<a class="industry-card" data-tilt href="jobs.html?industry={k}">
      <span class="industry-card__icon">{icon(ic)}</span><h3>{label}</h3><p>{IND_TAGS[k]}</p>
      <span class="industry-card__count" data-industry-count="{k}">View jobs</span></a>''' for k, label, ic, _ in INDUSTRIES)
    features = [("i-clipboard", "Clear job information", "Understand requirements before applying."),
                ("i-send", "Easy application", "A simple application process."),
                ("i-target", "Career focused", "Opportunities organised around skills and experience."),
                ("i-eye", "Transparent process", "Clear information throughout your recruitment journey.")]
    feat_html = "".join(f'<div class="feature"><span class="feature__icon">{icon(ic)}</span><h3>{t}</h3><p>{d}</p></div>'
                        for ic, t, d in features)

    body = f'''<main id="main">
<section class="hero" aria-labelledby="hero-title">
  <div class="hero__orbs" aria-hidden="true"><span></span><span></span><span></span></div>
  <div class="container">
    <div class="hero__grid">
      <div>
        <h1 class="hero__title" id="hero-title"><span class="line">Find your next</span><span class="line"><span class="hl">opportunity</span> in Australia</span></h1>
        <p class="hero__eyebrow"><span class="live-dot" aria-hidden="true"></span>Now hiring in <span class="rotator"><span data-rotate="ICT|Hospitality|Accounting|Construction|Healthcare|Logistics">ICT</span></span></p>
        <p class="hero__lead">Explore employment opportunities that match your skills, experience and career goals.</p>
        <div class="btn-row">
          <a class="btn btn--primary btn--lg" href="jobs.html">{icon("i-search")}Find jobs</a>
          <a class="btn btn--ghost btn--lg" href="register.html">Create your profile</a>
        </div>
        <ul class="hero__note">
          <li>{icon("i-check")}Free for candidates</li>
          <li>{icon("i-check")}Clear job criteria</li>
          <li>{icon("i-check")}Track every application</li>
        </ul>
      </div>
      {map_panel()}
    </div>
    <div class="search-wrap">{search_panel()}</div>
  </div>
</section>

<section class="impact after-search" aria-label="My SkillBridge at a glance">
  <div class="container">
    <ul class="impact__grid">
      <li class="impact__item"><span class="impact__n" data-count="0" data-count-jobs>0</span><span class="impact__l">Open roles right now</span></li>
      <li class="impact__item"><span class="impact__n" data-count="6">0</span><span class="impact__l">Industries covered</span></li>
      <li class="impact__item"><span class="impact__n" data-count="8">0</span><span class="impact__l">States &amp; territories</span></li>
      <li class="impact__item"><span class="impact__n" data-count="100" data-suffix="%">0</span><span class="impact__l">Free for candidates</span></li>
    </ul>
  </div>
  <div class="marquee" aria-hidden="true"><ul class="marquee__track"><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Software Developer</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Restaurant Manager</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Accountant</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Aged Care Worker</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Electrician</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Business Analyst</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Warehouse Supervisor</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Chef</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Registered Nurse</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Carpenter</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Cyber Security Analyst</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Payroll Officer</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Software Developer</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Restaurant Manager</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Accountant</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Aged Care Worker</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Electrician</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Business Analyst</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Warehouse Supervisor</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Chef</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Registered Nurse</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Carpenter</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Cyber Security Analyst</li><li><svg class="icon icon--xs" aria-hidden="true" focusable="false"><use href="#i-briefcase"></use></svg>Payroll Officer</li></ul></div>
</section>

<section class="section" aria-labelledby="journey-title">
  <div class="container">
    <div class="section-head">
      <h2 id="journey-title">Your journey starts here</h2>
      <p>Four simple steps from finding a role to speaking with an employer.</p>
    </div>
    <ol class="steps" data-inview>{steps_html}</ol>
  </div>
</section>

<section class="section section--tint" aria-labelledby="featured-title">
  <div class="container">
    <div class="section-head section-head--row">
      <div><h2 id="featured-title">Featured opportunities</h2><p>A selection of current roles. Save any job to come back to it later.</p></div>
      <a class="btn btn--ghost" href="jobs.html">View all jobs</a>
    </div>
    <div class="job-grid" id="featured-jobs" aria-live="polite"></div>
  </div>
</section>

<section class="section" aria-labelledby="industry-title">
  <div class="container">
    <div class="section-head"><h2 id="industry-title">Explore opportunities by industry</h2>
      <p>Choose an industry to see matching jobs.</p></div>
    <div class="industry-grid">{ind_html}</div>
  </div>
</section>

<section class="section section--tint" aria-labelledby="why-title">
  <div class="container why">
    <div class="why__intro">
      <h2 id="why-title">A clearer way to find your next opportunity</h2>
      <p class="muted">Every listing shows what the employer is looking for, so you can decide with confidence before you apply.</p>
      <a class="text-link" href="how-it-works.html">See how the process works</a>
    </div>
    <div class="feature-list">{feat_html}</div>
  </div>
</section>

<section class="section" aria-label="For candidates and employers">
  <div class="container audience">
    <div class="audience-card audience-card--candidate" data-tilt>
      <div class="audience-card__art" aria-hidden="true">{icon("i-user")}</div>
      <h2>Your next career move starts here</h2>
      <p>Create your profile, upload your CV and discover opportunities that match your skills and experience.</p>
      <div class="btn-row">
        <a class="btn btn--light" href="register.html">Create your profile</a>
        <a class="btn btn--outline-light" href="jobs.html">Browse jobs</a>
      </div>
    </div>
    <div class="audience-card audience-card--employer" data-tilt>
      <span class="card__icon">{icon("i-building")}</span>
      <h2>Looking for skilled talent?</h2>
      <p>Connect with candidates whose skills and experience match your recruitment needs.</p>
      <div class="btn-row"><a class="btn btn--navy" href="employers.html">For employers</a></div>
    </div>
  </div>
</section>

<section class="section section--tint" aria-labelledby="res-title">
  <div class="container">
    <div class="section-head section-head--row">
      <div><h2 id="res-title">Career resources</h2><p>Practical guides for every stage of your job search.</p></div>
      <a class="btn btn--ghost" href="resources.html">View all resources</a>
    </div>
    <div class="grid grid-3" data-resources="6"></div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="final-cta" data-reveal>
      <h2>Ready for your next opportunity?</h2>
      <p>Find jobs. Understand the criteria. Apply with confidence.</p>
      <a class="btn btn--primary btn--lg" href="jobs.html">Find jobs</a>
    </div>
  </div>
</section>
</main>'''
    return page("index.html", "My SkillBridge Recruitment Services | Australian Employment Opportunities",
                "Find employment opportunities in Australia that match your skills and experience. Search jobs, review clear criteria, apply and track your application.",
                "home", body, ["filters.js", "jobs.js", "resources.js"])


# ======================================================================= JOBS
def jobs():
    def group(name, legend, options):
        boxes = "".join(f'<label class="check"><input type="checkbox" name="{name}" value="{v}">{l}</label>' for v, l in options)
        return f'<fieldset class="filter-group"><legend>{legend}</legend>{boxes}</fieldset>'

    groups = (
        group("industry", "Industry", [(k, k if k != "ICT" else "ICT") for k, *_ in INDUSTRIES] + [("Other", "Other")]) +
        group("state", "Location", [(s, s) for s in ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]]) +
        group("employment", "Employment", [(s, s) for s in ["Full Time", "Part Time", "Contract"]]) +
        group("experience", "Experience", [("entry", "Entry Level"), ("1-2", "1–2 Years"), ("3-5", "3–5 Years"), ("5+", "5+ Years")]) +
        '''<fieldset class="filter-group"><legend>Sponsorship</legend>
          <label class="check"><input type="checkbox" name="sponsor" value="1">Sponsorship information provided</label>
          <p class="filter-note">Shows listings where the employer has shared vacancy information about sponsorship. A listing does not mean a candidate is eligible for a visa.</p>
        </fieldset>''')

    body = f'''<main id="main">
<section class="jobs-hero" aria-labelledby="jobs-title">
  <div class="container">
    <h1 id="jobs-title">Find your next opportunity</h1>
    <form class="search-form" id="jobs-search" role="search" aria-label="Search jobs">
      <div class="search-field">{icon("i-search")}<label class="sr-only" for="j-q">Job title, skill or keyword</label>
        <input id="j-q" name="q" type="search" placeholder="e.g. ICT Business Analyst" autocomplete="off"></div>
      <div class="search-field">{icon("i-pin")}<label class="sr-only" for="j-loc">Location</label>
        <input id="j-loc" name="location" type="text" placeholder="City or state"></div>
      <button class="btn btn--primary" type="submit">Search jobs</button>
    </form>
  </div>
</section>

<div class="container jobs-layout">
  <aside class="filters" id="filters" aria-label="Job filters">
    <div class="filters__panel">
      <div class="filters__head">
        <h2>Filter jobs</h2>
        <button type="button" class="icon-btn filters__close" data-close-filters aria-label="Close filters">{icon("i-close")}</button>
        <button type="button" class="link-btn" data-clear-filters>Clear</button>
      </div>
      <form class="filters__body" id="filter-form" onsubmit="return false">{groups}</form>
      <div class="filters__foot">
        <button type="button" class="btn btn--ghost" data-clear-filters>Clear filters</button>
        <button type="button" class="btn btn--primary" id="show-results" data-close-filters>Show jobs</button>
      </div>
    </div>
  </aside>

  <section aria-labelledby="job-count">
    <div class="results-bar">
      <h2 class="results-count" id="job-count" aria-live="polite">Loading opportunities…</h2>
      <button type="button" class="btn btn--ghost open-filters" id="open-filters" aria-controls="filters" aria-expanded="false">
        {icon("i-filter")}Filter jobs <span class="filter-badge" id="filter-badge" hidden>0</span></button>
      <label class="sort" for="sort">Sort by
        <select id="sort">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="deadline">Closing soon</option>
          <option value="salary-high">Salary (highest)</option>
          <option value="title">Job title (A–Z)</option>
        </select>
      </label>
    </div>
    <div class="active-filters" id="active-filters" aria-label="Active filters"></div>
    <div class="job-results" id="job-results" tabindex="-1"></div>
  </section>
</div>
</main>'''
    return page("jobs.html", "Jobs | My SkillBridge Recruitment Services",
                "Search and filter current job opportunities across Australia by industry, location, employment type and experience.",
                "jobs", body, ["filters.js", "jobs.js"])


# ================================================================ JOB DETAILS
def job_details():
    body = f'''<main id="main">
<div id="job-detail" aria-live="polite">
  <div class="container" style="padding-block:48px">
    <div class="job-card job-card--skeleton" aria-hidden="true" style="max-width:720px">
      <div class="sk sk--chip"></div><div class="sk sk--title"></div><div class="sk sk--line"></div><div class="sk sk--line sk--short"></div>
    </div>
    <p class="sr-only">Loading job details…</p>
  </div>
</div>
<section class="section section--tint section--tight" id="related-jobs" aria-labelledby="related-title">
  <div class="container">
    <div class="section-head section-head--row"><div><h2 id="related-title">Similar opportunities</h2></div>
      <a class="btn btn--ghost" href="jobs.html">View all jobs</a></div>
    <div class="job-grid"></div>
  </div>
</section>
</main>'''
    return page("job-details.html", "Job details | My SkillBridge Recruitment Services",
                "View the role description, responsibilities, job criteria and required skills, then apply online.",
                "jobs", body, ["filters.js", "jobs.js"], body_class="page-job-details")

from partials import icon, page


def page_hero(title, lead, crumbs, buttons="", navy=False):
    trail = '<a href="index.html">Home</a><span aria-hidden="true">/</span>' + f'<span aria-current="page">{crumbs}</span>'
    return f'''<section class="page-hero{' page-hero--navy' if navy else ''}">
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb">{trail}</nav>
    <h1>{title}</h1>
    <p>{lead}</p>
    {f'<div class="btn-row">{buttons}</div>' if buttons else ''}
  </div>
</section>'''


def cta_band(title, text, buttons):
    return f'''<section class="section"><div class="container"><div class="final-cta" data-reveal>
  <h2>{title}</h2><p>{text}</p><div class="btn-row" style="justify-content:center">{buttons}</div></div></div></section>'''


# ============================================================== HOW IT WORKS
def how_it_works():
    steps = [
        ("Discover", "You", "Search jobs by keyword, location or industry and save the ones that interest you."),
        ("Review", "You", "Read the role description and job criteria to check the experience, qualifications and skills the employer is asking for."),
        ("Create profile", "You", "Register for free, add your details and upload your CV so your application is ready to go."),
        ("Apply", "You", "Submit your application with a short message to the employer."),
        ("Application review", "My SkillBridge", "Your application is checked for completeness and shared with the employer. You'll see progress in your dashboard."),
        ("Interview", "Employer", "If your profile matches the role, the employer may invite you to an interview."),
        ("Employer decision", "Employer", "The employer makes the final decision and you're notified of the outcome."),
    ]
    tl = "".join(f'''<li class="journey__step" data-reveal>
      <span class="journey__n">{i+1}</span>
      <div class="journey__body"><span class="journey__who">{who}</span><h3>{t}</h3><p>{d}</p></div></li>''' for i, (t, who, d) in enumerate(steps))
    faqs = [
        ("Does it cost anything to create a profile?", "No. Creating a candidate profile, saving jobs and applying are free."),
        ("Can I apply for more than one job?", "Yes. You can apply for any number of roles and track each one separately in your dashboard."),
        ("Will a job listing tell me if I'm eligible for a visa?", "No. Listings describe the role and the employer's criteria only. Visa and work-right requirements depend on your individual circumstances. Always check official Australian Government information."),
        ("How long does the process take?", "It varies by role and employer. Your dashboard shows each stage so you always know where your application is."),
    ]
    acc = "".join(f'''<div class="accordion__item"><h3 style="margin:0">
      <button class="accordion__trigger" type="button" aria-expanded="false" aria-controls="faq-{i}">{q}{icon("i-plus")}</button></h3>
      <div class="accordion__panel" id="faq-{i}" hidden><p>{a}</p></div></div>''' for i, (q, a) in enumerate(faqs))
    body = f'''<main id="main">
{page_hero("How it works", "From your first search to the employer's decision, here is every step of the candidate journey.", "How it works",
  f'<a class="btn btn--primary" href="jobs.html">Find jobs</a><a class="btn btn--ghost" href="register.html">Create your profile</a>')}
<section class="section" aria-labelledby="journey-title">
  <div class="container">
    <div class="section-head section-head--center"><h2 id="journey-title">The candidate journey</h2>
      <p>Seven clear stages. You'll always know what happens next.</p></div>
    <ol class="journey">{tl}</ol>
  </div>
</section>
<section class="section section--tint" aria-labelledby="faq-title">
  <div class="container container--narrow">
    <h2 id="faq-title">Common questions</h2>
    <div class="accordion">{acc}</div>
  </div>
</section>
{cta_band("Ready to take the first step?", "Search current opportunities and save the ones that suit you.", '<a class="btn btn--primary btn--lg" href="jobs.html">Find jobs</a>')}
</main>'''
    return page("how-it-works.html", "How It Works | My SkillBridge Recruitment Services",
                "See each step of the candidate journey, from discovering a job to the employer's decision.",
                "how", body)


# ================================================================ CANDIDATES
def candidates():
    three = [("i-user", "Create profile", "Register for free and add your contact details and experience."),
             ("i-upload", "Upload CV", "Add your CV once and use it for every application."),
             ("i-send", "Apply for jobs", "Apply in a few steps and follow each application's progress.")]
    three_html = "".join(f'<li class="step"><span class="step__n">0{i+1}</span><h3>{t}</h3><p>{d}</p></li>' for i, (_, t, d) in enumerate(three))
    why = [("i-bookmark", "Save jobs", "Keep a shortlist of roles to come back to."),
           ("i-send", "Apply faster", "Your details and CV are ready for every application."),
           ("i-folder", "Manage applications", "See every application in one place."),
           ("i-clock", "Track application status", "Know which stage each application has reached."),
           ("i-clipboard", "Stay organised", "Keep your professional information up to date.")]
    why_html = "".join(f'<div class="card"><span class="card__icon">{icon(ic)}</span><h3>{t}</h3><p>{d}</p></div>' for ic, t, d in why)
    why_html += f'''<div class="card card--flat" style="display:flex;flex-direction:column;justify-content:center">
      <h3>It's free to join</h3><p style="margin-bottom:16px">Set up your profile in a few minutes.</p>
      <a class="btn btn--primary" href="register.html">Create free profile</a></div>'''

    body = f'''<main id="main">
{page_hero("Your next opportunity starts here", "Create a free profile, upload your CV and apply for roles that match your skills and experience.", "For candidates",
  f'<a class="btn btn--primary" href="register.html">Create free profile</a><a class="btn btn--ghost" href="jobs.html">Browse jobs</a>')}
<section class="section" aria-labelledby="three-title">
  <div class="container">
    <div class="section-head"><h2 id="three-title">Three steps to apply</h2></div>
    <ol class="steps steps--3">{three_html}</ol>
  </div>
</section>
<section class="section section--tint" aria-labelledby="why-profile">
  <div class="container">
    <div class="section-head"><h2 id="why-profile">Why create a profile?</h2>
      <p>A profile keeps your job search in one place.</p></div>
    <div class="grid grid-3">{why_html}</div>
  </div>
</section>

<section class="section" id="profile-check" aria-labelledby="check-title">
  <div class="container check-tool">
    <div class="tool-intro">
      <h2 id="check-title">Check your job profile</h2>
      <p class="muted">Compare your experience, qualifications and skills with the criteria listed for a role. It takes about a minute.</p>
      <p class="disclaimer">{icon("i-info", "icon icon--xs")}This tool provides a general profile comparison based on information entered by the user. It does not determine employment eligibility, visa eligibility or immigration outcomes.</p>
      <div class="result-card" id="profile-check-result" tabindex="-1" hidden aria-live="polite" style="margin-top:24px"></div>
    </div>
    <form class="card" id="profile-check-form" novalidate>
      <div class="field"><label for="pc-occ">Occupation <span class="req" aria-hidden="true">*</span></label>
        <select id="pc-occ" name="occupation" required data-label="occupation"></select>
        <p class="field__hint">Choose the listed role you want to compare against.</p></div>
      <div class="form-row">
        <div class="field"><label for="pc-years">Years of relevant experience <span class="req" aria-hidden="true">*</span></label>
          <input id="pc-years" name="years" type="number" min="0" max="50" inputmode="numeric" required data-label="years of experience"></div>
        <div class="field"><label for="pc-qual">Highest qualification <span class="req" aria-hidden="true">*</span></label>
          <select id="pc-qual" name="qualification" required data-label="highest qualification"></select></div>
      </div>
      <div class="field"><label for="pc-skills">Key skills <span class="req" aria-hidden="true">*</span></label>
        <input id="pc-skills" name="skills" type="text" required placeholder="e.g. Documentation, Stakeholder Management" data-label="key skills">
        <p class="field__hint">Separate skills with commas.</p></div>
      <div class="form-row">
        <div class="field"><label for="pc-loc">Location <span class="req" aria-hidden="true">*</span></label>
          <select id="pc-loc" name="location" required data-label="location"><option value="">Choose a state or territory</option>
            <option>NSW</option><option>VIC</option><option>QLD</option><option>WA</option><option>SA</option><option>TAS</option><option>ACT</option><option>NT</option><option value="Outside Australia">Outside Australia</option></select></div>
        <div class="field"><label for="pc-eng">English proficiency <span class="req" aria-hidden="true">*</span></label>
          <select id="pc-eng" name="english" required data-label="English proficiency"><option value="">Choose a level</option>
            <option>Basic</option><option>Conversational</option><option>Professional</option><option>Fluent / native</option></select></div>
      </div>
      <button class="btn btn--primary btn--block" type="submit">See profile summary</button>
    </form>
  </div>
</section>
{cta_band("Start your profile today", "Save jobs, apply faster and track every application.", '<a class="btn btn--primary btn--lg" href="register.html">Create free profile</a>')}
</main>'''
    return page("candidates.html", "For Candidates | My SkillBridge Recruitment Services",
                "Create a free candidate profile, upload your CV, apply for jobs in Australia and track your applications.",
                "candidates", body, ["dashboard.js"])


# ================================================================= EMPLOYERS
def employers():
    steps = [("Post a vacancy", "Tell us about the role, location and employment type."),
             ("Share your requirements", "Set out the experience, qualifications and skills you need."),
             ("Review candidates", "Receive applications from candidates whose profiles match your criteria."),
             ("Connect with suitable talent", "Interview shortlisted candidates and make your decision.")]
    steps_html = "".join(f'<li class="step"><span class="step__n">0{i+1}</span><h3>{t}</h3><p>{d}</p></li>' for i, (t, d) in enumerate(steps))
    benefits = [("i-clipboard", "Clear listings", "Structured job criteria help candidates self-assess before applying."),
                ("i-users", "Relevant applicants", "Candidates are organised around skills and experience."),
                ("i-eye", "Transparent process", "Candidates can see the stage of their application, reducing follow-up enquiries.")]
    ben_html = "".join(f'<div class="card"><span class="card__icon">{icon(ic)}</span><h3>{t}</h3><p>{d}</p></div>' for ic, t, d in benefits)
    body = f'''<main id="main">
{page_hero("Find the talent your business needs", "Share your requirements and connect with candidates whose skills and experience match your roles.", "For employers",
  f'<a class="btn btn--light" href="register.html?role=employer">Register as an employer</a><a class="btn btn--outline-light" href="contact.html">Talk to us</a>', navy=True)}
<section class="section" aria-labelledby="emp-process">
  <div class="container">
    <div class="section-head"><h2 id="emp-process">How recruitment works</h2>
      <p>A straightforward process from vacancy to hire.</p></div>
    <ol class="steps">{steps_html}</ol>
  </div>
</section>
<section class="section section--tint" aria-labelledby="emp-benefits">
  <div class="container">
    <div class="section-head"><h2 id="emp-benefits">Why employers use My SkillBridge</h2></div>
    <div class="grid grid-3">{ben_html}</div>
    <p class="muted mt-lg" style="font-size:.9rem">Employers are responsible for their own recruitment decisions and for meeting any legal obligations related to the roles they advertise, including work-right and sponsorship requirements.</p>
  </div>
</section>
{cta_band("Ready to find skilled talent?", "Register your business to post vacancies, review candidates and assign new hires.", '<a class="btn btn--primary btn--lg" href="register.html?role=employer">Register as an employer</a><a class="btn btn--ghost btn--lg" href="employer-dashboard.html">Try the employer demo</a>')}
</main>'''
    return page("employers.html", "For Employers | My SkillBridge Recruitment Services",
                "Post vacancies, share your requirements and connect with skilled candidates for roles in Australia.",
                "employers", body)


# ================================================================= RESOURCES
def resources():
    body = f'''<main id="main">
{page_hero("Career resources", "Practical, plain-English guides to help you prepare, apply and plan your career.", "Resources")}
<section class="section" aria-label="All resources">
  <div class="container"><div class="grid grid-3" data-resources></div></div>
</section>
</main>'''
    return page("resources.html", "Career Resources | My SkillBridge Recruitment Services",
                "Guides on Australian CVs, interview preparation, job descriptions, career planning and working in Australia.",
                "resources", body, ["resources.js"])


def resource():
    body = '''<main id="main">
<article class="article"><div class="container container--narrow" id="resource-article" aria-live="polite">
  <p class="muted">Loading article…</p></div></article>
<section class="section section--tint section--tight" aria-labelledby="more-title">
  <div class="container"><div class="section-head section-head--row"><div><h2 id="more-title">More resources</h2></div>
  <a class="btn btn--ghost" href="resources.html">View all resources</a></div>
  <div class="grid grid-3" id="more-resources"></div></div>
</section>
</main>'''
    return page("resource.html", "Career Resource | My SkillBridge Recruitment Services",
                "Career guidance from My SkillBridge Recruitment Services.", "resources", body, ["resources.js"])


# ===================================================================== ABOUT
def about():
    blocks = [("Our purpose", "To make it easier for skilled people to find genuine employment opportunities in Australia, and for employers to find the people they need."),
              ("Our approach", "We present every job with clear criteria and a simple application process, so candidates can make informed decisions and employers receive relevant applications."),
              ("For candidates", "A free profile, clear job information and visibility of your application at every stage."),
              ("For employers", "A structured way to share your requirements and connect with candidates whose skills match.")]
    blocks_html = "".join(f'<div class="prose-block"><h2>{t}</h2><p>{d}</p></div>' for t, d in blocks)
    values = [("i-eye", "Transparency", "Clear information about roles, criteria and each stage of the process."),
              ("i-home", "Accessibility", "A simple experience that works for first-time job seekers on any device."),
              ("i-bridge", "Connection", "Bringing the right candidates and employers together.")]
    val_html = "".join(f'<div class="value">{icon(ic)}<h3>{t}</h3><p>{d}</p></div>' for ic, t, d in values)
    body = f'''<main id="main">
{page_hero("Connecting talent with opportunities", "My SkillBridge Recruitment Services helps skilled candidates and Australian employers find each other through a clear, transparent recruitment process.", "About us")}
<section class="section"><div class="container"><div class="grid grid-2" style="gap:48px 64px">{blocks_html}</div></div></section>
<section class="section section--tint" aria-labelledby="values-title">
  <div class="container">
    <div class="section-head"><h2 id="values-title">Our values</h2></div>
    <div class="grid grid-3">{val_html}</div>
  </div>
</section>
{cta_band("Get in touch", "Questions about a role or recruiting with us? We're here to help.", '<a class="btn btn--primary btn--lg" href="contact.html">Contact us</a>')}
</main>'''
    return page("about.html", "About Us | My SkillBridge Recruitment Services",
                "Learn about My SkillBridge Recruitment Services, our purpose, our approach and our values.", "about", body)


# =================================================================== CONTACT
def contact():
    ph = '<span class="placeholder">Placeholder</span>'
    info = [("i-mail", "Email", f"[email address to be added] {ph}"),
            ("i-phone", "Phone", f"[phone number to be added] {ph}"),
            ("i-building", "Office", f"[office address to be added] {ph}"),
            ("i-clock", "Business hours", f"[business hours to be added] {ph}")]
    info_html = "".join(f'<div class="contact-item">{icon(ic)}<div><h3>{t}</h3><p>{d}</p></div></div>' for ic, t, d in info)
    body = f'''<main id="main">
{page_hero("Contact us", "Send us a message and we'll reply by email.", "Contact")}
<section class="section"><div class="container contact-grid">
  <form class="card" id="contact-form" novalidate aria-labelledby="form-title">
    <h2 id="form-title" style="font-size:1.4rem">Send a message</h2>
    <div class="form-row">
      <div class="field"><label for="c-name">Full name <span class="req" aria-hidden="true">*</span></label>
        <input id="c-name" name="fullName" type="text" autocomplete="name" required data-label="full name"></div>
      <div class="field"><label for="c-email">Email <span class="req" aria-hidden="true">*</span></label>
        <input id="c-email" name="email" type="email" autocomplete="email" required data-label="email"></div>
    </div>
    <div class="form-row">
      <div class="field"><label for="c-phone">Phone</label>
        <input id="c-phone" name="phone" type="tel" autocomplete="tel" data-label="phone"></div>
      <div class="field"><label for="c-subject">Subject <span class="req" aria-hidden="true">*</span></label>
        <select id="c-subject" name="subject" required data-label="subject"><option value="">Choose a subject</option>
          <option>Question about a job</option><option>My application</option><option>Employer enquiry</option><option>Technical help</option><option>Other</option></select></div>
    </div>
    <div class="field"><label for="c-msg">Message <span class="req" aria-hidden="true">*</span></label>
      <textarea id="c-msg" name="message" rows="6" required minlength="10" maxlength="2000" data-label="message"></textarea></div>
    <div class="field field--check"><input id="c-consent" name="consent" type="checkbox" required>
      <label for="c-consent">I agree to My SkillBridge using these details to respond to my enquiry, as set out in the <a href="privacy.html">Privacy Policy</a>.</label></div>
    <button class="btn btn--primary" type="submit">Send message</button>
  </form>
  <div class="contact-info" aria-label="Contact details">{info_html}
    <p class="muted" style="font-size:.85rem">Contact details above are placeholders. Replace them in <code>contact.html</code> before launch.</p>
  </div>
</div></section>
</main>'''
    return page("contact.html", "Contact | My SkillBridge Recruitment Services",
                "Contact My SkillBridge Recruitment Services with questions about jobs, applications or recruiting.", "contact", body)

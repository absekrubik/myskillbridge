# My SkillBridge Recruitment Services — Website

**Connecting talent with opportunities.**
A responsive recruitment platform front end built with HTML5, CSS3 and vanilla JavaScript. No frameworks, no build step required to run.

> **Demo status:** jobs, employer names, salaries, contact details and legal text are placeholders. Login, applications and saved jobs are stored in the visitor's browser (localStorage) for demonstration only and are **not secure**.

---

## 1. How to run

**Quickest:** open `index.html` in a browser.

**Recommended** (matches a real web server):

```bash
cd myskillbridge
python3 -m http.server 8000      # or: npx serve .
```

Then visit `http://localhost:8000`.

To try the dashboards straight away, go to **Log in** and choose **Demo candidate** or **Demo employer**.

**Hiring flow end to end:** log in as the demo employer and post a job → log out, log in as the demo candidate and apply for that job → log back in as the employer: the candidate appears under *Applicants*. Move them through the stages and *Hire* them (the candidate is notified and their dashboard updates), then assign them under *Assign employees*.

---

## 2. Project structure

```
myskillbridge/
├── index.html                 Homepage
├── jobs.html                  Search, filter, sort (reads URL params)
├── job-details.html           ?id=<job-id>
├── how-it-works.html          Candidate journey timeline + FAQ
├── candidates.html            Candidate info + "Check your job profile" tool
├── employers.html
├── resources.html             Resource list
├── resource.html              ?id=<resource-id> article page
├── about.html  contact.html
├── login.html  register.html  Demo auth (candidate + employer)
├── candidate-dashboard.html   Overview, applications/tracking, saved jobs,
│                              profile, documents, notifications, settings
├── employer-dashboard.html    Job posts (post/edit/close/delete), applicant
│                              pipeline (stage, hire, not suitable, notes),
│                              assign employees (site, team, supervisor,
│                              start date, shift), company profile
├── privacy.html  terms.html  disclaimer.html   Template legal pages
│
├── css/
│   ├── style.css              Design tokens (top of file) + all components
│   ├── responsive.css         Breakpoints: 1400 / 1240 / 1200 / 1024 / 900 / 640 / 400
│   └── animations.css         Keyframes + motion; on for every device, footer
│                              "Animations: On/Off" switch lets visitors turn it off
│
├── js/
│   ├── jobs-data.js           ★ Sample job data (edit this to add jobs)
│   ├── services.js            ★ Data layer: the ONLY file that touches storage/API
│   ├── main.js                Nav, toasts, modals, validation, job cards, apply flow
│   ├── filters.js             Pure search/filter/sort functions
│   ├── jobs.js                Homepage featured jobs, jobs page, job details
│   ├── auth.js                Login / register page behaviour
│   ├── dashboard.js           Candidate dashboard, application timeline, profile check tool
│   ├── employer.js            Employer dashboard: posting, hiring pipeline, employee assignment
│   ├── resources.js           Resource articles data + rendering
│   └── animations.js          Scroll reveal (auto-tagged + staggered), scroll progress,
│                              back-to-top, stat count-up, smooth anchors
│
├── assets/
│   ├── logo/   logo.png, logo-horizontal.png, logo-white.png, logo-mark.png, favicon.png
│   ├── icons/  sprite.svg (same icons are inlined in each page)
│   └── images/ og-image.png (social share image)
│
└── tools/                     Optional page generator (see section 7)
```

Script load order on every page: `jobs-data.js → services.js → main.js → animations.js → page scripts`.

---

## 3. Add a new job

Open `js/jobs-data.js`, copy an existing object in `MSB_JOBS` and edit it:

```js
{
  id: "project-manager-sydney",          // unique; becomes job-details.html?id=project-manager-sydney
  title: "Project Manager",
  category: "Construction",              // ICT | Hospitality | Accounting | Construction | Healthcare | Other
  company: "Employer name",
  location: "Sydney, NSW", state: "NSW", // state drives the Location filter
  employment: "Full Time",               // Full Time | Part Time | Contract
  experienceLevel: "5+",                 // entry | 1-2 | 3-5 | 5+   (drives the Experience filter)
  experience: "5+ Years Experience",     // text shown to users
  salary: "$XX,XXX – $XX,XXX",           // display text
  salaryMin: 120000,                     // number for sorting, or null if undisclosed
  qualification: "Bachelor degree in Construction Management",
  description: "…",
  responsibilities: ["…", "…"],
  requirements: ["…", "…"],
  skills: ["Scheduling", "Budgeting"],
  postedDate: "2026-09-24", deadline: "2026-10-24",   // YYYY-MM-DD
  sponsorshipInfo: null,                 // neutral vacancy note or null — never a guarantee
  featured: false                        // true = shown on the homepage
}
```

The jobs page, filters, counts, homepage and details page update automatically.

Career articles are edited the same way in `js/resources.js` (`MSB_RESOURCES`).

---

## 4. Change branding

- **Colours, radius, shadows, font:** CSS variables in `:root` at the top of `css/style.css`. `--blue` (#15639E) and `--sky` (#4BB6F4) are taken from the logo.
- **Font:** loaded from Google Fonts in each page `<head>` (Manrope). Change the link and `--font`.
- **Logo:** PNGs in `assets/logo/` — `logo-horizontal.png` (header), `logo-white.png` (footer, light text for the navy background), `logo.png` (full stacked logo), `logo-mark.png` (bridge arch only), `favicon.png` and `apple-touch-icon.png`. The markup is `logo()` in `tools/partials.py`.
- **Navigation, header, footer, social links:** `tools/partials.py`, then run `python3 tools/build.py`.
- **Headings are sentence case** for readability. For all-caps headings add `h1, h2 { text-transform: uppercase; }`.
- **Social links:** footer icons currently use `data-placeholder`. Replace `href="#"` with real URLs and remove the attribute.

---

## 5. Replace demo authentication and data with a backend

All data access goes through `js/services.js`. Every method already returns a Promise, so UI code won't change.

| Service | Replace with |
|---|---|
| `JobService.getJobs / getJobById` | `GET /api/jobs`, `GET /api/jobs/:id` |
| `JobService.saveJob / unsaveJob` | `POST/DELETE /api/me/saved-jobs/:id` |
| `ApplicationService.applyForJob` | `POST /api/applications` (multipart, CV to cloud storage) |
| `ApplicationService.getApplications / setStage` | `GET /api/me/applications`, employer-side status updates |
| `AuthService.register / login / logout / currentUser` | Your auth provider (own API, Auth0, Cognito, Firebase Auth…) |
| `ProfileService`, `NotificationService` | `/api/me/profile`, `/api/me/notifications` |
| `ContactService.send` | `POST /api/contact` → email service |
| `EmployerService.myJobs / postJob / updateJob / setJobStatus / deleteJob` | `/api/employer/jobs` |
| `EmployerService.applicants / setStage / setOutcome / saveNote` | `/api/employer/applicants` |
| `EmployerService.employees / assign` | `/api/employer/employees` |

Example:

```js
async getJobs() {
  const res = await fetch("/api/jobs");
  if (!res.ok) throw new Error("Could not load jobs");
  return res.json();
}
```

For production authentication use HTTPS, server-side password hashing (bcrypt/argon2) and secure HTTP-only session cookies. Delete the `demoChecksum` function and the `msb_demo_*` localStorage keys. Remove the "Demo only" notes on the login/register pages and the "Demo controls" in the application timeline (`dashboard.js`).

---

## 6. Deploy to myskillbridge.com.au

The domain is already set everywhere (`BASE_URL` in `tools/partials.py`): canonical links, social-share tags, `sitemap.xml`, `robots.txt` and the search-engine data on the homepage.

Files made for hosting:

- `_headers`: security headers plus caching (Netlify and Cloudflare Pages read it automatically).
- `404.html`: shown for any missing page.
- `sitemap.xml` / `robots.txt`: regenerated by `python3 tools/build.py`.
- CSS/JS links end in `?v=<hash>`, so visitors always get the newest files after you publish (no more Ctrl+F5).

**Publishing with GitHub Pages (your chosen host):**

1. Create a GitHub account and a new **public** repository, e.g. `myskillbridge-website`.
2. Upload the contents of this folder to the repository's root (GitHub Desktop, or *Add file → Upload files* on the website). `CNAME` and `.nojekyll` must be included; `CNAME` tells GitHub the site's domain.
3. In the repository: *Settings → Pages → Build and deployment → Source: Deploy from a branch*, branch `main`, folder `/ (root)`, *Save*.
4. Still in *Settings → Pages*, enter `myskillbridge.com.au` as the custom domain.
5. At your domain registrar's DNS settings add:
   - four **A** records for `@` (the bare domain): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - a **CNAME** record for `www` pointing to `<your-github-username>.github.io`
6. When GitHub shows the DNS check as successful (can take up to a day), tick **Enforce HTTPS**.
7. To publish changes later: edit, run `python3 tools/build.py`, upload/commit the changed files.

GitHub Pages ignores `_headers` (it is for Netlify or Cloudflare Pages). Everything else, including `404.html`, works as is.

After it's live:

1. Google Search Console → add `myskillbridge.com.au` (Domain property) → verify with the DNS record it gives → submit `https://myskillbridge.com.au/sitemap.xml`.
2. Replace all placeholders: contact details (`contact.html`), social links, employer names, salaries, job data.
3. Have Privacy, Terms and Disclaimer reviewed by a legal professional, and all visa/work-rights wording by a registered migration agent.
4. Connect the real backend (section 5) before collecting real personal data.

## 7. Page generator (optional)

The HTML files are complete and can be edited directly. To keep the header, footer and `<head>` identical across all 16 pages, they're produced by a small Python script:

```bash
python3 tools/build.py
```

- `tools/partials.py` — `<head>`/SEO tags, header, footer, icon set, logo, `BASE_URL`
- `tools/pages_a.py` — home, jobs, job details
- `tools/pages_b.py` — how it works, candidates, employers, resources, about, contact
- `tools/pages_c.py` — login, register, candidate dashboard, legal pages
- `tools/pages_d.py` — employer dashboard

If you edit HTML files by hand, don't run the build afterwards (it overwrites them), or copy your changes into the `tools/` files first.

---

## 8. Security and privacy notes

- localStorage authentication is **for demonstration only**. Anyone with access to the browser can read it.
- CV files are **never stored** in the browser. Only the file name is recorded in the demo.
- Only necessary fields are collected. No dates of birth, passport or visa details are requested.
- The job profile tool is a general comparison only. It does not assess employment, visa or immigration eligibility, and says so on screen.

## 9. Quality checks performed

- All 16 pages load with no JavaScript errors at 1440px and 375px.
- No horizontal scrolling at 375px.
- All internal links resolve.
- Tested flows: homepage search → filtered results; filter drawer, sorting, clear filters; save job; apply while logged out (prompt), register, apply with validation; dashboard stats, application timeline stage changes; profile check tool; contact validation; demo login; mobile navigation.

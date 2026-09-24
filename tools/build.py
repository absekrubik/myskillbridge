"""Regenerates every .html page from the shared partials.

Usage (from the project root):  python3 tools/build.py
Edit header/footer/<head> in partials.py and page content in pages_*.py.
Plain HTML files can also be edited by hand if you prefer not to use this.
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
os.chdir(HERE)
import pages_a as A, pages_b as B, pages_c as C, pages_d as D

OUT = os.path.dirname(HERE)
PAGES = {
    "index.html": A.home, "jobs.html": A.jobs, "job-details.html": A.job_details,
    "how-it-works.html": B.how_it_works, "candidates.html": B.candidates, "employers.html": B.employers,
    "resources.html": B.resources, "resource.html": B.resource, "about.html": B.about, "contact.html": B.contact,
    "login.html": C.login, "register.html": C.register, "candidate-dashboard.html": C.dashboard, "employer-dashboard.html": D.employer_dashboard,
    "privacy.html": C.privacy, "terms.html": C.terms, "disclaimer.html": C.disclaimer,
}
for name, fn in PAGES.items():
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(fn())
print(f"Built {len(PAGES)} pages into {OUT}")

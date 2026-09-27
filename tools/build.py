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
    "404.html": C.not_found,
}
for name, fn in PAGES.items():
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(fn())
# ---- sitemap.xml + robots.txt (public pages only) -------------------------
from datetime import date
from partials import BASE_URL, NOINDEX
SKIP = NOINDEX | {"404.html", "job-details.html", "resource.html", "login.html", "register.html"}
PRIORITY = {"index.html": "1.0", "jobs.html": "0.9", "employers.html": "0.8", "candidates.html": "0.8", "how-it-works.html": "0.7"}
today = date.today().isoformat()
urls = "".join(
    f"  <url><loc>{BASE_URL}/{'' if n == 'index.html' else n}</loc><lastmod>{today}</lastmod>"
    f"<priority>{PRIORITY.get(n, '0.5')}</priority></url>\n"
    for n in PAGES if n not in SKIP)
with open(os.path.join(OUT, "sitemap.xml"), "w", encoding="utf-8") as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "</urlset>\n")
with open(os.path.join(OUT, "robots.txt"), "w", encoding="utf-8") as f:
    f.write("User-agent: *\nAllow: /\nDisallow: /candidate-dashboard.html\nDisallow: /employer-dashboard.html\n"
            "Disallow: /tools/\n\nSitemap: " + BASE_URL + "/sitemap.xml\n")

print(f"Built {len(PAGES)} pages + sitemap.xml + robots.txt into {OUT}")

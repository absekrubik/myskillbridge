"""Shared partials for the static site build (header, footer, <head>, icons)."""

SITE = "My SkillBridge Recruitment Services"
BASE_URL = "https://www.example.com"  # TODO: replace with the real domain before launch

ICONS = {
    "i-search": '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    "i-pin": '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    "i-briefcase": '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    "i-clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "i-bookmark": '<path d="M6 3.5h12V21l-6-4.2L6 21z"/>',
    "i-menu": '<path d="M4 7h16M4 12h16M4 17h16"/>',
    "i-close": '<path d="M6 6l12 12M18 6L6 18"/>',
    "i-check": '<path d="M5 12.5l4.5 4.5L19 7"/>',
    "i-plus": '<path d="M12 5v14M5 12h14"/>',
    "i-chip": '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
    "i-cup": '<path d="M5 17a7 7 0 0 1 14 0M12 8V6M10 6h4M3 20h18M3 17h18"/>',
    "i-calc": '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h1M11.5 11h1M15 11h1M8 15h1M11.5 15h1M15 15h1M8 18h1M11.5 18h4.5"/>',
    "i-helmet": '<path d="M6 21V3M6 5h14M6 5l4 4M10 5v4M16 5v5M14.5 10h3v2.5h-3zM3 21h8"/>',
    "i-heart": '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/><path d="M8 12h2l1-2 2 4 1-2h2"/>',
    "i-doc": '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    "i-shield": '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    "i-eye": '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    "i-compass": '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    "i-users": '<circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3 6"/>',
    "i-building": '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/>',
    "i-mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    "i-phone": '<path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    "i-calendar": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    "i-user": '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    "i-bell": '<path d="M6 9a6 6 0 0 1 12 0c0 6 3 7.5 3 7.5H3S6 15 6 9zM10 20a2 2 0 0 0 4 0"/>',
    "i-settings": '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    "i-folder": '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    "i-grid": '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    "i-filter": '<path d="M4 5h16l-6 8v5l-4 2v-7z"/>',
    "i-facebook": '<path d="M14 21v-8h3l.5-3.5H14V7.5c0-1 .4-1.8 1.9-1.8H18V2.6A25 25 0 0 0 15.4 2.5C12.8 2.5 11 4 11 7v2.5H8V13h3v8"/>',
    "i-instagram": '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    "i-linkedin": '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10.5V17M8 7.2v.01M12 17v-6.5M12 13.5a2.5 2.5 0 0 1 5 0V17"/>',
    "i-book": '<path d="M4 19V5a2 2 0 0 1 2-2h13v14H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13v-4"/>',
    "i-globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
    "i-star": '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>',
    "i-upload": '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    "i-logout": '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10"/>',
    "i-dollar": '<circle cx="12" cy="12" r="9"/><path d="M15 9.2c-.5-.9-1.6-1.5-3-1.5-1.7 0-3 .8-3 2 0 2.8 6 1.5 6 4.5 0 1.2-1.3 2-3 2-1.4 0-2.6-.6-3-1.6M12 6v1.7M12 16.2V18"/>',
    "i-info": '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>',
    "i-alert": '<path d="M12 4l9 16H3z"/><path d="M12 10v4.5M12 17.5v.01"/>',
    "i-clipboard": '<rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2.5" width="6" height="3.5" rx="1"/><path d="M9 12h6M9 16h4"/>',
    "i-message": '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    "i-send": '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
    "i-bridge": '<path d="M2 18h20M5 18v-6.5M19 18v-6.5M2 12c3.5-5 16.5-5 20 0M9 18v-5.3M15 18v-5.3M12 18V9.3"/>',
    "i-lock": '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    "i-home": '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    "i-arrow-up": '<path d="M12 19V5M5 12l7-7 7 7"/>',
    "i-target": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
}

SPRITE = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">' + "".join(
    f'<symbol id="{k}" viewBox="0 0 24 24">{v}</symbol>' for k, v in ICONS.items()) + "</svg>"


def icon(name, cls="icon"):
    return f'<svg class="{cls}" aria-hidden="true" focusable="false"><use href="#{name}"></use></svg>'


def logo(href="index.html", variant="header"):
    """Brand logo (raster, from assets/logo). variant: "header" (horizontal) or "footer" (stacked, light text)."""
    if variant == "footer":
        img = ('<img class="logo__img logo__img--stacked" src="assets/logo/logo-white.png" width="460" height="274" '
               'alt="My SkillBridge Recruitment Services">')
    else:
        img = ('<img class="logo__img" src="assets/logo/logo-horizontal.png" width="706" height="85" '
               'alt="My SkillBridge Recruitment Services">')
    return f'<a class="logo logo--{variant}" href="{href}" aria-label="My SkillBridge home">{img}</a>'


NAV = [
    ("jobs", "jobs.html", "Jobs"),
    ("how", "how-it-works.html", "How It Works"),
    ("candidates", "candidates.html", "For Candidates"),
    ("employers", "employers.html", "For Employers"),
    ("resources", "resources.html", "Resources"),
    ("about", "about.html", "About Us"),
]


def header(active):
    cur = ' aria-current="page"'
    items = "".join(
        f'<li><a class="nav-link" href="{href}"{cur if key == active else ""}>{label}</a></li>'
        for key, href, label in NAV)
    return f'''<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container header-inner">
    {logo()}
    <button class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="primary-menu" aria-label="Open menu">
      {icon("i-menu", "icon icon-open")}{icon("i-close", "icon icon-close")}
    </button>
    <nav class="primary-nav" id="primary-menu" aria-label="Main">
      <ul class="nav-list">{items}</ul>
      <div class="nav-actions">
        <div class="nav-auth" data-auth-slot>
          <a class="nav-link" href="login.html"{' aria-current="page"' if active == "login" else ""}>Log in</a>
          <a class="nav-link" href="register.html"{' aria-current="page"' if active == "register" else ""}>Register</a>
        </div>
        <a class="btn btn--primary btn--sm" href="jobs.html">Find jobs</a>
      </div>
    </nav>
  </div>
</header>'''


def footer():
    return f'''<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        {logo(variant="footer")}
        <p>A recruitment service connecting skilled candidates with employment opportunities in Australia.</p>
        <div class="social">
          <a href="#" data-placeholder aria-label="My SkillBridge on Facebook (link to be added)">{icon("i-facebook")}</a>
          <a href="#" data-placeholder aria-label="My SkillBridge on Instagram (link to be added)">{icon("i-instagram")}</a>
          <a href="#" data-placeholder aria-label="My SkillBridge on LinkedIn (link to be added)">{icon("i-linkedin")}</a>
        </div>
      </div>
      <div class="footer-col">
        <h2>Explore</h2>
        <ul><li><a href="jobs.html">Jobs</a></li><li><a href="how-it-works.html">How it works</a></li><li><a href="resources.html">Resources</a></li></ul>
      </div>
      <div class="footer-col">
        <h2>For you</h2>
        <ul><li><a href="candidates.html">Candidates</a></li><li><a href="employers.html">Employers</a></li><li><a href="candidates.html#profile-check">Check your job profile</a></li></ul>
      </div>
      <div class="footer-col">
        <h2>Company</h2>
        <ul><li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li><li><a href="login.html">Log in</a></li></ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 My SkillBridge Recruitment Services. All rights reserved.</p>
      <ul><li><button type="button" class="motion-toggle" data-motion-toggle aria-pressed="true">Animations: <span data-motion-state>On</span></button></li><li><a href="privacy.html">Privacy Policy</a></li><li><a href="terms.html">Terms &amp; Conditions</a></li><li><a href="disclaimer.html">Disclaimer</a></li></ul>
    </div>
  </div>
</footer>'''


def head(filename, title, description):
    url = f"{BASE_URL}/{'' if filename == 'index.html' else filename}"
    return f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>try{{if(localStorage.getItem("msb_reduce_motion")==="1")document.documentElement.classList.add("reduce-motion")}}catch(e){{}}</script>
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#15639E">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{SITE}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE_URL}/assets/images/og-image.png">
<meta property="og:locale" content="en_AU">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/logo/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="assets/logo/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/animations.css">
<link rel="stylesheet" href="css/responsive.css">'''


CORE_JS = ["jobs-data.js", "services.js", "main.js", "animations.js"]


def page(filename, title, description, active, body, scripts=(), body_class="", show_footer=True):
    js = "\n".join(f'<script src="js/{s}" defer></script>' for s in list(CORE_JS) + list(scripts))
    return f'''<!DOCTYPE html>
<html lang="en-AU">
<head>
{head(filename, title, description)}
{js}
</head>
<body class="{body_class}">
{SPRITE}
<div class="scroll-progress" aria-hidden="true"><span></span></div>
{header(active)}
{body}
{footer() if show_footer else ""}
<button class="back-to-top" type="button" aria-label="Back to top">{icon("i-arrow-up", "icon")}</button>
</body>
</html>
'''

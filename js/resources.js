/* ==========================================================================
   resources.js — Career resource articles (placeholder guidance content)
   Edit or extend MSB_RESOURCES to change the Resources page and the
   individual article page (resource.html?id=...).
   Content is general guidance only and should be reviewed before launch.
   ========================================================================== */

(function () {
  "use strict";

  window.MSB_RESOURCES = [
    {
      id: "australian-cv-guide", category: "Applications", icon: "i-doc", readTime: "6 min read",
      title: "Australian CV Guide",
      summary: "How to structure a clear, two-to-three page CV that Australian employers can scan quickly.",
      sections: [
        ["Keep it focused", "Most Australian employers expect a CV of two to three pages. Lead with a short profile summary, then list your experience from most recent to oldest."],
        ["Show results, not duties", "For each role, include two to four achievements. Where you can, show the outcome: time saved, customers served, projects delivered."],
        ["Leave out personal details", "Photos, date of birth and marital status are not usually included. Your name, email, phone and city are enough."],
        ["Match the job criteria", "Read the listing carefully and make sure the skills and experience it asks for are easy to find in your CV."]
      ]
    },
    {
      id: "interview-preparation", category: "Interviews", icon: "i-message", readTime: "7 min read",
      title: "Interview Preparation",
      summary: "Prepare examples, research the employer and practise answering behavioural questions.",
      sections: [
        ["Research the role", "Re-read the job listing and note the three skills the employer seems to value most. Prepare an example for each."],
        ["Use the STAR method", "Answer behavioural questions by describing the Situation, Task, Action and Result. Keep each answer to around two minutes."],
        ["Prepare your questions", "Have two or three questions ready about the team, the first 90 days, or how success is measured."],
        ["Check the logistics", "Confirm the time zone, video link or address, and who you'll be meeting."]
      ]
    },
    {
      id: "understanding-job-descriptions", category: "Job search", icon: "i-clipboard", readTime: "5 min read",
      title: "Understanding Job Descriptions",
      summary: "Tell the difference between essential and desirable criteria, and decide whether to apply.",
      sections: [
        ["Essential vs desirable", "Essential criteria are must-haves. Desirable criteria are a bonus. If you meet most essentials, it is usually worth applying."],
        ["Read between the lines", "Repeated words in a listing usually point to what matters most day-to-day."],
        ["Check location and work type", "Confirm the location, hours and employment type suit your circumstances before you apply."]
      ]
    },
    {
      id: "career-planning", category: "Career growth", icon: "i-compass", readTime: "6 min read",
      title: "Career Planning",
      summary: "Map where you are now, where you want to be, and the steps in between.",
      sections: [
        ["Start with strengths", "List the skills you use most and enjoy using. These are the foundation of your next move."],
        ["Look at real listings", "Browse roles one step above your current level and note the skills and qualifications that appear often."],
        ["Close the gaps", "Choose one or two gaps to work on at a time, through training, projects or volunteering."]
      ]
    },
    {
      id: "working-in-australia", category: "Living & working", icon: "i-globe", readTime: "5 min read",
      title: "Working in Australia",
      summary: "General information about workplaces in Australia and where to find official guidance.",
      sections: [
        ["Workplace rights", "Pay and conditions in Australia are set by awards, agreements and the National Employment Standards. The Fair Work Ombudsman publishes official information."],
        ["Visas and work rights", "Work rights depend on each person's individual circumstances. Always use official Australian Government sources and, where needed, seek advice from a registered migration agent or lawyer. This guide is not migration advice."],
        ["Tax and superannuation", "You'll need a Tax File Number to work. Employers usually pay superannuation on top of wages."]
      ],
      links: [
        ["Department of Home Affairs", "https://immi.homeaffairs.gov.au/"],
        ["Fair Work Ombudsman", "https://www.fairwork.gov.au/"]
      ]
    },
    {
      id: "recruitment-guide", category: "Process", icon: "i-users", readTime: "4 min read",
      title: "Recruitment Guide",
      summary: "What happens after you apply, from document review to the employer's final decision.",
      sections: [
        ["After you apply", "Your application is checked for completeness, then shared with the employer for review."],
        ["Shortlisting and interviews", "If your profile matches the criteria, you may be invited to an interview. You'll see this in your dashboard."],
        ["The decision", "The employer makes the final hiring decision. Timeframes vary by role and employer."]
      ]
    }
  ];

  const UI = window.UI;

  function card(r) {
    return `<article class="resource-card">
      <div class="resource-card__icon">${UI.icon(r.icon)}</div>
      <p class="resource-card__cat">${UI.esc(r.category)}</p>
      <h3 class="resource-card__title"><a href="resource.html?id=${r.id}">${UI.esc(r.title)}</a></h3>
      <p class="resource-card__text">${UI.esc(r.summary)}</p>
      <span class="resource-card__more" aria-hidden="true">Read more</span>
    </article>`;
  }

  function initLists() {
    document.querySelectorAll("[data-resources]").forEach((grid) => {
      const limit = Number(grid.dataset.resources) || 99;
      grid.innerHTML = window.MSB_RESOURCES.slice(0, limit).map(card).join("");
    });
  }

  function initArticle() {
    const root = document.getElementById("resource-article");
    if (!root) return;
    const r = window.MSB_RESOURCES.find((x) => x.id === UI.qs("id"));
    if (!r) {
      root.innerHTML = `<div class="empty-state empty-state--page">${UI.icon("i-book", "icon empty-state__icon")}
        <h1>Resource not found</h1><p>Browse all career resources instead.</p>
        <a class="btn btn--primary" href="resources.html">View all resources</a></div>`;
      return;
    }
    document.title = `${r.title} | My SkillBridge Recruitment Services`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", r.summary);
    root.innerHTML = `
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span>
        <a href="resources.html">Resources</a><span aria-hidden="true">/</span><span aria-current="page">${UI.esc(r.title)}</span></nav>
      <p class="article__cat">${UI.icon(r.icon)}${UI.esc(r.category)} <span class="muted">${r.readTime}</span></p>
      <h1 class="article__title">${UI.esc(r.title)}</h1>
      <p class="article__lead">${UI.esc(r.summary)}</p>
      ${r.sections.map(([h, p]) => `<h2>${UI.esc(h)}</h2><p>${UI.esc(p)}</p>`).join("")}
      ${r.links ? `<h2>Official sources</h2><ul class="link-list">${r.links.map(([t, u]) =>
        `<li><a href="${u}" target="_blank" rel="noopener noreferrer">${UI.esc(t)}<span class="sr-only"> (opens in a new tab)</span></a></li>`).join("")}</ul>` : ""}
      <p class="disclaimer">${UI.icon("i-info", "icon icon--xs")}This article is general information only. Content is placeholder guidance to be reviewed and updated by My SkillBridge.</p>`;
    const more = document.getElementById("more-resources");
    if (more) more.innerHTML = window.MSB_RESOURCES.filter((x) => x.id !== r.id).slice(0, 3).map(card).join("");
  }

  document.addEventListener("DOMContentLoaded", () => { initLists(); initArticle(); });
})();

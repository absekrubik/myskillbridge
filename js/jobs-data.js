/* ==========================================================================
   jobs-data.js — SAMPLE / DEMO job data
   --------------------------------------------------------------------------
   Every listing below is demonstration content. Employer names, salaries,
   deadlines and sponsorship notes are PLACEHOLDERS and must be replaced with
   real, verified information before going live.

   To add a job: copy one object, give it a unique `id` (used in the URL:
   job-details.html?id=your-id) and edit the fields. Nothing else is needed —
   the Jobs page, filters, homepage and details page all read from this array.

   Field guide
     category          one of the INDUSTRIES keys below (drives filters/icons)
     state             NSW | VIC | QLD | WA | SA | TAS | ACT | NT
     employment        "Full Time" | "Part Time" | "Contract"
     experienceLevel   "entry" | "1-2" | "3-5" | "5+"
     salaryMin         number used for sorting only (null = not disclosed)
     sponsorshipInfo   neutral vacancy note, or null. Never write guarantees.
     featured          true = shown on the homepage
   ========================================================================== */

window.MSB_INDUSTRIES = {
  ICT:          { label: "Technology",   filterLabel: "ICT",          icon: "i-chip",   tags: ["Software", "ICT", "Cyber Security", "IT"] },
  Hospitality:  { label: "Hospitality",  filterLabel: "Hospitality",  icon: "i-cup",    tags: ["Restaurants", "Hotels", "Management"] },
  Accounting:   { label: "Accounting",   filterLabel: "Accounting",   icon: "i-calc",   tags: ["Accounting", "Finance", "Payroll"] },
  Construction: { label: "Construction", filterLabel: "Construction", icon: "i-helmet", tags: ["Trades", "Construction", "Engineering"] },
  Healthcare:   { label: "Healthcare",   filterLabel: "Healthcare",   icon: "i-heart",  tags: ["Healthcare", "Support", "Allied Health"] },
  Other:        { label: "Other",        filterLabel: "Other",        icon: "i-briefcase", tags: ["Logistics", "Retail", "Administration"] }
};

window.MSB_EXPERIENCE_LEVELS = {
  "entry": "Entry Level",
  "1-2": "1–2 Years",
  "3-5": "3–5 Years",
  "5+": "5+ Years"
};

const DEMO_EMPLOYER = "Employer name to be confirmed (demo)";
const DEMO_SALARY = "$XX,XXX – $XX,XXX (placeholder)";
const DEMO_SPONSOR = "Vacancy information on sponsorship to be confirmed by the employer. Listing does not indicate visa eligibility.";

window.MSB_JOBS = [
  {
    id: "ict-business-analyst",
    title: "ICT Business Analyst",
    category: "ICT",
    company: DEMO_EMPLOYER,
    location: "Melbourne, VIC", state: "VIC",
    employment: "Full Time",
    experienceLevel: "3-5", experience: "3+ Years Experience",
    salary: DEMO_SALARY, salaryMin: 95000,
    qualification: "Bachelor degree in IT, Business or a related field",
    description: "Work with business and technology teams to understand needs, document requirements and support the delivery of digital systems. You will be the link between stakeholders and the delivery team, making sure solutions solve the right problem.",
    responsibilities: [
      "Run workshops and interviews to gather business requirements",
      "Write clear user stories, process maps and functional specifications",
      "Work with developers and testers throughout delivery",
      "Analyse current processes and recommend improvements",
      "Keep stakeholders informed on scope, progress and change"
    ],
    requirements: [
      "3+ years of experience in a business analysis role",
      "Experience with Agile delivery methods",
      "Strong written and verbal communication",
      "Confidence presenting to both technical and non-technical audiences"
    ],
    skills: ["Business Analysis", "Communication", "Requirements Gathering", "Documentation", "Stakeholder Management"],
    postedDate: "2026-09-20", deadline: "2026-10-20",
    sponsorshipInfo: DEMO_SPONSOR,
    featured: true
  },
  {
    id: "restaurant-manager",
    title: "Restaurant Manager",
    category: "Hospitality",
    company: DEMO_EMPLOYER,
    location: "Sydney, NSW", state: "NSW",
    employment: "Full Time",
    experienceLevel: "3-5", experience: "3+ Years Experience",
    salary: DEMO_SALARY, salaryMin: 70000,
    qualification: "Diploma of Hospitality Management or equivalent experience",
    description: "Lead the daily running of a busy restaurant, from rosters and service standards to budgets and supplier relationships. You will build a team that delivers a consistent guest experience.",
    responsibilities: [
      "Manage front and back of house operations",
      "Recruit, train and roster team members",
      "Monitor budgets, stock and wage costs",
      "Maintain food safety and workplace health and safety standards",
      "Handle guest feedback and resolve issues"
    ],
    requirements: [
      "3+ years in restaurant supervision or management",
      "Current RSA (or willingness to obtain)",
      "Experience with rostering and POS systems"
    ],
    skills: ["Team Leadership", "Customer Service", "Rostering", "Budgeting", "Food Safety"],
    postedDate: "2026-09-18", deadline: "2026-10-15",
    sponsorshipInfo: DEMO_SPONSOR,
    featured: true
  },
  {
    id: "accountant-brisbane",
    title: "Accountant",
    category: "Accounting",
    company: DEMO_EMPLOYER,
    location: "Brisbane, QLD", state: "QLD",
    employment: "Full Time",
    experienceLevel: "1-2", experience: "2+ Years Experience",
    salary: DEMO_SALARY, salaryMin: 75000,
    qualification: "Bachelor of Accounting or Commerce",
    description: "Prepare financial reports, manage month-end processes and support clients with compliance obligations in a small, collaborative team.",
    responsibilities: [
      "Prepare monthly and annual financial statements",
      "Complete BAS and support tax return preparation",
      "Reconcile accounts and maintain the general ledger",
      "Respond to client queries about their accounts"
    ],
    requirements: [
      "2+ years of accounting experience",
      "Working knowledge of Australian tax and reporting requirements",
      "Experience with cloud accounting software"
    ],
    skills: ["Financial Reporting", "BAS", "Reconciliations", "Xero", "Attention to Detail"],
    postedDate: "2026-09-16", deadline: "2026-10-10",
    sponsorshipInfo: null,
    featured: true
  },
  {
    id: "ict-support-officer",
    title: "ICT Support Officer",
    category: "ICT",
    company: DEMO_EMPLOYER,
    location: "Perth, WA", state: "WA",
    employment: "Full Time",
    experienceLevel: "1-2", experience: "2+ Years Experience",
    salary: DEMO_SALARY, salaryMin: 68000,
    qualification: "Certificate IV or Diploma in IT",
    description: "Provide first and second level support to staff across the organisation, keeping devices, accounts and everyday systems running smoothly.",
    responsibilities: [
      "Resolve hardware, software and network support requests",
      "Set up devices and user accounts for new starters",
      "Document fixes in the knowledge base",
      "Escalate complex issues to specialist teams"
    ],
    requirements: [
      "2+ years in a service desk or support role",
      "Experience with Microsoft 365 and Active Directory",
      "Patient, clear communication with non-technical users"
    ],
    skills: ["Technical Support", "Microsoft 365", "Troubleshooting", "Customer Service", "Networking Basics"],
    postedDate: "2026-09-19", deadline: "2026-10-19",
    sponsorshipInfo: DEMO_SPONSOR,
    featured: true
  },
  {
    id: "software-developer-sydney",
    title: "Software Developer",
    category: "ICT",
    company: DEMO_EMPLOYER,
    location: "Sydney, NSW", state: "NSW",
    employment: "Full Time",
    experienceLevel: "3-5", experience: "3+ Years Experience",
    salary: DEMO_SALARY, salaryMin: 110000,
    qualification: "Bachelor degree in Computer Science or related field",
    description: "Build and maintain web applications as part of a product team, from planning features to shipping and supporting them in production.",
    responsibilities: [
      "Design, build and test application features",
      "Review code and share knowledge with the team",
      "Improve performance, reliability and security",
      "Work with product and design on requirements"
    ],
    requirements: [
      "3+ years of professional development experience",
      "Experience with JavaScript and at least one back-end language",
      "Familiarity with version control and automated testing"
    ],
    skills: ["JavaScript", "APIs", "Testing", "Git", "Problem Solving"],
    postedDate: "2026-09-21", deadline: "2026-10-25",
    sponsorshipInfo: null,
    featured: false
  },
  {
    id: "cyber-security-analyst",
    title: "Cyber Security Analyst",
    category: "ICT",
    company: DEMO_EMPLOYER,
    location: "Canberra, ACT", state: "ACT",
    employment: "Contract",
    experienceLevel: "5+", experience: "5+ Years Experience",
    salary: "Rate on application (placeholder)", salaryMin: null,
    qualification: "Degree in IT or Cyber Security; relevant certifications desirable",
    description: "Monitor, assess and respond to security events while helping teams strengthen their controls and processes.",
    responsibilities: [
      "Monitor security alerts and investigate incidents",
      "Conduct vulnerability assessments",
      "Contribute to security policies and awareness training",
      "Report on risks and remediation progress"
    ],
    requirements: [
      "5+ years in security operations or analysis",
      "Experience with SIEM tools",
      "Some roles may require security clearance (to be confirmed by employer)"
    ],
    skills: ["Incident Response", "SIEM", "Risk Assessment", "Network Security", "Reporting"],
    postedDate: "2026-09-12", deadline: "2026-10-05",
    sponsorshipInfo: null,
    featured: false
  },
  {
    id: "chef-melbourne",
    title: "Chef",
    category: "Hospitality",
    company: DEMO_EMPLOYER,
    location: "Melbourne, VIC", state: "VIC",
    employment: "Full Time",
    experienceLevel: "3-5", experience: "3+ Years Experience",
    salary: DEMO_SALARY, salaryMin: 65000,
    qualification: "Certificate IV in Commercial Cookery",
    description: "Prepare high-quality dishes in a fast-paced kitchen and help lead junior kitchen staff.",
    responsibilities: [
      "Prepare and cook menu items to standard",
      "Supervise and train junior kitchen staff",
      "Manage stock, ordering and food safety records",
      "Contribute to menu development"
    ],
    requirements: [
      "3+ years as a qualified chef",
      "Knowledge of food safety standards",
      "Ability to work evenings and weekends"
    ],
    skills: ["Commercial Cookery", "Food Safety", "Menu Planning", "Stock Control", "Teamwork"],
    postedDate: "2026-09-14", deadline: "2026-10-14",
    sponsorshipInfo: DEMO_SPONSOR,
    featured: false
  },
  {
    id: "payroll-officer-adelaide",
    title: "Payroll Officer",
    category: "Accounting",
    company: DEMO_EMPLOYER,
    location: "Adelaide, SA", state: "SA",
    employment: "Part Time",
    experienceLevel: "1-2", experience: "1+ Years Experience",
    salary: DEMO_SALARY, salaryMin: 55000,
    qualification: "Certificate IV in Accounting and Bookkeeping or equivalent",
    description: "Process accurate, on-time payroll for a mid-sized workforce and help staff with pay-related questions.",
    responsibilities: [
      "Process fortnightly payroll",
      "Maintain employee pay records",
      "Apply award and enterprise agreement conditions",
      "Prepare superannuation and payroll reports"
    ],
    requirements: [
      "1+ years of payroll experience",
      "Understanding of Australian awards and superannuation",
      "High accuracy and confidentiality"
    ],
    skills: ["Payroll", "Award Interpretation", "Superannuation", "Excel", "Confidentiality"],
    postedDate: "2026-09-10", deadline: "2026-10-08",
    sponsorshipInfo: null,
    featured: false
  },
  {
    id: "site-supervisor-brisbane",
    title: "Construction Site Supervisor",
    category: "Construction",
    company: DEMO_EMPLOYER,
    location: "Brisbane, QLD", state: "QLD",
    employment: "Full Time",
    experienceLevel: "5+", experience: "5+ Years Experience",
    salary: DEMO_SALARY, salaryMin: 105000,
    qualification: "Certificate IV in Building and Construction; White Card",
    description: "Coordinate trades, programs and safety on residential and light commercial sites from start to handover.",
    responsibilities: [
      "Coordinate subcontractors and daily site activity",
      "Enforce work health and safety requirements",
      "Track program, quality and defects",
      "Report progress to the project manager"
    ],
    requirements: [
      "5+ years of site supervision experience",
      "Current White Card and driver licence",
      "Strong knowledge of building codes and site safety"
    ],
    skills: ["Site Management", "WHS", "Scheduling", "Quality Control", "Subcontractor Coordination"],
    postedDate: "2026-09-17", deadline: "2026-10-17",
    sponsorshipInfo: DEMO_SPONSOR,
    featured: false
  },
  {
    id: "electrician-perth",
    title: "Electrician",
    category: "Construction",
    company: DEMO_EMPLOYER,
    location: "Perth, WA", state: "WA",
    employment: "Contract",
    experienceLevel: "3-5", experience: "3+ Years Experience",
    salary: "Rate on application (placeholder)", salaryMin: null,
    qualification: "Electrical trade qualification and relevant state licence",
    description: "Install, test and maintain electrical systems on commercial and industrial projects.",
    responsibilities: [
      "Install wiring, fittings and switchboards",
      "Test, fault-find and repair electrical systems",
      "Read and work from drawings",
      "Complete compliance documentation"
    ],
    requirements: [
      "Licensed electrician (state requirements apply)",
      "3+ years post-trade experience",
      "Commercial or industrial experience preferred"
    ],
    skills: ["Electrical Installation", "Fault Finding", "Compliance", "Reading Drawings", "WHS"],
    postedDate: "2026-09-08", deadline: "2026-10-01",
    sponsorshipInfo: null,
    featured: false
  },
  {
    id: "registered-nurse-hobart",
    title: "Registered Nurse",
    category: "Healthcare",
    company: DEMO_EMPLOYER,
    location: "Hobart, TAS", state: "TAS",
    employment: "Full Time",
    experienceLevel: "1-2", experience: "1+ Years Experience",
    salary: DEMO_SALARY, salaryMin: 80000,
    qualification: "Bachelor of Nursing; registration requirements apply",
    description: "Deliver safe, person-centred care in a ward environment as part of a multidisciplinary team.",
    responsibilities: [
      "Assess, plan and deliver patient care",
      "Administer medications and monitor patients",
      "Keep accurate clinical records",
      "Support patients and families with education"
    ],
    requirements: [
      "Eligible for registration with the relevant national board",
      "1+ years of clinical experience",
      "Strong communication and teamwork"
    ],
    skills: ["Patient Care", "Clinical Assessment", "Medication Administration", "Documentation", "Teamwork"],
    postedDate: "2026-09-15", deadline: "2026-10-30",
    sponsorshipInfo: DEMO_SPONSOR,
    featured: false
  },
  {
    id: "disability-support-worker-darwin",
    title: "Disability Support Worker",
    category: "Healthcare",
    company: DEMO_EMPLOYER,
    location: "Darwin, NT", state: "NT",
    employment: "Part Time",
    experienceLevel: "entry", experience: "Entry Level",
    salary: DEMO_SALARY, salaryMin: 50000,
    qualification: "Certificate III in Individual Support (or working towards)",
    description: "Support people with disability to live independently and take part in their community.",
    responsibilities: [
      "Assist with daily living activities",
      "Support community and social participation",
      "Follow individual support plans",
      "Record progress notes"
    ],
    requirements: [
      "Relevant worker screening checks (to be confirmed)",
      "Current first aid certificate",
      "Driver licence"
    ],
    skills: ["Personal Care", "Empathy", "Communication", "First Aid", "Record Keeping"],
    postedDate: "2026-09-22", deadline: "2026-10-22",
    sponsorshipInfo: null,
    featured: false
  },
  {
    id: "warehouse-coordinator-sydney",
    title: "Warehouse Coordinator",
    category: "Other",
    company: DEMO_EMPLOYER,
    location: "Sydney, NSW", state: "NSW",
    employment: "Full Time",
    experienceLevel: "1-2", experience: "2+ Years Experience",
    salary: DEMO_SALARY, salaryMin: 62000,
    qualification: "No formal qualification required; forklift licence desirable",
    description: "Coordinate receiving, storage and dispatch in a busy distribution centre.",
    responsibilities: [
      "Coordinate inbound and outbound shipments",
      "Maintain stock accuracy in the warehouse system",
      "Allocate daily tasks to the warehouse team",
      "Follow safety procedures"
    ],
    requirements: [
      "2+ years in warehousing or logistics",
      "Experience with warehouse management systems"
    ],
    skills: ["Logistics", "Inventory", "Team Coordination", "WHS", "WMS"],
    postedDate: "2026-09-11", deadline: "2026-10-11",
    sponsorshipInfo: null,
    featured: false
  },
  {
    id: "graduate-data-analyst-adelaide",
    title: "Graduate Data Analyst",
    category: "ICT",
    company: DEMO_EMPLOYER,
    location: "Adelaide, SA", state: "SA",
    employment: "Full Time",
    experienceLevel: "entry", experience: "Entry Level",
    salary: DEMO_SALARY, salaryMin: 65000,
    qualification: "Recent degree in Data, Statistics, IT or related field",
    description: "Start your data career by turning raw data into reports and insights that help teams make decisions.",
    responsibilities: [
      "Clean and prepare data for analysis",
      "Build dashboards and regular reports",
      "Answer ad-hoc data questions from teams",
      "Document data sources and definitions"
    ],
    requirements: [
      "Completed degree within the last two years",
      "Working knowledge of SQL and spreadsheets",
      "Curious and detail-oriented"
    ],
    skills: ["SQL", "Excel", "Data Visualisation", "Analytical Thinking", "Communication"],
    postedDate: "2026-09-23", deadline: "2026-10-31",
    sponsorshipInfo: null,
    featured: false
  }
];

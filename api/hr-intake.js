// api/hr-intake.js — Vercel serverless function (Node)
// Receives the HR Solutions intake form POST, records it, and emails a
// notification via Resend. Mirrors the protections in api/contact.js.
//
// Environment variables (Vercel dashboard → Settings → Environment Variables):
//   RESEND_API_KEY  (required)  Resend API key, starts with re_ — already set
//                                for api/contact.js; reused here.
//   CONTACT_TO      (optional)  Where submissions go. Defaults to the address below.
//
// Protections: POST + JSON only, same-site Origin check, honeypot, length caps,
// per-field required checks mirroring the front-end, header-injection stripping,
// and a best-effort per-IP rate limit (in-memory per serverless instance).

const FROM = "ThinkCareer <hello@thinkcareers.net>";
const TO = process.env.CONTACT_TO || "udomsanga@gmail.com";

const ALLOWED_ORIGINS = new Set([
  "https://www.thinkcareers.net",
  "https://thinkcareers.net",
]);
const PREVIEW_ORIGIN = /^https:\/\/thinkcareer-website[a-z0-9-]*\.vercel\.app$/;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  }
  return recent.length > MAX_HITS;
}

const TEXT_MAX = 2000;
const SHORT_MAX = 200;
const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/;

const clean = (v, max) =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max) : "";
const oneLine = (s) => s.replace(/[\r\n\t]+/g, " ");
const escHtml = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// English-only mirror of the intake form's question list (src: the HR intake
// mockup's buildQuestions()). Used to validate required fields, cap lengths,
// and render a readable summary — not to re-derive the UI.
const SECTIONS = [
  { title: "About you", fields: [
    { id: "full_name", label: "Full name", kind: "text", required: true },
    { id: "position", label: "Position", kind: "single", required: true, options: { owner: "Owner", cofounder: "Co-founder", manager: "Manager", other: "Other" } },
    { id: "phone", label: "Phone / Telegram", kind: "text", required: true },
    { id: "email", label: "Email", kind: "text", required: false },
    { id: "meeting_language", label: "Preferred meeting language", kind: "single", required: true, options: { khmer: "Khmer", english: "English", either: "Either" } },
  ]},
  { title: "Your business", fields: [
    { id: "company_name", label: "Company name / trading name", kind: "text", required: true },
    { id: "legal_form", label: "Legal form", kind: "single", required: true, options: { sole_proprietor: "Sole proprietor", co_ltd: "Co., Ltd", other: "Other", not_sure: "Not sure" } },
    { id: "industry", label: "Industry and main products or services", kind: "textarea", required: true },
    { id: "year_started", label: "Year started", kind: "single", required: false, options: { before_2010: "Before 2010", "2010_2015": "2010–2015", "2016_2020": "2016–2020", "2021_2023": "2021–2023", "2024_2026": "2024–2026", not_sure: "Not sure" } },
    { id: "locations", label: "Locations / branches", kind: "text", required: false },
    { id: "growth_12m", label: "Growth in the last 12 months", kind: "single", required: true, options: { shrinking: "Shrinking", flat: "Flat", growing: "Growing" } },
    { id: "plans_2y", label: "Plans for the next 2 years", kind: "textarea", required: false },
    { id: "decision_maker", label: "Who decides on hiring, pay and dismissal?", kind: "text", required: true },
  ]},
  { title: "Your team", fields: [
    { id: "staff_fulltime", label: "Full-time staff today", kind: "single", required: true, options: bigCount() },
    { id: "staff_parttime", label: "Part-time staff today", kind: "single", required: false, options: smallCount() },
    { id: "staff_daily", label: "Daily workers today", kind: "single", required: false, options: smallCount() },
    { id: "staff_12m", label: "Expected staff in 12 months", kind: "single", required: false, options: bigCount() },
    { id: "leavers_12m", label: "Staff who left in the last 12 months", kind: "single", required: false, options: smallCount() },
    { id: "hard_roles", label: "Roles that are hardest to fill", kind: "text", required: false },
    { id: "family_staff", label: "Any family members working in the business?", kind: "single", required: false, options: { yes: "Yes", no: "No" } },
    { id: "hr_owner", label: "Who handles HR today?", kind: "single", required: true, options: { owner: "Owner", admin_accountant: "Admin or accountant", hr_staff: "HR staff", outsourced: "Outsourced", nobody: "Nobody" } },
  ]},
  { title: "HR checklist", fields: [
    { id: "hr_molvt", label: "Registered with the Ministry of Labour (MoLVT)", kind: "single", required: true, options: checklist() },
    { id: "hr_nssf", label: "Staff registered with NSSF", kind: "single", required: true, options: checklist() },
    { id: "hr_contracts", label: "Written employment contracts for all staff", kind: "single", required: true, options: checklist() },
    { id: "hr_work_rules", label: "Internal Work Rules", kind: "single", required: true, options: checklist() },
    { id: "hr_payslips", label: "Payslips every pay period", kind: "single", required: true, options: checklist() },
    { id: "hr_seniority", label: "Seniority payment paid on schedule", kind: "single", required: true, options: checklist() },
    { id: "hr_time_leave", label: "Rules for working hours, overtime and leave, and records kept", kind: "single", required: true, options: checklist() },
    { id: "hr_jds", label: "Job descriptions for each role", kind: "single", required: true, options: checklist() },
    { id: "hr_pay_rules", label: "Clear pay rules for each role (salary, bonus, allowances)", kind: "single", required: true, options: checklist() },
    { id: "hr_performance", label: "Staff goals and performance reviews", kind: "single", required: true, options: checklist() },
    { id: "hr_onboarding", label: "Onboarding for new staff", kind: "single", required: true, options: checklist() },
    { id: "hr_discipline", label: "Warning and disciplinary process", kind: "single", required: true, options: checklist() },
  ]},
  { title: "Priorities and budget", fields: [
    { id: "trigger", label: "What made you look for HR help now?", kind: "textarea", required: true },
    { id: "top_problems", label: "Top 3 people problems today", kind: "multiselect", required: true, maxSelect: 3, options: {
        turnover: "High staff turnover", hiring: "Difficulty hiring the right people", morale: "Low staff motivation or morale",
        attendance: "Absenteeism or lateness", unclear_roles: "Unclear roles or job expectations", performance: "Performance issues not being addressed",
        pay_complaints: "Pay or benefits complaints", conflicts: "Conflicts between staff or with managers",
        compliance_gaps: "Compliance or paperwork gaps (contracts, NSSF, records)", training_gap: "Lack of training or skill gaps", other: "Other",
      } },
    { id: "top_problems_other", label: "Top 3 people problems — other (describe)", kind: "text", required: false },
    { id: "desired_change", label: "In 12 months, what would you like to be different?", kind: "textarea", required: false },
    { id: "disputes_2y", label: "Any labour disputes or staff complaints in the last 2 years?", kind: "single", required: false, options: { yes: "Yes", no: "No", prefer_in_person: "Prefer to discuss in person" } },
    { id: "support_type", label: "Preferred support", kind: "single", required: true, options: { one_off: "One-off project", monthly: "Monthly support", not_sure: "Not sure" } },
    { id: "budget", label: "Budget range", kind: "single", required: false, options: { under_300: "Under $300", "300_1000": "$300–1,000", over_1000: "Over $1,000", not_sure: "Not sure" } },
    { id: "timeline", label: "When do you need first results?", kind: "single", required: true, options: { within_1_month: "Within 1 month", "1_3_months": "1–3 months", later: "Later" } },
  ]},
  { title: "Documents and consent", fields: [
    { id: "doc_org_chart", label: "Can bring: Organization chart", kind: "bool", required: false },
    { id: "doc_contracts", label: "Can bring: Sample employment contracts (names removed)", kind: "bool", required: false },
    { id: "doc_work_rules", label: "Can bring: Internal Work Rules / staff handbook", kind: "bool", required: false },
    { id: "doc_nssf", label: "Can bring: NSSF registration document", kind: "bool", required: false },
    { id: "doc_payslip", label: "Can bring: Sample payslip (name removed)", kind: "bool", required: false },
    { id: "consent", label: "Consent to use this information to assess HR needs", kind: "consent", required: true },
  ]},
];

function bigCount() { return { "0": "0", "1_5": "1–5", "6_20": "6–20", "21_50": "21–50", "50_plus": "50+" }; }
function smallCount() { return { none: "None", "1_5": "1–5", "6_20": "6–20", "21_plus": "21+" }; }
function checklist() { return { yes: "Yes (written down)", informal: "Informal (done, not written)", no: "No", not_sure: "Not sure" }; }

const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin) && !PREVIEW_ORIGIN.test(origin)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (!String(req.headers["content-type"] || "").toLowerCase().includes("application/json")) {
    return res.status(415).json({ error: "Unsupported media type" });
  }

  const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  if (limited(ip)) {
    res.setHeader("Retry-After", "600");
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};

  // Honeypot: real visitors never fill this. Pretend success so bots learn nothing.
  if (body.website) return res.status(200).json({ ok: true });

  // Clean + collect every known field.
  const data = {};
  for (const f of ALL_FIELDS) {
    if (f.kind === "bool" || f.kind === "consent") {
      data[f.id] = body[f.id] === true;
    } else if (f.kind === "multiselect") {
      const arr = Array.isArray(body[f.id]) ? body[f.id] : [];
      data[f.id] = arr
        .filter((v) => typeof v === "string")
        .slice(0, 10)
        .map((v) => oneLine(clean(v, SHORT_MAX)));
    } else if (f.kind === "textarea") {
      data[f.id] = clean(body[f.id], TEXT_MAX);
    } else {
      data[f.id] = oneLine(clean(body[f.id], SHORT_MAX));
    }
  }

  // Required-field validation, mirroring the front-end's own rules.
  for (const f of ALL_FIELDS) {
    if (!f.required) continue;
    if (f.kind === "consent") {
      if (data[f.id] !== true) return res.status(400).json({ error: "Please confirm consent to continue.", field: f.id });
    } else if (f.kind === "multiselect") {
      if (!data[f.id] || data[f.id].length === 0) return res.status(400).json({ error: `Missing required field: ${f.label}`, field: f.id });
    } else if (!data[f.id]) {
      return res.status(400).json({ error: `Missing required field: ${f.label}`, field: f.id });
    }
  }

  if (data.email && !EMAIL_RE.test(data.email)) {
    return res.status(400).json({ error: "Invalid email address.", field: "email" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return res.status(500).json({ error: "Server configuration error." });
  }

  const submittedAt = new Date().toISOString();

  const rowsHtml = SECTIONS.map((section) => {
    const rows = section.fields
      .map((f) => {
        let display;
        if (f.kind === "bool" || f.kind === "consent") {
          display = data[f.id] ? "Yes" : "No";
        } else if (f.kind === "multiselect") {
          const labels = (data[f.id] || []).map((v) => (f.options && f.options[v]) || v);
          display = labels.length ? labels.join(", ") : "—";
        } else if (f.kind === "single" && f.options) {
          display = f.options[data[f.id]] || data[f.id] || "—";
        } else {
          display = data[f.id] || "—";
        }
        return `<tr><td style="padding:6px 10px;vertical-align:top;color:#4A5873;white-space:nowrap;">${escHtml(f.label)}</td><td style="padding:6px 10px;vertical-align:top;white-space:pre-wrap;">${escHtml(display)}</td></tr>`;
      })
      .join("");
    return `
      <h3 style="font-family:sans-serif;color:#1B2D57;margin:22px 0 6px;font-size:15px;">${escHtml(section.title)}</h3>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:sans-serif;font-size:13.5px;width:100%;max-width:640px;">${rows}</table>
    `;
  }).join("");

  const emailBody = {
    from: FROM,
    to: [TO],
    reply_to: data.email || undefined,
    subject: `New HR intake form — ${data.company_name || data.full_name || "Unnamed"}`.slice(0, 150),
    html: `
      <h2 style="font-family:sans-serif;color:#1B2D57;">New ThinkCareer HR Intake Submission</h2>
      <p style="font-family:sans-serif;font-size:12.5px;color:#888;">Submitted ${escHtml(submittedAt)}</p>
      ${rowsHtml}
      <p style="margin-top:24px;font-size:12px;color:#888;font-family:sans-serif;">
        Sent via the ThinkCareer HR Solutions intake form (/hr-intake).${data.email ? " Reply directly to this email to respond." : ""}
      </p>
    `,
  };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailBody),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Resend error:", err);
      return res.status(502).json({ error: "Failed to send email. Please try again." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}

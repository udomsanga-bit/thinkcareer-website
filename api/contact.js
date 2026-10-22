// api/contact.js — Vercel serverless function (Node)
// Receives the enquiry form POST and sends a notification via Resend.
//
// Environment variables (Vercel dashboard → Settings → Environment Variables):
//   RESEND_API_KEY  (required)  Resend API key, starts with re_
//   CONTACT_TO      (optional)  Where enquiries go. Defaults to the address below.
//
// Protections: POST + JSON only, same-site Origin check, honeypot, length caps,
// email validation, header-injection stripping, and a best-effort per-IP rate limit.
// The rate limit lives in memory per serverless instance, so it slows floods but
// does not stop a determined one. For a hard limit, add a Vercel Firewall rate-limit
// rule on POST /api/contact (Dashboard → Firewall).

const FROM = "ThinkCareer <hello@thinkcareers.net>";
const TO = process.env.CONTACT_TO || "udomsanga@gmail.com";

const ALLOWED_ORIGINS = new Set([
  "https://www.thinkcareers.net",
  "https://thinkcareers.net",
]);
const PREVIEW_ORIGIN = /^https:\/\/thinkcareer-website[a-z0-9-]*\.vercel\.app$/;

const LIMITS = { name: 100, email: 254, stage: 100, program: 100, message: 4000 };
const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/;

// Best-effort rate limit: 5 requests per IP per 10 minutes, per instance.
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

const clean = (v, max) =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max) : "";
const oneLine = (s) => s.replace(/[\r\n\t]+/g, " ");

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

  const name = oneLine(clean(body.name, LIMITS.name));
  const email = clean(body.email, LIMITS.email);
  const career_stage = oneLine(clean(body.career_stage, LIMITS.stage));
  const program = oneLine(clean(body.program, LIMITS.program));
  const message = clean(body.message, LIMITS.message);

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return res.status(500).json({ error: "Server configuration error." });
  }

  const emailBody = {
    from: FROM,
    to: [TO],
    reply_to: email,
    subject: `New enquiry from ${name}`.slice(0, 150),
    html: `
      <h2>New ThinkCareer Enquiry</h2>
      <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
        <tr><td><strong>Name</strong></td><td>${escHtml(name)}</td></tr>
        <tr><td><strong>Email</strong></td><td><a href="mailto:${escHtml(email)}">${escHtml(email)}</a></td></tr>
        <tr><td><strong>Career stage</strong></td><td>${escHtml(career_stage || "—")}</td></tr>
        <tr><td><strong>Program interest</strong></td><td>${escHtml(program || "—")}</td></tr>
        <tr><td><strong>Message</strong></td><td style="white-space:pre-wrap;max-width:480px;">${escHtml(message)}</td></tr>
      </table>
      <p style="margin-top:24px;font-size:12px;color:#888;">
        Sent via the ThinkCareer website contact form.<br>
        Reply directly to this email to respond to ${escHtml(name)}.
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

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

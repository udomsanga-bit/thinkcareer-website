// api/contact.js — Vercel serverless function
// Receives the enquiry form POST and sends a notification via Resend.
//
// Required environment variable (set in Vercel dashboard → Settings → Environment Variables):
//   RESEND_API_KEY  — your Resend API key (starts with re_...)
//
// Addresses (edit here if needed):
const FROM = "ThinkCareer <hello@thinkcareers.net>";
const TO   = "udom@thinkcareers.net";

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, career_stage, program, message } = req.body ?? {};

  // Basic server-side guard
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return res.status(500).json({ error: "Server configuration error." });
  }

  const emailBody = {
    from: FROM,
    to:   [TO],
    reply_to: email,
    subject: `New enquiry from ${name}`,
    html: `
      <h2>New ThinkCareer Enquiry</h2>
      <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
        <tr><td><strong>Name</strong></td><td>${escHtml(name)}</td></tr>
        <tr><td><strong>Email</strong></td><td><a href="mailto:${escHtml(email)}">${escHtml(email)}</a></td></tr>
        <tr><td><strong>Career stage</strong></td><td>${escHtml(career_stage ?? "—")}</td></tr>
        <tr><td><strong>Program interest</strong></td><td>${escHtml(program ?? "—")}</td></tr>
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
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type":  "application/json",
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
    .replace(/"/g, "&quot;");
}

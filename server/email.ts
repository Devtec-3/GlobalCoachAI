import nodemailer from "nodemailer";

// Using Environment Variables for Security (Very important for your defense!)
const SENDER_EMAIL =
  process.env.EMAIL_USER || "muhammadabdulwadudalata@gmail.com";
const APP_PASSWORD = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_EMAIL,
    pass: APP_PASSWORD,
  },
});

// Dynamic URL based on environment
const APP_URL =
  process.env.NODE_ENV === "production"
    ? "https://globalcoachai.onrender.com"
    : "http://localhost:5000";

export async function sendWelcomeEmail(to: string, name: string) {
  const mailOptions = {
    from: `"Global-Coach AI" <${SENDER_EMAIL}>`,
    to: to,
    subject: "Welcome to Global-Coach AI Logic Hub! 🚀",
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
        <h2 style="color: #2563eb;">Welcome, ${name}!</h2>
        <p>Your account is now active on the Global-Coach AI platform.</p>
        <p>Our <b>AI Career Agent</b> is ready to help you match with live jobs worldwide.</p>
        <div style="margin-top: 20px;">
          <a href="${APP_URL}" style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Go to Dashboard</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 12px; color: #888;">Global-Coach Logic Hub • 2025</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to: ${to}`);
  } catch (error) {
    console.error("❌ Email error:", error);
  }
}

export async function sendLoginNotification(to: string) {
  const mailOptions = {
    from: `"Global-Coach AI Security" <${SENDER_EMAIL}>`,
    to: to,
    subject: "New Login Detected",
    html: `
      <div style="font-family: sans-serif; padding: 20px; border-left: 4px solid #ef4444; background: #fef2f2;">
        <h3 style="color: #ef4444;">Security Alert</h3>
        <p>A new login was detected for your account at <b>${new Date().toLocaleString()}</b>.</p>
        <p>If this was not you, please secure your account immediately.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Login alert sent to: ${to}`);
  } catch (error) {
    console.error("❌ Login email error:", error);
  }
}

export async function sendJobMatchAlert(email: string, jobs: any[]) {
  const jobListHtml = jobs
    .map(
      (job) => `
    <div style="border-bottom: 1px solid #eee; padding: 15px 0;">
      <strong style="color: #2563eb; font-size: 16px;">${job.title}</strong><br/>
      <span style="color: #4b5563;">${job.company}</span> • <span>${job.location}</span><br/>
      <small style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px; font-weight: bold;">Match Score: ${job.matchPercentage}%</small>
    </div>
  `
    )
    .join("");

  const mailOptions = {
    from: `"Global-Coach AI" <${SENDER_EMAIL}>`,
    to: email,
    subject: "🚀 New AI Job Matches Found for Your Profile!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
        <h2 style="color: #1e40af;">Great news!</h2>
        <p>Our AI Agent has scanned the global market and found matches for your CV:</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
          ${jobListHtml}
        </div>
        <p style="margin-top: 25px;">
          <a href="${APP_URL}/jobs" style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Apply to these Jobs</a>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Job match alert sent to: ${email}`);
  } catch (error) {
    console.error("❌ Job match email error:", error);
  }
}

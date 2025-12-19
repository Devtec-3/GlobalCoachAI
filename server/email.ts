import nodemailer from "nodemailer";

// REPLACE THESE with your actual Gmail and App Password
const SENDER_EMAIL = "muhammadabdulwadudalata@gmail.com";
const APP_PASSWORD = "dtxh rehz naxc tarq";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_EMAIL,
    pass: APP_PASSWORD,
  },
});

export async function sendWelcomeEmail(to: string, name: string) {
  const mailOptions = {
    from: `"Global-Coach AI" <${SENDER_EMAIL}>`,
    to: to,
    subject: "Welcome to Global-Coach AI Logic Hub! 🚀",
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">Welcome, ${name}!</h2>
        <p>Your account is now active on the Global-Coach AI platform.</p>
        <p>Our <b>AI Career Agent</b> is ready to help you match with live jobs worldwide.</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
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
      <div style="font-family: sans-serif; padding: 20px;">
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
    <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
      <strong style="color: #2563eb;">${job.title}</strong> at <span>${job.company}</span><br/>
      <small>Match Score: ${job.matchPercentage}% | Location: ${job.location}</small>
    </div>
  `
    )
    .join("");

  const mailOptions = {
    // FIXED: Changed placeholder to SENDER_EMAIL variable
    from: `"GlobalCoach AI" <${SENDER_EMAIL}>`,
    to: email,
    subject: "🚀 New AI Job Matches Found for Your Profile!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2>Great news!</h2>
        <p>Our AI Agent has scanned the market and found matches for your CV:</p>
        ${jobListHtml}
        <p style="margin-top: 20px;">
          <a href="http://localhost:5000/jobs" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View All Matches</a>
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

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { optimizeAchievement } from "./gemini";
import { hashPassword, verifyPassword } from "./auth";
import { sendWelcomeEmail, sendLoginNotification } from "./email";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // 🛡️ INTERNAL HELPER: Robust AI JSON Sanitization
  const safeParseAI = (text: string) => {
    try {
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/^[^{[]+/, "")
        .replace(/[^}\]]+$/, "")
        .trim();
      return JSON.parse(cleaned || "[]");
    } catch (e) {
      console.error("AI Parsing Error. Raw output was:", text);
      return [];
    }
  };

  // ==========================================
  // 🔐 AUTHENTICATION (With Email Fail-Safe)
  // ==========================================
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, displayName } = req.body;
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser)
        return res.status(409).json({ message: "Email registered" });

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        displayName,
        isAdmin: false,
      });

      // 📧 Fail-safe email notification
      if (user && user.email) {
        sendWelcomeEmail(user.email, user.displayName || "User")
          .then(() => console.log(`✅ Welcome email sent to ${user.email}`))
          .catch((err) =>
            console.log("⚠️ Email service not configured. Skipping email.")
          );
      }

      res.json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      });
    } catch (error) {
      console.error("Signup Error:", error);
      res.status(500).json({ message: "Account creation failed" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user || !(await verifyPassword(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.regenerate((err) => {
        if (err) return res.status(500).json({ message: "Session error" });
        req.session.userId = user.id;
        if (user.email) sendLoginNotification(user.email).catch(console.error);
        res.json({
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        });
      });
    } catch (error) {
      res.status(500).json({ message: "Sign in failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId)
      return res.status(401).json({ message: "Not logged in" });
    const user = await storage.getUser(req.session.userId);
    res.json(user);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => res.json({ message: "Logged out" }));
  });

  // ==========================================
  // 🌍 AI GLOBAL SEARCH & REAL-TIME KNOWLEDGE INSIGHTS
  // ==========================================
  app.get("/api/jobs/search", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const query = (req.query.q as string) || "Remote Opportunities";
      const profile = await storage.getCvProfileWithDetails(userId);

      if (!profile)
        return res.status(400).json({ error: "Complete your profile first" });

      const userSkills =
        profile.skills?.map((s: any) => s.name.toLowerCase()) || [];
      const skillsCsv = userSkills.join(", ") || "General";

      const prompt = `Act as a Global AI Career Mentor. Find 5 real-world roles for: "${query}". 
      User's Current Skills: ${skillsCsv}.
      Return ONLY a JSON array: [{"title": "...", "company": "...", "matchPercentage": 95, "location": "...", "reason": "...", "missingSkills": [], "insight": "..."}]`;

      const aiResponse = await optimizeAchievement(prompt, "achievement");
      const jobs = safeParseAI(aiResponse);

      await Promise.all(
        jobs.map(async (job: any) => {
          if (job.matchPercentage > 70 && job.insight) {
            await storage.createNotification({
              userId,
              type: "skill_gap",
              title: `AI Insight: ${job.title}`,
              message: job.insight,
              read: false,
            });
          }
        })
      );

      res.json(jobs);
    } catch (error) {
      console.error("AI Search Error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // ==========================================
  // 📝 CV PROFILE & SUB-ENTITIES (ALIGNED WITH STORAGE.TS)
  // ==========================================
  app.get("/api/cv-profile/full", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.json(null);
    const profile = await storage.getCvProfileWithDetails(userId);
    res.json(profile || null);
  });

  app.post("/api/cv-profile", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    console.log("Saving CV Profile basic data...");
    const profile = await storage.getCvProfile(userId);
    const data = { ...req.body, userId };

    const result = profile
      ? await storage.updateCvProfile(profile.id, data)
      : await storage.createCvProfile(data);

    res.json(result);
  });

  app.post("/api/cv-profile/education", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const profile = await storage.getCvProfile(userId);
    if (!profile) return res.status(400).json({ error: "Profile required" });

    console.log("Updating Education details...");
    const entries = Array.isArray(req.body) ? req.body : [req.body];
    const result = await storage.replaceEducation(profile.id, entries);
    res.json(result);
  });

  app.post("/api/cv-profile/experience", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const profile = await storage.getCvProfile(userId);
    if (!profile) return res.status(400).json({ error: "Profile required" });

    console.log("Updating Work Experience...");
    const entries = Array.isArray(req.body) ? req.body : [req.body];
    const result = await storage.replaceWorkExperience(profile.id, entries);
    res.json(result);
  });

  app.post("/api/cv-profile/skills", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const profile = await storage.getCvProfile(userId);
    if (!profile) return res.status(400).json({ error: "Profile required" });

    console.log("Updating Skills...");
    const skillNames = Array.isArray(req.body)
      ? req.body.map((s: any) => s.name || s)
      : [req.body.name || req.body];
    const result = await storage.replaceSkills(profile.id, skillNames);
    res.json(result);
  });

  app.post("/api/cv-profile/projects", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const profile = await storage.getCvProfile(userId);
    if (!profile) return res.status(400).json({ error: "Profile required" });

    console.log("Updating Projects...");
    const entries = Array.isArray(req.body) ? req.body : [req.body];
    const result = await storage.replaceProjects(profile.id, entries);
    res.json(result);
  });

  // ==========================================
  // 📊 TRACKER & NOTIFICATIONS
  // ==========================================
  app.post("/api/applications", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const { jobId, title, company, location } = req.body;
      const result = await storage.createApplication({
        userId,
        jobId: jobId?.toString() || Math.random().toString(),
        title,
        company,
        location,
        status: "to_apply",
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to save application" });
    }
  });

  app.get("/api/applications", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const apps = await storage.getApplications(userId);
    res.json(apps);
  });

  app.get("/api/notifications", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const notifs = await storage.getNotifications(userId);
    res.json(notifs);
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    await storage.markNotificationRead(req.params.id);
    res.json({ success: true });
  });

  return httpServer;
}

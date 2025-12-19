import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  optimizeAchievement,
  generateCoverLetter,
  analyzeJobMatch,
} from "./gemini";
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
  // 🔐 AUTHENTICATION
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

      if (user.email) {
        sendWelcomeEmail(user.email, user.displayName || "User").catch(
          console.error
        );
      }

      res.json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      });
    } catch (error) {
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

      const query = req.query.q || "Remote Opportunities";
      const profile = await storage.getCvProfileWithDetails(userId);

      if (!profile)
        return res.status(400).json({ error: "Complete your profile first" });

      const userSkills =
        profile.skills?.map((s: any) => s.name.toLowerCase()) || [];
      const skillsCsv = userSkills.join(", ") || "General";

      // 🧠 ENHANCED PROMPT: Requests specific mentoring insights based on the user's CV
      const prompt = `Act as a Global AI Career Mentor. Find 5 real-world roles for: "${query}". 
      User's Current Skills: ${skillsCsv}.
      
      For each job, provide:
      1. title, company, matchPercentage, location, reason.
      2. missingSkills: A list of requirements the user doesn't have.
      3. insight: A single professional sentence explaining WHY mastering one of the missing skills is essential for this specific career path (e.g., "Mastering Kubernetes will bridge the gap between your DevOps interest and high-scale backend engineering").

      Return ONLY a JSON array: [{"title": "...", "company": "...", "matchPercentage": 95, "location": "...", "reason": "...", "missingSkills": [], "insight": "..."}]`;

      const aiResponse = await optimizeAchievement(prompt, "achievement");
      const jobs = safeParseAI(aiResponse);

      // --- 🤖 LIVE KNOWLEDGE ENGINE ---
      const missingSkillsMap = new Map<string, number>();

      // Process jobs and build skill frequency + individual notifications
      await Promise.all(
        jobs.map(async (job: any) => {
          // 1. Collect skills for frequency analysis
          job.missingSkills?.forEach((skill: string) => {
            const s = skill.toLowerCase();
            if (!userSkills.includes(s)) {
              missingSkillsMap.set(s, (missingSkillsMap.get(s) || 0) + 1);
            }
          });

          // 2. Create high-value individual Mentorship Notifications
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

      // 3. Create aggregate "Growth Opportunity" notifications for high-demand skills
      const skillGapEntries = Array.from(missingSkillsMap.entries());
      await Promise.all(
        skillGapEntries.map(async ([skill, count]) => {
          if (count >= 2) {
            await storage.createNotification({
              userId,
              type: "skill_gap",
              title: "Market Demand Alert",
              message: `70% of current results for "${query}" require ${skill.toUpperCase()}. We recommend updating your CV with this skill to improve global visibility.`,
              read: false,
            });
          }
        })
      );

      res.json(jobs);
    } catch (error) {
      console.error("AI Search/Gap Error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // ==========================================
  // 📊 TRACKER & DASHBOARD
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

      const application = Array.isArray(result) ? result[0] : result;
      res.json(application);
    } catch (error) {
      console.error("Tracker save error:", error);
      res.status(500).json({ error: "Failed to save application" });
    }
  });

  app.get("/api/applications", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const apps = await storage.getApplications(userId);
    res.json(apps);
  });

  // ==========================================
  // 🔔 NOTIFICATIONS
  // ==========================================
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

  // ==========================================
  // 📝 CV PROFILE
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
    const profile = await storage.getCvProfile(userId);
    const data = { ...req.body, userId };
    const result = profile
      ? await storage.updateCvProfile(profile.id, data)
      : await storage.createCvProfile(data);
    res.json(result);
  });

  return httpServer;
}

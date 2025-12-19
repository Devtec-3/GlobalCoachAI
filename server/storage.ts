import {
  users,
  cvProfiles,
  education,
  workExperience,
  skills,
  projects,
  jobOpportunities,
  jobMatches,
  applications,
  notifications,
  type User,
  type InsertUser,
  type CvProfile,
  type InsertCvProfile,
  type Education,
  type InsertEducation,
  type WorkExperience,
  type InsertWorkExperience,
  type Skill,
  type InsertSkill,
  type Project,
  type InsertProject,
  type JobOpportunity,
  type InsertJobOpportunity,
  type JobMatch,
  type InsertJobMatch,
  type Application,
  type InsertApplication,
  type Notification,
  type InsertNotification,
  type CvProfileWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;

  // CV Profiles
  getCvProfile(userId: string): Promise<CvProfile | undefined>;
  getCvProfileWithDetails(
    userId: string
  ): Promise<CvProfileWithDetails | undefined>;
  createCvProfile(profile: InsertCvProfile): Promise<CvProfile>;
  updateCvProfile(
    id: string,
    data: Partial<InsertCvProfile>
  ): Promise<CvProfile | undefined>;

  // Education
  getEducation(cvProfileId: string): Promise<Education[]>;
  replaceEducation(
    cvProfileId: string,
    entries: InsertEducation[]
  ): Promise<Education[]>;

  // Work Experience
  getWorkExperience(cvProfileId: string): Promise<WorkExperience[]>;
  replaceWorkExperience(
    cvProfileId: string,
    entries: InsertWorkExperience[]
  ): Promise<WorkExperience[]>;

  // Skills
  getSkills(cvProfileId: string): Promise<Skill[]>;
  replaceSkills(cvProfileId: string, skillNames: string[]): Promise<Skill[]>;

  // Projects
  getProjects(cvProfileId: string): Promise<Project[]>;
  replaceProjects(
    cvProfileId: string,
    entries: InsertProject[]
  ): Promise<Project[]>;

  // Job Opportunities
  getJobOpportunities(): Promise<JobOpportunity[]>;
  getJobOpportunity(id: string): Promise<JobOpportunity | undefined>;
  createJobOpportunity(job: InsertJobOpportunity): Promise<JobOpportunity>;

  // Job Matches
  getJobMatches(
    userId: string
  ): Promise<(JobMatch & { job?: JobOpportunity })[]>;
  createJobMatch(match: InsertJobMatch): Promise<JobMatch>;
  deleteJobMatches(userId: string): Promise<void>;

  // Applications
  getApplications(userId: string): Promise<Application[]>;
  createApplication(app: InsertApplication): Promise<Application>;
  updateApplication(
    id: string,
    data: Partial<InsertApplication>
  ): Promise<Application | undefined>;
  deleteApplication(id: string): Promise<void>;

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notif: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(
    id: string,
    data: Partial<InsertUser>
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // CV Profiles
  async getCvProfile(userId: string): Promise<CvProfile | undefined> {
    const [profile] = await db
      .select()
      .from(cvProfiles)
      .where(eq(cvProfiles.userId, userId));
    return profile || undefined;
  }

  async getCvProfileWithDetails(
    userId: string
  ): Promise<CvProfileWithDetails | undefined> {
    const profile = await this.getCvProfile(userId);
    if (!profile) return undefined;

    const [eduList, expList, skillList, projectList] = await Promise.all([
      this.getEducation(profile.id),
      this.getWorkExperience(profile.id),
      this.getSkills(profile.id),
      this.getProjects(profile.id),
    ]);

    // 🛡️ CRITICAL FIX: Ensure the results are always arrays [] so frontend .length logic doesn't fail
    return {
      ...profile,
      education: eduList || [],
      workExperience: expList || [],
      skills: skillList || [],
      projects: projectList || [],
    };
  }

  async createCvProfile(profile: InsertCvProfile): Promise<CvProfile> {
    const [created] = await db.insert(cvProfiles).values(profile).returning();
    return created;
  }

  async updateCvProfile(
    id: string,
    data: Partial<InsertCvProfile>
  ): Promise<CvProfile | undefined> {
    const [profile] = await db
      .update(cvProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cvProfiles.id, id))
      .returning();
    return profile || undefined;
  }

  // Multi-entry replacement methods
  async getEducation(cvProfileId: string): Promise<Education[]> {
    const results = await db
      .select()
      .from(education)
      .where(eq(education.cvProfileId, cvProfileId));
    return results || [];
  }

  async replaceEducation(
    cvProfileId: string,
    entries: InsertEducation[]
  ): Promise<Education[]> {
    const validEntries = entries.filter(
      (e) => (e as any).institution && (e as any).institution.trim() !== ""
    );

    await db.delete(education).where(eq(education.cvProfileId, cvProfileId));
    if (validEntries.length === 0) return [];

    return await db
      .insert(education)
      .values(validEntries.map((e) => ({ ...e, cvProfileId })))
      .returning();
  }

  async getWorkExperience(cvProfileId: string): Promise<WorkExperience[]> {
    const results = await db
      .select()
      .from(workExperience)
      .where(eq(workExperience.cvProfileId, cvProfileId));
    return results || [];
  }

  async replaceWorkExperience(
    cvProfileId: string,
    entries: InsertWorkExperience[]
  ): Promise<WorkExperience[]> {
    const validEntries = entries.filter(
      (e) => (e as any).company || (e as any).position || (e as any).jobTitle
    );

    await db
      .delete(workExperience)
      .where(eq(workExperience.cvProfileId, cvProfileId));
    if (validEntries.length === 0) return [];

    return await db
      .insert(workExperience)
      .values(validEntries.map((e) => ({ ...e, cvProfileId })))
      .returning();
  }

  async getSkills(cvProfileId: string): Promise<Skill[]> {
    const results = await db
      .select()
      .from(skills)
      .where(eq(skills.cvProfileId, cvProfileId));
    return results || [];
  }

  async replaceSkills(
    cvProfileId: string,
    skillNames: string[]
  ): Promise<Skill[]> {
    const validNames = skillNames.filter((name) => name && name.trim() !== "");

    await db.delete(skills).where(eq(skills.cvProfileId, cvProfileId));
    if (validNames.length === 0) return [];

    return await db
      .insert(skills)
      .values(validNames.map((name) => ({ cvProfileId, name })))
      .returning();
  }

  async getProjects(cvProfileId: string): Promise<Project[]> {
    const results = await db
      .select()
      .from(projects)
      .where(eq(projects.cvProfileId, cvProfileId));
    return results || [];
  }

  async replaceProjects(
    cvProfileId: string,
    entries: InsertProject[]
  ): Promise<Project[]> {
    const validEntries = entries.filter(
      (e) => (e as any).name && (e as any).name.trim() !== ""
    );

    await db.delete(projects).where(eq(projects.cvProfileId, cvProfileId));
    if (validEntries.length === 0) return [];

    return await db
      .insert(projects)
      .values(validEntries.map((e) => ({ ...e, cvProfileId })))
      .returning();
  }

  // Job Logic
  async getJobOpportunities(): Promise<JobOpportunity[]> {
    return db
      .select()
      .from(jobOpportunities)
      .orderBy(desc(jobOpportunities.postedDate));
  }

  async getJobOpportunity(id: string): Promise<JobOpportunity | undefined> {
    const [job] = await db
      .select()
      .from(jobOpportunities)
      .where(eq(jobOpportunities.id, id));
    return job || undefined;
  }

  async createJobOpportunity(
    job: InsertJobOpportunity
  ): Promise<JobOpportunity> {
    const [created] = await db.insert(jobOpportunities).values(job).returning();
    return created;
  }

  async getJobMatches(
    userId: string
  ): Promise<(JobMatch & { job?: JobOpportunity })[]> {
    const matches = await db
      .select()
      .from(jobMatches)
      .where(eq(jobMatches.userId, userId))
      .orderBy(desc(jobMatches.matchPercentage));
    const result = [];
    for (const match of matches) {
      const job = await this.getJobOpportunity(match.jobId);
      result.push({ ...match, job });
    }
    return result;
  }

  async createJobMatch(match: InsertJobMatch): Promise<JobMatch> {
    const [created] = await db.insert(jobMatches).values(match).returning();
    return created;
  }

  async deleteJobMatches(userId: string): Promise<void> {
    await db.delete(jobMatches).where(eq(jobMatches.userId, userId));
  }

  // Applications
  async getApplications(userId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.createdAt));
  }

  async createApplication(app: InsertApplication): Promise<Application> {
    const [created] = await db.insert(applications).values(app).returning();
    return created;
  }

  async updateApplication(
    id: string,
    data: Partial<InsertApplication>
  ): Promise<Application | undefined> {
    const [updated] = await db
      .update(applications)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteApplication(id: string): Promise<void> {
    await db.delete(applications).where(eq(applications.id, id));
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notif: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notif).returning();
    return created;
  }

  async markNotificationRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }
}

export const storage = new DatabaseStorage();

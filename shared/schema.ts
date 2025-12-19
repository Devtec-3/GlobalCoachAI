import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- TABLES ---

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cvProfiles = pgTable("cv_profiles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  location: text("location"),
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
  summary: text("summary"),
  completionPercentage: integer("completion_percentage").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const education = pgTable("education", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  cvProfileId: varchar("cv_profile_id")
    .notNull()
    .references(() => cvProfiles.id, { onDelete: "cascade" }),
  institution: text("institution").notNull(),
  degree: text("degree").notNull(),
  fieldOfStudy: text("field_of_study"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  current: boolean("current").default(false),
  description: text("description"),
  gpa: text("gpa"),
});

export const workExperience = pgTable("work_experience", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  cvProfileId: varchar("cv_profile_id")
    .notNull()
    .references(() => cvProfiles.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  position: text("position").notNull(),
  location: text("location"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  current: boolean("current").default(false),
  description: text("description"),
  achievements: text("achievements").array(),
});

export const skills = pgTable("skills", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  cvProfileId: varchar("cv_profile_id")
    .notNull()
    .references(() => cvProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category"),
  proficiency: integer("proficiency").default(3),
});

export const projects = pgTable("projects", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  cvProfileId: varchar("cv_profile_id")
    .notNull()
    .references(() => cvProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  url: text("url"),
  technologies: text("technologies").array(),
  startDate: text("start_date"),
  endDate: text("end_date"),
});

export const jobOpportunities = pgTable("job_opportunities", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  type: text("type"),
  description: text("description"),
  requirements: text("requirements").array(),
  salary: text("salary"),
  postedDate: timestamp("posted_date").defaultNow(),
  applicationUrl: text("application_url"),
  logoUrl: text("logo_url"),
  isRemote: boolean("is_remote").default(false),
});

export const jobMatches = pgTable("job_matches", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  jobId: varchar("job_id")
    .notNull()
    .references(() => jobOpportunities.id, { onDelete: "cascade" }),
  matchPercentage: integer("match_percentage").notNull(),
  matchedSkills: text("matched_skills").array(),
  missingSkills: text("missing_skills").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  jobId: text("job_id").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  status: text("status").notNull().default("to_apply"),
  notes: text("notes"),
  coverLetter: text("cover_letter"),
  appliedDate: timestamp("applied_date"),
  interviewDate: timestamp("interview_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- RELATIONS ---

export const usersRelations = relations(users, ({ many }) => ({
  cvProfile: many(cvProfiles),
  jobMatches: many(jobMatches),
  applications: many(applications),
  notifications: many(notifications),
}));

export const cvProfilesRelations = relations(cvProfiles, ({ one, many }) => ({
  user: one(users, { fields: [cvProfiles.userId], references: [users.id] }),
  education: many(education),
  workExperience: many(workExperience),
  skills: many(skills),
  projects: many(projects),
}));

export const educationRelations = relations(education, ({ one }) => ({
  cvProfile: one(cvProfiles, {
    fields: [education.cvProfileId],
    references: [cvProfiles.id],
  }),
}));

export const workExperienceRelations = relations(workExperience, ({ one }) => ({
  cvProfile: one(cvProfiles, {
    fields: [workExperience.cvProfileId],
    references: [cvProfiles.id],
  }),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  cvProfile: one(cvProfiles, {
    fields: [skills.cvProfileId],
    references: [cvProfiles.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  cvProfile: one(cvProfiles, {
    fields: [projects.cvProfileId],
    references: [cvProfiles.id],
  }),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, { fields: [applications.userId], references: [users.id] }),
}));

// --- TYPES & SCHEMAS ---

// Select Types
export type User = typeof users.$inferSelect;
export type CvProfile = typeof cvProfiles.$inferSelect;
export type Education = typeof education.$inferSelect;
export type WorkExperience = typeof workExperience.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type JobOpportunity = typeof jobOpportunities.$inferSelect;
export type JobMatch = typeof jobMatches.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

// Insert Types
export type InsertUser = typeof users.$inferInsert;
export type InsertCvProfile = typeof cvProfiles.$inferInsert;
export type InsertEducation = typeof education.$inferInsert;
export type InsertWorkExperience = typeof workExperience.$inferInsert;
export type InsertSkill = typeof skills.$inferInsert;
export type InsertProject = typeof projects.$inferInsert;
export type InsertJobOpportunity = typeof jobOpportunities.$inferInsert;
export type InsertJobMatch = typeof jobMatches.$inferInsert;
export type InsertApplication = typeof applications.$inferInsert;
export type InsertNotification = typeof notifications.$inferInsert;

// Combined Types for Dashboard & Matches
export type CvProfileWithDetails = CvProfile & {
  education: Education[];
  workExperience: WorkExperience[];
  skills: Skill[];
  projects: Project[];
};

export type JobOpportunityWithMatch = JobOpportunity & {
  matchPercentage?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  reason?: string;
};

// Zod Schemas
export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

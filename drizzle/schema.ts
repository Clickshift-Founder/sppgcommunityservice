import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const communityServiceSubmissions = mysqlTable("communityServiceSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  studentName: varchar("studentName", { length: 255 }).notNull(),
  capstoneProject: varchar("capstoneProject", { length: 255 }).notNull(),
  serviceDate: varchar("serviceDate", { length: 10 }).notNull(),
  attendance: varchar("attendance", { length: 64 }).notNull(),
  participation: text("participation").notNull(),
  contributions: text("contributions").notNull(),
  completedAssignedTask: mysqlEnum("completedAssignedTask", ["yes", "no"]).notNull(),
  mentorRating: varchar("mentorRating", { length: 255 }).notNull(),
  improvementFeedback: text("improvementFeedback").notNull(),
  conflictResolution: varchar("conflictResolution", { length: 255 }).notNull(),
  assignedTasks: text("assignedTasks").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CommunityServiceSubmission = typeof communityServiceSubmissions.$inferSelect;

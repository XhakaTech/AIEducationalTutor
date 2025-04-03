
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

// Lessons
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  level: text("level"),
  language: text("language"),
  icon: text("icon").default("book"),
  is_active: boolean("is_active").default(true),
});

export const insertLessonSchema = createInsertSchema(lessons).pick({
  title: true,
  description: true,
  level: true,
  language: true,
  icon: true,
  is_active: true,
});

// Topics
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  lesson_id: integer("lesson_id").notNull(),
  title: text("title").notNull(),
  order: integer("order"),
});

export const insertTopicSchema = createInsertSchema(topics).pick({
  lesson_id: true,
  title: true,
  order: true,
});

// Subtopics
export const subtopics = pgTable("subtopics", {
  id: serial("id").primaryKey(),
  topic_id: integer("topic_id").notNull(),
  title: text("title").notNull(),
  objective: text("objective"),
  key_concepts: jsonb("key_concepts").default('[]').$type<string[]>(),
  order: integer("order"),
});

export const insertSubtopicSchema = createInsertSchema(subtopics).pick({
  topic_id: true,
  title: true,
  objective: true,
  key_concepts: true,
  order: true,
});

// Resources
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  subtopic_id: integer("subtopic_id").notNull(),
  type: text("type"), // 'text', 'image', 'video', 'audio'
  url: text("url"),
  title: text("title"),
  description: text("description"),
  purpose: text("purpose"),
  content_tags: jsonb("content_tags").default('[]').$type<string[]>(),
  recommended_when: text("recommended_when"),
  is_optional: boolean("is_optional").default(true),
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  subtopic_id: true,
  type: true,
  url: true,
  title: true,
  description: true,
  purpose: true,
  content_tags: true,
  recommended_when: true,
  is_optional: true,
});

// Quiz Questions
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  subtopic_id: integer("subtopic_id").notNull(),
  question: text("question"),
  options: jsonb("options").$type<string[]>(),
  answer: integer("answer"), // Index of correct option
  explanation: text("explanation"),
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).pick({
  subtopic_id: true,
  question: true,
  options: true,
  answer: true,
  explanation: true,
});

// Final Test Questions
export const finalTestQuestions = pgTable("final_test_questions", {
  id: serial("id").primaryKey(),
  lesson_id: integer("lesson_id").notNull(),
  question: text("question"),
  options: jsonb("options").$type<string[]>(),
  answer: integer("answer"), // Index of correct option
  explanation: text("explanation"),
});

export const insertFinalTestQuestionSchema = createInsertSchema(finalTestQuestions).pick({
  lesson_id: true,
  question: true,
  options: true,
  answer: true,
  explanation: true,
});

// User Progress
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  subtopic_id: integer("subtopic_id").notNull(),
  completed: boolean("completed").default(false),
  db_quiz_score: integer("db_quiz_score"),
  ai_quiz_score: integer("ai_quiz_score"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).pick({
  user_id: true,
  subtopic_id: true,
  completed: true,
  db_quiz_score: true,
  ai_quiz_score: true,
});

// User Final Test Results
export const userFinalTestResults = pgTable("user_final_test_results", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  lesson_id: integer("lesson_id").notNull(),
  score: integer("score").notNull(),
  feedback: text("feedback"),
  completed_at: timestamp("completed_at").defaultNow(),
});

export const insertUserFinalTestResultSchema = createInsertSchema(userFinalTestResults).pick({
  user_id: true,
  lesson_id: true,
  score: true,
  feedback: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;

export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;

export type Subtopic = typeof subtopics.$inferSelect;
export type InsertSubtopic = z.infer<typeof insertSubtopicSchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;

export type FinalTestQuestion = typeof finalTestQuestions.$inferSelect;
export type InsertFinalTestQuestion = z.infer<typeof insertFinalTestQuestionSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type UserFinalTestResult = typeof userFinalTestResults.$inferSelect;
export type InsertUserFinalTestResult = z.infer<typeof insertUserFinalTestResultSchema>;

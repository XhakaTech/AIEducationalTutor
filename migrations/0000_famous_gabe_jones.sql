CREATE TABLE "final_test_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"question" text,
	"options" jsonb,
	"answer" integer,
	"explanation" text
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"level" text,
	"language" text,
	"icon" text DEFAULT 'book',
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"subtopic_id" integer NOT NULL,
	"question" text,
	"options" jsonb,
	"answer" integer,
	"explanation" text
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"subtopic_id" integer NOT NULL,
	"type" text,
	"url" text,
	"title" text,
	"description" text,
	"purpose" text,
	"content_tags" jsonb DEFAULT '[]',
	"recommended_when" text,
	"is_optional" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "subtopics" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic_id" integer NOT NULL,
	"title" text NOT NULL,
	"objective" text,
	"key_concepts" jsonb DEFAULT '[]',
	"order" integer
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"title" text NOT NULL,
	"order" integer
);
--> statement-breakpoint
CREATE TABLE "user_final_test_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"lesson_id" integer NOT NULL,
	"score" integer NOT NULL,
	"feedback" text,
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"subtopic_id" integer NOT NULL,
	"completed" boolean DEFAULT false,
	"db_quiz_score" integer,
	"ai_quiz_score" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);

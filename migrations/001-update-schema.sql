
-- DROP existing tables in reverse dependency order (for development/testing)
DROP TABLE IF EXISTS user_final_test_results;
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS final_test_questions;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS quiz_questions;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS subtopics;
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS users;

-- Create users table (keeping existing structure)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  level TEXT,
  language TEXT,
  icon TEXT DEFAULT 'book',
  is_active BOOLEAN DEFAULT TRUE
);

-- Create topics table
CREATE TABLE topics (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id),
  title TEXT NOT NULL,
  "order" INTEGER
);

-- Create subtopics table
CREATE TABLE subtopics (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER NOT NULL REFERENCES topics(id),
  title TEXT NOT NULL,
  objective TEXT,
  key_concepts JSONB DEFAULT '[]',
  "order" INTEGER
);

-- Create resources table with semantic metadata for AI usage
CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  subtopic_id INTEGER NOT NULL REFERENCES subtopics(id),
  type TEXT,  -- e.g., 'text', 'image', 'video', 'audio'
  url TEXT,
  title TEXT,
  description TEXT,
  purpose TEXT,
  content_tags JSONB DEFAULT '[]',
  recommended_when TEXT,
  is_optional BOOLEAN DEFAULT TRUE
);

-- Create quiz_questions table (directly linked to subtopics)
CREATE TABLE quiz_questions (
  id SERIAL PRIMARY KEY,
  subtopic_id INTEGER NOT NULL REFERENCES subtopics(id),
  question TEXT,
  options JSONB,
  answer INTEGER,
  explanation TEXT
);

-- Create final_test_questions table
CREATE TABLE final_test_questions (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id),
  question TEXT,
  options JSONB,
  answer INTEGER,
  explanation TEXT
);

-- Create user_progress table
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  subtopic_id INTEGER NOT NULL REFERENCES subtopics(id),
  completed BOOLEAN DEFAULT FALSE,
  db_quiz_score INTEGER,
  ai_quiz_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_final_test_results table
CREATE TABLE user_final_test_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  lesson_id INTEGER NOT NULL REFERENCES lessons(id),
  score INTEGER NOT NULL,
  feedback TEXT,
  completed_at TIMESTAMP DEFAULT NOW()
);

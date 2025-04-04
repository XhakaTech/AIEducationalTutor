-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS final_test_questions;
DROP TABLE IF EXISTS final_tests;
DROP TABLE IF EXISTS quiz_questions;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS subtopics;
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS lessons;

-- Create lessons table
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    language TEXT NOT NULL,
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    estimated_duration INTEGER NOT NULL CHECK (estimated_duration > 0),
    prerequisites UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create topics table
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    estimated_duration INTEGER NOT NULL CHECK (estimated_duration > 0),
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lesson_id, "order")
);

-- Create subtopics table
CREATE TABLE subtopics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    objective TEXT NOT NULL,
    content TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    estimated_duration INTEGER NOT NULL CHECK (estimated_duration > 0),
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(topic_id, "order")
);

-- Create resources table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subtopic_id UUID NOT NULL REFERENCES subtopics(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('video', 'article', 'infographic', 'exercise')),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    purpose TEXT,
    content_tags TEXT[] DEFAULT '{}',
    recommended_when TEXT,
    is_optional BOOLEAN DEFAULT true,
    duration INTEGER CHECK (duration > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create quizzes table
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INTEGER NOT NULL CHECK (passing_score BETWEEN 0 AND 100),
    time_limit INTEGER CHECK (time_limit > 0),
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create quiz_questions table
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL CHECK (jsonb_array_length(options) >= 2),
    correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0),
    explanation TEXT NOT NULL,
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
    points INTEGER NOT NULL CHECK (points > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create final_tests table
CREATE TABLE final_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INTEGER NOT NULL CHECK (passing_score BETWEEN 0 AND 100),
    time_limit INTEGER CHECK (time_limit > 0),
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create final_test_questions table
CREATE TABLE final_test_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    final_test_id UUID NOT NULL REFERENCES final_tests(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL CHECK (jsonb_array_length(options) >= 2),
    correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0),
    explanation TEXT NOT NULL,
    points INTEGER NOT NULL CHECK (points > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_topics_lesson_id ON topics(lesson_id);
CREATE INDEX idx_subtopics_topic_id ON subtopics(topic_id);
CREATE INDEX idx_resources_subtopic_id ON resources(subtopic_id);
CREATE INDEX idx_quizzes_topic_id ON quizzes(topic_id);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_final_tests_lesson_id ON final_tests(lesson_id);
CREATE INDEX idx_final_test_questions_final_test_id ON final_test_questions(final_test_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at
    BEFORE UPDATE ON topics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subtopics_updated_at
    BEFORE UPDATE ON subtopics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
    BEFORE UPDATE ON quizzes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at
    BEFORE UPDATE ON quiz_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_final_tests_updated_at
    BEFORE UPDATE ON final_tests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_final_test_questions_updated_at
    BEFORE UPDATE ON final_test_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert lessons
INSERT INTO lessons (id, title, description, level, language, estimated_duration)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Introduction to Cryptocurrency and Blockchain', 'Curso introductorio que cubre los fundamentos de las criptomonedas y la tecnología blockchain.', 'beginner', 'en', 120),
  ('00000000-0000-0000-0000-000000000002', 'Navigating the Crypto Ecosystem', 'Curso teórico sobre wallets, transacciones y exchanges en el mundo cripto.', 'beginner', 'en', 100),
  ('00000000-0000-0000-0000-000000000003', 'Blockchain Technology Fundamentals', 'Curso intermedio que explora la estructura de blockchain, mecanismos de consenso y tipos de activos cripto.', 'intermediate', 'en', 150),
  ('00000000-0000-0000-0000-000000000004', 'Regulatory, Security, and Risk Management in Crypto', 'Curso intermedio sobre marcos regulatorios, prácticas de seguridad y gestión de riesgos en mercados cripto.', 'intermediate', 'en', 120),
  ('00000000-0000-0000-0000-000000000005', 'DeFi, Smart Contracts, and DApps', 'Curso intermedio que abarca la finanza descentralizada, smart contracts y aplicaciones descentralizadas.', 'intermediate', 'en', 130),
  ('00000000-0000-0000-0000-000000000006', 'Crypto Trading and Investment Strategies', 'Curso intermedio sobre estrategias teóricas de trading y análisis de inversiones en cripto.', 'intermediate', 'en', 110);

-- Insert topics for each lesson
-- Lesson 1
INSERT INTO topics (id, lesson_id, title, description, "order", estimated_duration)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'What Is Cryptocurrency?', 'Understanding the basics of cryptocurrency', 1, 40),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Introduction to Blockchain Technology', 'Learning about blockchain fundamentals', 2, 40),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'History and Evolution of Cryptocurrency', 'Exploring the history of crypto', 3, 40);

-- Lesson 2
INSERT INTO topics (id, lesson_id, title, description, "order", estimated_duration)
VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Cryptocurrency Wallets', 'Understanding different types of wallets', 1, 35),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Cryptocurrency Transactions', 'Learning about crypto transactions', 2, 35),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Cryptocurrency Exchanges', 'Understanding crypto exchanges', 3, 30);

-- Lesson 3
INSERT INTO topics (id, lesson_id, title, description, "order", estimated_duration)
VALUES
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Blockchain Structure and Nodes', 'Understanding blockchain architecture', 1, 50),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Consensus Mechanisms', 'Learning about different consensus methods', 2, 50),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Types of Crypto Assets', 'Understanding different crypto assets', 3, 50);

-- Lesson 4
INSERT INTO topics (id, lesson_id, title, description, "order", estimated_duration)
VALUES
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'Global Crypto Regulation and Legal Frameworks', 'Understanding crypto regulations', 1, 40),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'Security Best Practices for Crypto Users', 'Learning about crypto security', 2, 40),
  ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'Risk Management & Market Volatility', 'Understanding risk management', 3, 40);

-- Lesson 5
INSERT INTO topics (id, lesson_id, title, description, "order", estimated_duration)
VALUES
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'Introduction to Decentralized Finance (DeFi)', 'Understanding DeFi basics', 1, 65),
  ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'Smart Contracts and DApps', 'Learning about smart contracts and DApps', 2, 65);

-- Lesson 6
INSERT INTO topics (id, lesson_id, title, description, "order", estimated_duration)
VALUES
  ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'Crypto Trading Strategies', 'Understanding trading strategies', 1, 55),
  ('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'Investment Analysis and Risk', 'Learning about investment analysis', 2, 55);

-- Insert subtopics for each topic
-- Topic 1.1
INSERT INTO subtopics (id, topic_id, title, objective, content, "order", estimated_duration, difficulty_level)
VALUES
  ('11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Definition & Characteristics', 'Understanding cryptocurrency basics', 'Detailed explanation of digital assets, decentralization, and cryptographic security', 1, 20, 1),
  ('11000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Crypto vs. Traditional Money', 'Comparing cryptocurrencies with fiat', 'Discussion about decentralization, digital nature, and limited supply', 2, 20, 1);

-- Topic 1.2
INSERT INTO subtopics (id, topic_id, title, objective, content, "order", estimated_duration, difficulty_level)
VALUES
  ('12000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'What is a Blockchain?', 'Understanding blockchain structure', 'Explanation of blocks, chains, and decentralized ledgers', 1, 20, 1),
  ('12000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Blockchain Verification & Security', 'Understanding consensus and transaction verification', 'Covering decentralization, proof-of-work, and network security', 2, 20, 1);

-- Continue with the rest of the subtopics...
-- (I'll continue with the rest of the data in the next message due to length limitations) 
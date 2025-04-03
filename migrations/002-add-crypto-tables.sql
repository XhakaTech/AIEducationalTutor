
-- Add tables for the Crypto Learner Course

-- First create a migration function to run only if these tables don't exist
DO $$
BEGIN
    -- Check if the 'quizzes' table doesn't exist yet
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'quizzes') THEN
        -- Create quizzes table (per topic)
        CREATE TABLE quizzes (
            id SERIAL PRIMARY KEY,
            topic_id INTEGER NOT NULL REFERENCES topics(id),
            title TEXT,
            "order" INTEGER
        );

        -- Create user_final_test_results table if it doesn't exist
        IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_final_test_results') THEN
            -- For backward compatibility, we'll add a new table instead of altering existing one
            CREATE TABLE final_tests (
                id SERIAL PRIMARY KEY,
                lesson_id INTEGER NOT NULL REFERENCES lessons(id),
                title TEXT
            );
        END IF;
    END IF;
END
$$;

-- Insert one lesson (Crypto Learner Course) if it doesn't exist
INSERT INTO lessons (title, description, level, language, icon, is_active)
SELECT 'Crypto Learner Course', 
       'A comprehensive course covering fundamentals to advanced topics in cryptocurrency.',
       'Beginner to Advanced',
       'English',
       '₿', 
       true
WHERE NOT EXISTS (
    SELECT 1 FROM lessons WHERE title = 'Crypto Learner Course'
);

-- Get the lesson id for the Crypto Learner Course
DO $$
DECLARE
    crypto_lesson_id INTEGER;
BEGIN
    SELECT id INTO crypto_lesson_id FROM lessons WHERE title = 'Crypto Learner Course' LIMIT 1;
    
    -- Insert topics if they don't exist
    IF NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Fundamentals of Cryptocurrencies' AND lesson_id = crypto_lesson_id) THEN
        INSERT INTO topics (lesson_id, title, "order")
        VALUES 
        (crypto_lesson_id, 'Fundamentals of Cryptocurrencies', 1),
        (crypto_lesson_id, 'Blockchain Technology and Mining', 2),
        (crypto_lesson_id, 'Trading, Investment, and Security', 3),
        (crypto_lesson_id, 'Advanced Applications and Future Trends', 4);
    END IF;
    
    -- For each topic, we can add subtopics, but we'll do this in the seedDatabase function
    -- to avoid making this migration file too complex
END
$$;

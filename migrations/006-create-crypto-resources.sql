-- Insert resources for each subtopic
-- Subtopic 1: What is Cryptocurrency?
INSERT INTO resources (subtopic_id, type, title, url, description, purpose, content_tags, recommended_when, is_optional, duration)
VALUES
    (1, 'video', 'Introduction to Cryptocurrency', 'https://example.com/crypto-intro', 'Basic introduction to cryptocurrency concepts', 'overview', '{"beginner", "fundamentals"}', 'before_lesson', false, 15),
    (1, 'article', 'Cryptocurrency Basics', 'https://example.com/crypto-basics', 'Detailed explanation of cryptocurrency fundamentals', 'reference', '{"beginner", "fundamentals"}', 'during_lesson', false, 20),
    (1, 'interactive', 'Crypto Quiz', 'https://example.com/crypto-quiz', 'Test your understanding of cryptocurrency basics', 'practice', '{"beginner", "quiz"}', 'after_lesson', true, 10);

-- Subtopic 2: History of Cryptocurrency
INSERT INTO resources (subtopic_id, type, title, url, description, purpose, content_tags, recommended_when, is_optional, duration)
VALUES
    (2, 'video', 'History of Digital Currency', 'https://example.com/crypto-history', 'Timeline of cryptocurrency development', 'overview', '{"beginner", "history"}', 'before_lesson', false, 20),
    (2, 'article', 'Key Events in Crypto History', 'https://example.com/crypto-events', 'Important milestones in cryptocurrency history', 'reference', '{"beginner", "history"}', 'during_lesson', false, 25),
    (2, 'interactive', 'Timeline Activity', 'https://example.com/crypto-timeline', 'Interactive timeline of cryptocurrency events', 'practice', '{"beginner", "interactive"}', 'after_lesson', true, 15);

-- Subtopic 3: How Cryptocurrency Works
INSERT INTO resources (subtopic_id, type, title, url, description, purpose, content_tags, recommended_when, is_optional, duration)
VALUES
    (3, 'video', 'Cryptocurrency Technology', 'https://example.com/crypto-tech', 'Technical explanation of cryptocurrency operations', 'overview', '{"intermediate", "technology"}', 'before_lesson', false, 25),
    (3, 'article', 'Crypto Technical Details', 'https://example.com/crypto-details', 'In-depth technical information about cryptocurrency', 'reference', '{"intermediate", "technology"}', 'during_lesson', false, 30),
    (3, 'interactive', 'Technical Demo', 'https://example.com/crypto-demo', 'Interactive demonstration of cryptocurrency technology', 'practice', '{"intermediate", "interactive"}', 'after_lesson', true, 20);

-- Subtopic 4: Types of Cryptocurrencies
INSERT INTO resources (subtopic_id, type, title, url, description, purpose, content_tags, recommended_when, is_optional, duration)
VALUES
    (4, 'video', 'Major Cryptocurrencies', 'https://example.com/crypto-types', 'Overview of different cryptocurrency types', 'overview', '{"beginner", "types"}', 'before_lesson', false, 20),
    (4, 'article', 'Cryptocurrency Categories', 'https://example.com/crypto-categories', 'Detailed classification of cryptocurrencies', 'reference', '{"beginner", "types"}', 'during_lesson', false, 25),
    (4, 'interactive', 'Crypto Comparison', 'https://example.com/crypto-compare', 'Compare different cryptocurrencies', 'practice', '{"beginner", "interactive"}', 'after_lesson', true, 15);

-- Continue with resources for other subtopics... 
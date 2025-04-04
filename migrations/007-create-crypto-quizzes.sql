-- Insert quizzes for each topic
-- Topic 1: Introduction to Cryptocurrency
INSERT INTO quizzes (topic_id, title, description, passing_score, time_limit, is_required)
VALUES
    (1, 'Cryptocurrency Basics Quiz', 'Test your understanding of cryptocurrency fundamentals', 70, 30, true);

-- Insert quiz questions
INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, explanation, difficulty_level, points)
VALUES
    (1, 'What is cryptocurrency?', 
     '["A digital currency", "A physical coin", "A type of bank account", "A stock market"]',
     'A digital currency',
     'Cryptocurrency is a digital or virtual currency that uses cryptography for security.',
     'beginner',
     10),
    (1, 'Which was the first cryptocurrency?',
     '["Bitcoin", "Ethereum", "Litecoin", "Ripple"]',
     'Bitcoin',
     'Bitcoin was created in 2009 by an anonymous person or group known as Satoshi Nakamoto.',
     'beginner',
     10);

-- Topic 2: Blockchain Technology
INSERT INTO quizzes (topic_id, title, description, passing_score, time_limit, is_required)
VALUES
    (2, 'Blockchain Fundamentals Quiz', 'Test your understanding of blockchain technology', 70, 30, true);

-- Insert quiz questions
INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, explanation, difficulty_level, points)
VALUES
    (2, 'What is a blockchain?',
     '["A type of cryptocurrency", "A distributed ledger", "A mining rig", "A trading platform"]',
     'A distributed ledger',
     'A blockchain is a distributed ledger that records transactions across many computers.',
     'beginner',
     10),
    (2, 'What is a block in blockchain?',
     '["A physical object", "A collection of transactions", "A type of cryptocurrency", "A mining reward"]',
     'A collection of transactions',
     'A block is a collection of transactions that are verified and added to the blockchain.',
     'intermediate',
     15);

-- Insert final test for the lesson
INSERT INTO final_tests (lesson_id, title, description, passing_score, time_limit, is_required)
VALUES
    (1, 'Cryptocurrency Fundamentals Final Test', 'Comprehensive test covering all topics', 75, 60, true);

-- Insert final test questions
INSERT INTO final_test_questions (final_test_id, question, options, correct_answer, explanation, points)
VALUES
    (1, 'What is the main advantage of cryptocurrency?',
     '["Decentralization", "Physical form", "Government backing", "Fixed value"]',
     'Decentralization',
     'The main advantage of cryptocurrency is its decentralized nature, meaning no single entity controls it.',
     20),
    (1, 'What is the purpose of mining in cryptocurrency?',
     '["Creating new coins", "Validating transactions", "Both A and B", "Neither A nor B"]',
     'Both A and B',
     'Mining serves two purposes: creating new coins and validating transactions on the network.',
     20); 
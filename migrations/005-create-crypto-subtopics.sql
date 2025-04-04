-- Insert subtopics for each topic
-- Topic 1: Introduction to Cryptocurrency
INSERT INTO subtopics (topic_id, title, objective, content, "order", estimated_duration, difficulty_level)
VALUES
    (1, 'What is Cryptocurrency?', 'Understand the basic concept of cryptocurrency', 'Cryptocurrency is a digital or virtual currency that uses cryptography for security...', 1, 30, 'beginner'),
    (1, 'History of Cryptocurrency', 'Learn about the origins and evolution of cryptocurrency', 'The concept of digital currency dates back to the 1980s...', 2, 30, 'beginner'),
    (1, 'How Cryptocurrency Works', 'Understand the technical foundations of cryptocurrency', 'Cryptocurrencies operate on a technology called blockchain...', 3, 45, 'intermediate'),
    (1, 'Types of Cryptocurrencies', 'Learn about different types of cryptocurrencies', 'There are thousands of cryptocurrencies in existence...', 4, 30, 'beginner');

-- Topic 2: Blockchain Technology
INSERT INTO subtopics (topic_id, title, objective, content, "order", estimated_duration, difficulty_level)
VALUES
    (2, 'What is Blockchain?', 'Understand the basic concept of blockchain', 'A blockchain is a distributed ledger technology...', 1, 30, 'beginner'),
    (2, 'How Blockchain Works', 'Learn about blockchain operations', 'Blockchain works through a combination of cryptography...', 2, 45, 'intermediate'),
    (2, 'Types of Blockchains', 'Understand different blockchain types', 'There are three main types of blockchains...', 3, 30, 'beginner'),
    (2, 'Blockchain Security', 'Learn about blockchain security features', 'Blockchain security is maintained through several mechanisms...', 4, 45, 'intermediate');

-- Topic 3: Cryptocurrency Mining
INSERT INTO subtopics (topic_id, title, objective, content, "order", estimated_duration, difficulty_level)
VALUES
    (3, 'What is Mining?', 'Understand cryptocurrency mining', 'Mining is the process of validating transactions...', 1, 30, 'beginner'),
    (3, 'Mining Hardware', 'Learn about mining equipment', 'Different types of hardware are used for mining...', 2, 30, 'beginner'),
    (3, 'Mining Pools', 'Understand mining pool operations', 'Mining pools are groups of miners who combine their resources...', 3, 30, 'intermediate'),
    (3, 'Mining Profitability', 'Learn about mining economics', 'Mining profitability depends on several factors...', 4, 45, 'advanced');

-- Topic 4: Cryptocurrency Trading
INSERT INTO subtopics (topic_id, title, objective, content, "order", estimated_duration, difficulty_level)
VALUES
    (4, 'Trading Basics', 'Learn cryptocurrency trading fundamentals', 'Cryptocurrency trading involves buying and selling digital assets...', 1, 30, 'beginner'),
    (4, 'Trading Strategies', 'Understand different trading approaches', 'There are various trading strategies used in cryptocurrency markets...', 2, 45, 'intermediate'),
    (4, 'Risk Management', 'Learn about trading risk management', 'Effective risk management is crucial in cryptocurrency trading...', 3, 45, 'intermediate'),
    (4, 'Technical Analysis', 'Understand technical analysis in trading', 'Technical analysis involves studying price charts and indicators...', 4, 60, 'advanced');

-- Topic 5: Cryptocurrency Security
INSERT INTO subtopics (topic_id, title, objective, content, "order", estimated_duration, difficulty_level)
VALUES
    (5, 'Wallet Security', 'Learn about cryptocurrency wallet security', 'Cryptocurrency wallets store your private keys...', 1, 30, 'beginner'),
    (5, 'Private Keys', 'Understand private key management', 'Private keys are the most important aspect of cryptocurrency security...', 2, 30, 'intermediate'),
    (5, 'Common Security Threats', 'Learn about cryptocurrency security threats', 'There are several common security threats in the crypto space...', 3, 45, 'intermediate'),
    (5, 'Best Security Practices', 'Understand security best practices', 'Following security best practices is essential for protecting your assets...', 4, 45, 'advanced');

-- Topic 6: Cryptocurrency Regulation
INSERT INTO subtopics (topic_id, title, objective, content, "order", estimated_duration, difficulty_level)
VALUES
    (6, 'Global Regulations', 'Understand cryptocurrency regulations worldwide', 'Cryptocurrency regulations vary significantly across countries...', 1, 45, 'intermediate'),
    (6, 'Taxation', 'Learn about cryptocurrency taxation', 'Cryptocurrency taxation rules differ by jurisdiction...', 2, 45, 'intermediate'),
    (6, 'Compliance', 'Understand regulatory compliance', 'Cryptocurrency businesses must comply with various regulations...', 3, 45, 'advanced'),
    (6, 'Future of Regulation', 'Learn about regulatory trends', 'Cryptocurrency regulation is evolving rapidly...', 4, 45, 'advanced'); 
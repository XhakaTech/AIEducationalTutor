import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seedCourses() {
  console.log('Seeding courses...\n');
  
  // Create all lessons
  const lessons = await db.insert(schema.lessons).values([
    {
      title: "Introduction to Cryptocurrency and Blockchain",
      description: "This beginner lesson introduces the fundamental concepts of cryptocurrency and blockchain technology. Learners will understand what cryptocurrencies are, how blockchain works as the underlying technology, and trace the brief history and evolution of the crypto industry up to 2025.",
      level: "beginner",
      language: "en",
      icon: "bitcoin",
      is_active: true
    },
    {
      title: "Navigating the Crypto Ecosystem",
      description: "This lesson is aimed at beginners ready to learn how to engage with cryptocurrencies in practice. It covers how to store and manage crypto using wallets, how crypto transactions work, and how to buy/sell crypto on exchanges.",
      level: "beginner",
      language: "en",
      icon: "wallet",
      is_active: true
    },
    {
      title: "Blockchain and Cryptocurrency Technology",
      description: "This lesson delves into more technical aspects of how cryptocurrencies work. It explores the structure of blockchain networks and the roles of nodes, different consensus mechanisms, and the types of crypto assets in the ecosystem.",
      level: "intermediate",
      language: "en",
      icon: "blockchain",
      is_active: true
    },
    {
      title: "Cryptocurrency Trading Fundamentals",
      description: "Learn the basics of cryptocurrency trading, including market analysis, trading strategies, risk management, and using trading platforms effectively. This lesson provides a foundation for both beginners and those looking to formalize their trading knowledge.",
      level: "beginner",
      language: "en",
      icon: "trading",
      is_active: true
    },
    {
      title: "Advanced Trading and Investment Strategies",
      description: "Master sophisticated cryptocurrency trading techniques, including technical analysis, fundamental analysis, portfolio management, and advanced trading tools. This lesson is designed for those ready to take their trading to the next level.",
      level: "advanced",
      language: "en",
      icon: "chart",
      is_active: true
    },
    {
      title: "DeFi and Smart Contracts",
      description: "Explore the world of Decentralized Finance (DeFi) and smart contracts. Learn how these technologies are revolutionizing financial services, from lending and borrowing to yield farming and automated market making.",
      level: "advanced",
      language: "en",
      icon: "defi",
      is_active: true
    }
  ]).returning();

  console.log('Created lessons:', lessons.length);

  // Process Lesson 1: Introduction to Cryptocurrency and Blockchain
  const lesson1 = lessons[0];
  const topics1 = await db.insert(schema.topics).values([
    {
      lesson_id: lesson1.id,
      title: "What Is Cryptocurrency?",
      order: 1
    },
    {
      lesson_id: lesson1.id,
      title: "Introduction to Blockchain Technology",
      order: 2
    },
    {
      lesson_id: lesson1.id,
      title: "History and Evolution of Cryptocurrency",
      order: 3
    }
  ]).returning();

  // Process Topic 1.1: What Is Cryptocurrency?
  const topic1_1 = topics1[0];
  const subtopics1_1 = await db.insert(schema.subtopics).values([
    {
      topic_id: topic1_1.id,
      title: "Definition and Key Characteristics of Cryptocurrency",
      objective: "Understand what cryptocurrencies are and their key characteristics compared to traditional money",
      key_concepts: ["digital assets", "decentralization", "cryptography", "peer-to-peer"],
      order: 1
    },
    {
      topic_id: topic1_1.id,
      title: "Cryptocurrencies vs. Traditional Money",
      objective: "Compare and contrast cryptocurrencies with traditional fiat money",
      key_concepts: ["fiat currency", "central banks", "monetary policy", "volatility"],
      order: 2
    },
    {
      topic_id: topic1_1.id,
      title: "Examples of Popular Cryptocurrencies",
      objective: "Learn about major cryptocurrencies and their unique features",
      key_concepts: ["Bitcoin", "Ethereum", "altcoins", "stablecoins"],
      order: 3
    }
  ]).returning();

  // Add resources for subtopic 1.1.1
  await db.insert(schema.resources).values([
    {
      subtopic_id: subtopics1_1[0].id,
      type: "article",
      title: "What Is Cryptocurrency?",
      url: "https://www.britannica.com/money/what-is-cryptocurrency",
      description: "Comprehensive introduction to cryptocurrency fundamentals",
      purpose: "overview",
      content_tags: ["cryptocurrency", "basics", "introduction"],
      recommended_when: "before_lesson",
      is_optional: false
    },
    {
      subtopic_id: subtopics1_1[0].id,
      type: "video",
      title: "Cryptocurrency Explained",
      url: "https://www.youtube.com/watch?v=1MxM1eTbXb0",
      description: "Video explanation of cryptocurrency basics",
      purpose: "visual_learning",
      content_tags: ["cryptocurrency", "video", "basics"],
      recommended_when: "during_lesson",
      is_optional: false
    },
    {
      subtopic_id: subtopics1_1[1].id,
      type: "article",
      title: "Cryptocurrency vs Traditional Money",
      url: "https://www.investopedia.com/terms/c/cryptocurrency.asp",
      description: "Comparison between cryptocurrency and traditional money",
      purpose: "comparison",
      content_tags: ["cryptocurrency", "fiat", "comparison"],
      recommended_when: "during_lesson",
      is_optional: false
    },
    {
      subtopic_id: subtopics1_1[2].id,
      type: "article",
      title: "Top Cryptocurrencies by Market Cap",
      url: "https://coinmarketcap.com/",
      description: "Overview of major cryptocurrencies",
      purpose: "reference",
      content_tags: ["cryptocurrency", "market", "top"],
      recommended_when: "after_lesson",
      is_optional: false
    }
  ]);

  // Add quiz questions for subtopic 1.1.1
  await db.insert(schema.quizQuestions).values([
    {
      subtopic_id: subtopics1_1[0].id,
      question: "What entity controls or issues decentralized cryptocurrencies?",
      options: [
        "No central entity; they are not controlled by governments or banks",
        "Central banks",
        "Private companies",
        "International organizations"
      ],
      answer: 0,
      explanation: "Decentralized cryptocurrencies are not controlled by any central entity like governments or banks, but by the network of users/computers."
    },
    {
      subtopic_id: subtopics1_1[0].id,
      question: "What technology do cryptocurrencies rely on to verify and record transactions securely?",
      options: [
        "Traditional banking software",
        "Blockchain technology",
        "Excel spreadsheets",
        "Paper ledgers"
      ],
      answer: 1,
      explanation: "Cryptocurrencies rely on blockchain technology (a distributed, encrypted ledger) to verify and record transactions securely."
    }
  ]);

  // Process Topic 1.2: Introduction to Blockchain Technology
  const topic1_2 = topics1[1];
  const subtopics1_2 = await db.insert(schema.subtopics).values([
    {
      topic_id: topic1_2.id,
      title: "What is a Blockchain?",
      objective: "Understand the basic concept of blockchain as a distributed ledger",
      key_concepts: ["distributed ledger", "blocks", "chain", "immutability"],
      order: 1
    },
    {
      topic_id: topic1_2.id,
      title: "How Blockchain Works",
      objective: "Learn about decentralization and verification in blockchain",
      key_concepts: ["decentralization", "consensus", "nodes", "mining"],
      order: 2
    },
    {
      topic_id: topic1_2.id,
      title: "Why Blockchain Is Secure and Disruptive",
      objective: "Understand blockchain's security features and potential impact",
      key_concepts: ["cryptography", "trust", "transparency", "innovation"],
      order: 3
    }
  ]).returning();

  // Add resources for subtopic 1.2.1
  await db.insert(schema.resources).values([
    {
      subtopic_id: subtopics1_2[0].id,
      type: "article",
      title: "Blockchain Basics",
      url: "https://www.investopedia.com/terms/b/blockchain.asp",
      description: "Comprehensive overview of blockchain technology",
      purpose: "overview",
      content_tags: ["blockchain", "basics", "technology"],
      recommended_when: "before_lesson",
      is_optional: false
    }
  ]);

  // Process Lesson 2: Navigating the Crypto Ecosystem
  const lesson2 = lessons[1];
  const topics2 = await db.insert(schema.topics).values([
    {
      lesson_id: lesson2.id,
      title: "Cryptocurrency Wallets",
      order: 1
    },
    {
      lesson_id: lesson2.id,
      title: "Cryptocurrency Transactions",
      order: 2
    },
    {
      lesson_id: lesson2.id,
      title: "Cryptocurrency Exchanges",
      order: 3
    }
  ]).returning();

  // Process Topic 2.1: Cryptocurrency Wallets
  const topic2_1 = topics2[0];
  const subtopics2_1 = await db.insert(schema.subtopics).values([
    {
      topic_id: topic2_1.id,
      title: "What is a Crypto Wallet and How It Works",
      objective: "Understand the basics of cryptocurrency wallets and their function",
      key_concepts: ["private keys", "public keys", "addresses", "security"],
      order: 1
    },
    {
      topic_id: topic2_1.id,
      title: "Types of Wallets",
      objective: "Learn about different types of cryptocurrency wallets",
      key_concepts: ["hot wallets", "cold wallets", "hardware wallets", "software wallets"],
      order: 2
    },
    {
      topic_id: topic2_1.id,
      title: "Wallet Security Best Practices",
      objective: "Master essential security practices for protecting your crypto",
      key_concepts: ["backup", "seed phrase", "2FA", "private key management"],
      order: 3
    }
  ]).returning();

  // Add resources for Lesson 2: Navigating the Crypto Ecosystem
  await db.insert(schema.resources).values([
    {
      subtopic_id: subtopics2_1[0].id,
      type: "article",
      title: "Crypto Wallets: A Complete Guide",
      url: "https://www.coinbase.com/learn/crypto-basics/what-is-a-crypto-wallet",
      description: "Detailed guide on cryptocurrency wallets",
      purpose: "overview",
      content_tags: ["wallets", "security", "basics"],
      recommended_when: "before_lesson",
      is_optional: false
    },
    {
      subtopic_id: subtopics2_1[0].id,
      type: "video",
      title: "How to Set Up a Crypto Wallet",
      url: "https://www.youtube.com/watch?v=3xGLc-zz9cA",
      description: "Step-by-step guide to setting up a crypto wallet",
      purpose: "tutorial",
      content_tags: ["wallets", "setup", "tutorial"],
      recommended_when: "during_lesson",
      is_optional: false
    },
    {
      subtopic_id: subtopics2_1[1].id,
      type: "article",
      title: "Types of Crypto Wallets",
      url: "https://www.ledger.com/academy/crypto/what-are-the-different-types-of-crypto-wallets",
      description: "Overview of different types of cryptocurrency wallets",
      purpose: "reference",
      content_tags: ["wallets", "types", "security"],
      recommended_when: "during_lesson",
      is_optional: false
    },
    {
      subtopic_id: subtopics2_1[2].id,
      type: "article",
      title: "Crypto Wallet Security Best Practices",
      url: "https://www.coinbase.com/learn/crypto-basics/crypto-wallet-security",
      description: "Security guidelines for cryptocurrency wallets",
      purpose: "security",
      content_tags: ["wallets", "security", "best practices"],
      recommended_when: "after_lesson",
      is_optional: false
    }
  ]);

  // Process Lesson 3: Blockchain and Cryptocurrency Technology
  const lesson3 = lessons[2];
  const topics3 = await db.insert(schema.topics).values([
    {
      lesson_id: lesson3.id,
      title: "Blockchain Structure and Nodes",
      order: 1
    },
    {
      lesson_id: lesson3.id,
      title: "Consensus Mechanisms",
      order: 2
    },
    {
      lesson_id: lesson3.id,
      title: "Types of Crypto Assets",
      order: 3
    }
  ]).returning();

  // Process Topic 3.1: Blockchain Structure and Nodes
  const topic3_1 = topics3[0];
  const subtopics3_1 = await db.insert(schema.subtopics).values([
    {
      topic_id: topic3_1.id,
      title: "Nodes in a Blockchain Network",
      objective: "Understand different types of nodes and their roles",
      key_concepts: ["full nodes", "mining nodes", "light nodes", "validation"],
      order: 1
    },
    {
      topic_id: topic3_1.id,
      title: "Block Structure",
      objective: "Learn about the components of a blockchain block",
      key_concepts: ["headers", "transactions", "hashes", "merkle trees"],
      order: 2
    },
    {
      topic_id: topic3_1.id,
      title: "Blockchain Forks and Upgrades",
      objective: "Understand how blockchains evolve and handle changes",
      key_concepts: ["hard forks", "soft forks", "upgrades", "consensus"],
      order: 3
    }
  ]).returning();

  // Add resources for Lesson 3: Blockchain and Cryptocurrency Technology
  await db.insert(schema.resources).values([
    {
      subtopic_id: subtopics3_1[0].id,
      type: "article",
      title: "Understanding Blockchain Technology",
      url: "https://www.investopedia.com/terms/b/blockchain.asp",
      description: "In-depth explanation of blockchain technology",
      purpose: "overview",
      content_tags: ["blockchain", "technology", "basics"],
      recommended_when: "before_lesson",
      is_optional: false
    },
    {
      subtopic_id: subtopics3_1[0].id,
      type: "video",
      title: "How Blockchain Works",
      url: "https://www.youtube.com/watch?v=SSo_EIwHSd4",
      description: "Visual explanation of blockchain technology",
      purpose: "visual_learning",
      content_tags: ["blockchain", "technology", "video"],
      recommended_when: "during_lesson",
      is_optional: false
    },
    {
      subtopic_id: subtopics3_1[1].id,
      type: "article",
      title: "Blockchain Block Structure",
      url: "https://www.investopedia.com/terms/b/block-bitcoin-block.asp",
      description: "Detailed explanation of blockchain block structure",
      purpose: "technical",
      content_tags: ["blockchain", "structure", "technical"],
      recommended_when: "during_lesson",
      is_optional: false
    },
    {
      subtopic_id: subtopics3_1[2].id,
      type: "article",
      title: "Understanding Blockchain Forks",
      url: "https://www.investopedia.com/terms/h/hard-fork.asp",
      description: "Explanation of blockchain forks and upgrades",
      purpose: "technical",
      content_tags: ["blockchain", "forks", "upgrades"],
      recommended_when: "after_lesson",
      is_optional: false
    }
  ]);

  // Process Lesson 4: Cryptocurrency Trading Fundamentals
  const lesson4 = lessons[3];
  const topics4 = await db.insert(schema.topics).values([
    {
      lesson_id: lesson4.id,
      title: "Understanding Cryptocurrency Markets",
      order: 1
    },
    {
      lesson_id: lesson4.id,
      title: "Basic Trading Concepts",
      order: 2
    },
    {
      lesson_id: lesson4.id,
      title: "Risk Management Fundamentals",
      order: 3
    }
  ]).returning();

  // Process Topic 4.1: Understanding Cryptocurrency Markets
  const topic4_1 = topics4[0];
  const subtopics4_1 = await db.insert(schema.subtopics).values([
    {
      topic_id: topic4_1.id,
      title: "Market Structure and Participants",
      objective: "Understand how crypto markets work and who participates in them",
      key_concepts: ["exchanges", "market makers", "traders", "liquidity"],
      order: 1
    },
    {
      topic_id: topic4_1.id,
      title: "Market Analysis Basics",
      objective: "Learn fundamental and technical analysis basics",
      key_concepts: ["price action", "volume", "trends", "indicators"],
      order: 2
    },
    {
      topic_id: topic4_1.id,
      title: "Market Psychology",
      objective: "Understand market sentiment and psychological factors",
      key_concepts: ["fear and greed", "FOMO", "market cycles", "sentiment analysis"],
      order: 3
    }
  ]).returning();

  // Add resources for Lesson 4: Cryptocurrency Trading Fundamentals
  await db.insert(schema.resources).values([
    {
      subtopic_id: subtopics4_1[0].id,
      type: "article",
      title: "Crypto Trading Basics",
      url: "https://www.binance.com/en/blog/ecosystem/crypto-trading-basics-421499824684903168",
      description: "Introduction to cryptocurrency trading",
      purpose: "overview",
      content_tags: ["trading", "basics", "markets"],
      recommended_when: "before_lesson",
      is_optional: false
    },
    {
      subtopic_id: subtopics4_1[0].id,
      type: "video",
      title: "Crypto Trading for Beginners",
      url: "https://www.youtube.com/watch?v=GmOzih6I1zs",
      description: "Beginner's guide to crypto trading",
      purpose: "tutorial",
      content_tags: ["trading", "beginners", "video"],
      recommended_when: "during_lesson",
      is_optional: false
    },
    {
      subtopic_id: subtopics4_1[1].id,
      type: "article",
      title: "Technical Analysis Basics",
      url: "https://www.investopedia.com/technical-analysis-4689657",
      description: "Introduction to technical analysis",
      purpose: "technical",
      content_tags: ["trading", "technical", "analysis"],
      recommended_when: "during_lesson",
      is_optional: false
    },
    {
      subtopic_id: subtopics4_1[2].id,
      type: "article",
      title: "Market Psychology in Trading",
      url: "https://www.investopedia.com/articles/trading/11/understanding-market-psychology.asp",
      description: "Understanding market psychology in trading",
      purpose: "psychology",
      content_tags: ["trading", "psychology", "market"],
      recommended_when: "after_lesson",
      is_optional: false
    }
  ]);

  // Process Lesson 5: Advanced Trading and Investment Strategies
  const lesson5 = lessons[4];
  const topics5 = await db.insert(schema.topics).values([
    {
      lesson_id: lesson5.id,
      title: "Advanced Technical Analysis",
      order: 1
    },
    {
      lesson_id: lesson5.id,
      title: "Trading Strategies and Execution",
      order: 2
    },
    {
      lesson_id: lesson5.id,
      title: "Portfolio Management",
      order: 3
    }
  ]).returning();

  // Process Topic 5.1: Advanced Technical Analysis
  const topic5_1 = topics5[0];
  const subtopics5_1 = await db.insert(schema.subtopics).values([
    {
      topic_id: topic5_1.id,
      title: "Advanced Chart Patterns",
      objective: "Master complex chart patterns and their implications",
      key_concepts: ["harmonic patterns", "elliott waves", "fibonacci", "divergences"],
      order: 1
    },
    {
      topic_id: topic5_1.id,
      title: "Advanced Indicators",
      objective: "Learn to use and combine sophisticated technical indicators",
      key_concepts: ["oscillators", "momentum", "volume analysis", "custom indicators"],
      order: 2
    },
    {
      topic_id: topic5_1.id,
      title: "Market Structure Analysis",
      objective: "Understand advanced concepts in market structure",
      key_concepts: ["order flow", "market depth", "liquidity analysis", "volume profile"],
      order: 3
    }
  ]).returning();

  // Add resources for Lesson 5: Advanced Trading and Investment Strategies
  await db.insert(schema.resources).values([
    {
      subtopic_id: subtopics5_1[0].id,
      type: "article",
      title: "Advanced Technical Analysis",
      url: "https://www.investopedia.com/technical-analysis-4689657",
      description: "Advanced technical analysis techniques",
      purpose: "advanced",
      content_tags: ["trading", "technical", "advanced"],
      recommended_when: "before_lesson",
      is_optional: false
    },
    {
      subtopic_id: subtopics5_1[0].id,
      type: "video",
      title: "Advanced Trading Strategies",
      url: "https://www.youtube.com/watch?v=K8qYdD1sC7w",
      description: "Advanced trading techniques and strategies",
      purpose: "advanced",
      content_tags: ["trading", "strategies", "advanced"],
      recommended_when: "during_lesson",
      is_optional: false
    },
    {
      subtopic_id: subtopics5_1[1].id,
      type: "article",
      title: "Advanced Trading Indicators",
      url: "https://www.investopedia.com/articles/active-trading/101014/basics-algorithmic-trading-concepts-and-examples.asp",
      description: "Advanced trading indicators and their use",
      purpose: "technical",
      content_tags: ["trading", "indicators", "advanced"],
      recommended_when: "during_lesson",
      is_optional: false
    },
    {
      subtopic_id: subtopics5_1[2].id,
      type: "article",
      title: "Market Structure Analysis",
      url: "https://www.investopedia.com/articles/trading/11/understanding-market-structure.asp",
      description: "Advanced market structure analysis",
      purpose: "technical",
      content_tags: ["trading", "market", "structure"],
      recommended_when: "after_lesson",
      is_optional: false
    }
  ]);

  // Process Lesson 6: DeFi and Smart Contracts
  const lesson6 = lessons[5];
  const topics6 = await db.insert(schema.topics).values([
    {
      lesson_id: lesson6.id,
      title: "Introduction to DeFi",
      order: 1
    },
    {
      lesson_id: lesson6.id,
      title: "Smart Contracts and DApps",
      order: 2
    },
    {
      lesson_id: lesson6.id,
      title: "DeFi Protocols and Use Cases",
      order: 3
    }
  ]).returning();

  // Process Topic 6.1: Introduction to DeFi
  const topic6_1 = topics6[0];
  const subtopics6_1 = await db.insert(schema.subtopics).values([
    {
      topic_id: topic6_1.id,
      title: "What is DeFi?",
      objective: "Understand the basics of decentralized finance",
      key_concepts: ["decentralization", "financial services", "permissionless", "composability"],
      order: 1
    },
    {
      topic_id: topic6_1.id,
      title: "DeFi vs Traditional Finance",
      objective: "Compare DeFi with traditional financial systems",
      key_concepts: ["intermediaries", "custody", "accessibility", "innovation"],
      order: 2
    },
    {
      topic_id: topic6_1.id,
      title: "DeFi Ecosystem Overview",
      objective: "Learn about major DeFi protocols and categories",
      key_concepts: ["lending", "DEXs", "yield farming", "stablecoins"],
      order: 3
    }
  ]).returning();

  // Add resources for Lesson 6: DeFi and Smart Contracts
  await db.insert(schema.resources).values([
    {
      subtopic_id: subtopics6_1[0].id,
      type: "article",
      title: "What Is Decentralized Finance (DeFi)?",
      url: "https://www.investopedia.com/decentralized-finance-defi-5113835",
      description: "Comprehensive introduction to DeFi concepts and applications",
      purpose: "overview",
      content_tags: ["defi", "basics", "introduction"],
      recommended_when: "before_lesson",
      is_optional: false
    },
    {
      subtopic_id: subtopics6_1[0].id,
      type: "video",
      title: "DeFi Explained",
      url: "https://www.youtube.com/watch?v=17QRFlM4x1k",
      description: "Video explanation of DeFi concepts",
      purpose: "visual_learning",
      content_tags: ["defi", "video", "basics"],
      recommended_when: "during_lesson",
      is_optional: false
    },
    {
      subtopic_id: subtopics6_1[1].id,
      type: "article",
      title: "DeFi vs Traditional Finance",
      url: "https://www.coinbase.com/learn/crypto-basics/what-is-defi",
      description: "Comparison between DeFi and traditional finance",
      purpose: "comparison",
      content_tags: ["defi", "finance", "comparison"],
      recommended_when: "during_lesson",
      is_optional: false
    },
    {
      subtopic_id: subtopics6_1[2].id,
      type: "article",
      title: "DeFi Ecosystem Overview",
      url: "https://defipulse.com/",
      description: "Overview of the DeFi ecosystem",
      purpose: "reference",
      content_tags: ["defi", "ecosystem", "overview"],
      recommended_when: "after_lesson",
      is_optional: false
    }
  ]);

  // Add quiz questions for DeFi introduction
  await db.insert(schema.quizQuestions).values([
    {
      subtopic_id: subtopics6_1[0].id,
      question: "What is the main difference between DeFi and traditional finance?",
      options: [
        "DeFi operates without centralized intermediaries",
        "DeFi only uses Bitcoin",
        "DeFi requires a bank account",
        "DeFi is controlled by governments"
      ],
      answer: 0,
      explanation: "DeFi's key innovation is removing centralized intermediaries, allowing financial services to operate in a decentralized manner through smart contracts."
    },
    {
      subtopic_id: subtopics6_1[0].id,
      question: "What is composability in DeFi?",
      options: [
        "The ability to combine different DeFi protocols like building blocks",
        "The ability to write smart contracts",
        "The ability to trade cryptocurrencies",
        "The ability to earn interest"
      ],
      answer: 0,
      explanation: "Composability refers to DeFi protocols' ability to interact and build upon each other, often called 'money legos'."
    }
  ]);

  await client.end();
  console.log('\nSeeding completed successfully!');
}

seedCourses().catch(console.error); 
import {
  User, InsertUser,
  Lesson, Topic, Subtopic, Resource,
  QuizQuestion, FinalTestQuestion,
  UserProgress, InsertUserProgress,
  UserFinalTestResult, InsertUserFinalTestResult,
  users, lessons, topics, subtopics, resources, quizQuestions, finalTestQuestions, userProgress, userFinalTestResults
} from "@shared/schema";
import { db } from "./db";
import { eq, and, asc, desc } from "drizzle-orm";

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lesson methods
  getLessons(): Promise<Lesson[]>;
  getLessonById(id: number): Promise<Lesson | undefined>;
  getLessonWithDetails(id: number): Promise<any>; // Full lesson with topics, subtopics
  
  // Topic methods
  getTopicsByLessonId(lessonId: number): Promise<Topic[]>;
  getTopicById(id: number): Promise<Topic | undefined>;
  
  // Subtopic methods
  getSubtopicsByTopicId(topicId: number): Promise<Subtopic[]>;
  getSubtopicById(id: number): Promise<Subtopic | undefined>;
  getSubtopicWithResources(id: number): Promise<any>; // Subtopic with resources
  
  // Resource methods
  getResourcesBySubtopicId(subtopicId: number): Promise<Resource[]>;
  getResourceById(id: number): Promise<Resource | undefined>;
  
  // Quiz methods
  getQuizQuestionsBySubtopicId(subtopicId: number): Promise<QuizQuestion[]>;
  getFinalTestQuestionsByLessonId(lessonId: number): Promise<FinalTestQuestion[]>;
  
  // Progress methods
  getUserProgress(userId: number, subtopicId: number): Promise<UserProgress | undefined>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getUserProgressByUserId(userId: number): Promise<UserProgress[]>;
  
  // Final test results
  saveFinalTestResult(result: InsertUserFinalTestResult): Promise<UserFinalTestResult>;
  getFinalTestResultByUserAndLesson(userId: number, lessonId: number): Promise<UserFinalTestResult | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Lesson methods
  async getLessons(): Promise<Lesson[]> {
    return await db.select().from(lessons);
  }
  
  async getLessonById(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson;
  }
  
  async getLessonWithDetails(id: number): Promise<any> {
    const lesson = await this.getLessonById(id);
    if (!lesson) return undefined;
    
    const topics = await this.getTopicsByLessonId(id);
    const topicsWithSubtopics = await Promise.all(
      topics.map(async (topic) => {
        const subtopics = await this.getSubtopicsByTopicId(topic.id);
        const subtopicsWithResources = await Promise.all(
          subtopics.map(async (subtopic) => {
            const resources = await this.getResourcesBySubtopicId(subtopic.id);
            return { ...subtopic, resources };
          })
        );
        return { ...topic, subtopics: subtopicsWithResources };
      })
    );
    
    return { ...lesson, topics: topicsWithSubtopics };
  }
  
  // Topic methods
  async getTopicsByLessonId(lessonId: number): Promise<Topic[]> {
    return await db.select()
      .from(topics)
      .where(eq(topics.lesson_id, lessonId))
      .orderBy(asc(topics.order));
  }
  
  async getTopicById(id: number): Promise<Topic | undefined> {
    const [topic] = await db.select().from(topics).where(eq(topics.id, id));
    return topic;
  }
  
  // Subtopic methods
  async getSubtopicsByTopicId(topicId: number): Promise<Subtopic[]> {
    return await db.select()
      .from(subtopics)
      .where(eq(subtopics.topic_id, topicId))
      .orderBy(asc(subtopics.order));
  }
  
  async getSubtopicById(id: number): Promise<Subtopic | undefined> {
    const [subtopic] = await db.select().from(subtopics).where(eq(subtopics.id, id));
    return subtopic;
  }
  
  async getSubtopicWithResources(id: number): Promise<any> {
    const subtopic = await this.getSubtopicById(id);
    if (!subtopic) return undefined;
    
    const resources = await this.getResourcesBySubtopicId(id);
    return { ...subtopic, resources };
  }
  
  // Resource methods
  async getResourcesBySubtopicId(subtopicId: number): Promise<Resource[]> {
    return await db.select()
      .from(resources)
      .where(eq(resources.subtopic_id, subtopicId));
  }
  
  async getResourceById(id: number): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }
  
  // Quiz methods
  async getQuizQuestionsBySubtopicId(subtopicId: number): Promise<QuizQuestion[]> {
    return await db.select()
      .from(quizQuestions)
      .where(eq(quizQuestions.subtopic_id, subtopicId));
  }
  
  async getFinalTestQuestionsByLessonId(lessonId: number): Promise<FinalTestQuestion[]> {
    return await db.select()
      .from(finalTestQuestions)
      .where(eq(finalTestQuestions.lesson_id, lessonId));
  }
  
  // Progress methods
  async getUserProgress(userId: number, subtopicId: number): Promise<UserProgress | undefined> {
    const [progress] = await db.select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.user_id, userId),
          eq(userProgress.subtopic_id, subtopicId)
        )
      );
    return progress;
  }
  
  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    // Check if progress exists
    const existingProgress = await this.getUserProgress(progress.user_id, progress.subtopic_id);
    
    if (existingProgress) {
      // Update existing progress
      const [updatedProgress] = await db.update(userProgress)
        .set({
          ...progress,
          updated_at: new Date()
        })
        .where(eq(userProgress.id, existingProgress.id))
        .returning();
      return updatedProgress;
    } else {
      // Create new progress
      const [newProgress] = await db.insert(userProgress)
        .values({
          ...progress,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();
      return newProgress;
    }
  }
  
  async getUserProgressByUserId(userId: number): Promise<UserProgress[]> {
    return await db.select()
      .from(userProgress)
      .where(eq(userProgress.user_id, userId));
  }
  
  // Final test results
  async saveFinalTestResult(result: InsertUserFinalTestResult): Promise<UserFinalTestResult> {
    const [newResult] = await db.insert(userFinalTestResults)
      .values({
        ...result,
        completed_at: new Date()
      })
      .returning();
    return newResult;
  }
  
  async getFinalTestResultByUserAndLesson(userId: number, lessonId: number): Promise<UserFinalTestResult | undefined> {
    const [result] = await db.select()
      .from(userFinalTestResults)
      .where(
        and(
          eq(userFinalTestResults.user_id, userId),
          eq(userFinalTestResults.lesson_id, lessonId)
        )
      );
    return result;
  }
}

// Create seed data function for cryptocurrency learning platform
export async function seedDatabase() {
  try {
    // Check if database has been seeded already
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log('Database already seeded');
      return;
    }

    console.log('Seeding database with cryptocurrency learning content...');

    // Create demo user
    const [user] = await db.insert(users).values({
      username: 'crypto_learner',
      password: 'password', // In production, this would be hashed
      name: 'Crypto Student',
      email: 'student@example.com'
    }).returning();
    
    // Create a lesson
    const [lesson] = await db.insert(lessons).values({
      title: 'Cryptocurrency 101',
      description: 'A comprehensive introduction to the world of cryptocurrency and blockchain technology.',
      icon: '₿'
    }).returning();
    
    // Create 4 topics for the lesson
    const topicTitles = [
      'Fundamentals of Cryptocurrencies',
      'Blockchain Technology',
      'Crypto Trading and Security',
      'Future of Cryptocurrency'
    ];
    
    const createdTopics: Topic[] = [];
    
    for (let i = 0; i < topicTitles.length; i++) {
      const [topic] = await db.insert(topics).values({
        lesson_id: lesson.id,
        title: topicTitles[i],
        order: i + 1
      }).returning();
      createdTopics.push(topic);
    }
    
    // For each topic, create 4 subtopics with key concepts
    const subtopicData = [
      // Topic 1: Fundamentals of Cryptocurrencies
      [
        { 
          title: 'History of Cryptocurrency',
          objective: 'Understand the origins and evolution of cryptocurrencies.',
          key_concepts: ['Bitcoin', 'Satoshi Nakamoto', 'Cryptocurrency timeline', 'Digital cash']
        },
        { 
          title: 'How Cryptocurrencies Work',
          objective: 'Learn the basic technical principles behind cryptocurrencies.',
          key_concepts: ['Digital signatures', 'Cryptographic hashing', 'Peer-to-peer networks', 'Decentralization']
        },
        { 
          title: 'Types of Cryptocurrencies',
          objective: 'Explore the different types and classifications of cryptocurrencies.',
          key_concepts: ['Bitcoin', 'Altcoins', 'Tokens', 'Stablecoins', 'Utility tokens']
        },
        { 
          title: 'Cryptocurrency vs Traditional Currency',
          objective: 'Compare and contrast cryptocurrencies with traditional fiat currencies.',
          key_concepts: ['Centralization vs decentralization', 'Inflation', 'Supply control', 'Trust mechanisms']
        }
      ],
      
      // Topic 2: Blockchain Technology
      [
        { 
          title: 'Blockchain Fundamentals',
          objective: 'Understand the core concepts and structure of blockchain technology.',
          key_concepts: ['Blocks', 'Distributed ledger', 'Immutability', 'Transparency']
        },
        { 
          title: 'Consensus Mechanisms',
          objective: 'Learn about different consensus mechanisms used in blockchain networks.',
          key_concepts: ['Proof of Work', 'Proof of Stake', 'Delegated Proof of Stake', 'Byzantine Fault Tolerance']
        },
        { 
          title: 'Mining and Validation',
          objective: 'Understand the process of mining and transaction validation.',
          key_concepts: ['Hash rate', 'Mining pools', 'Block rewards', 'Transaction fees', 'Difficulty adjustment']
        },
        { 
          title: 'Public vs Private Blockchains',
          objective: 'Compare different types of blockchain implementations and their use cases.',
          key_concepts: ['Permissioned vs permissionless', 'Enterprise blockchains', 'Consortium blockchains', 'Hybrid solutions']
        }
      ],
      
      // Topic 3: Crypto Trading and Security
      [
        { 
          title: 'Crypto Exchanges',
          objective: 'Learn about different types of cryptocurrency exchanges and how they work.',
          key_concepts: ['Centralized exchanges', 'Decentralized exchanges', 'Order books', 'Liquidity', 'Trading pairs']
        },
        { 
          title: 'Wallet Types and Security',
          objective: 'Understand different wallet options and security best practices.',
          key_concepts: ['Hot wallets', 'Cold storage', 'Hardware wallets', 'Seed phrases', 'Private keys']
        },
        { 
          title: 'Trading Strategies',
          objective: 'Explore basic trading strategies and risk management in cryptocurrency markets.',
          key_concepts: ['HODL', 'Dollar-cost averaging', 'Technical analysis', 'Fundamental analysis', 'Risk management']
        },
        { 
          title: 'Common Security Threats',
          objective: 'Identify common security threats in the cryptocurrency space and how to avoid them.',
          key_concepts: ['Phishing', 'SIM swapping', 'Fake ICOs', 'Exchange hacks', 'Malware']
        }
      ],
      
      // Topic 4: Future of Cryptocurrency
      [
        { 
          title: 'Decentralized Finance (DeFi)',
          objective: 'Understand the emerging field of decentralized finance and its applications.',
          key_concepts: ['Lending protocols', 'Yield farming', 'Liquidity pools', 'Smart contracts', 'Automated market makers']
        },
        { 
          title: 'NFTs and Digital Ownership',
          objective: 'Learn about non-fungible tokens and their impact on digital ownership.',
          key_concepts: ['Non-fungible tokens', 'Digital art', 'Collectibles', 'Tokenization', 'Royalties']
        },
        { 
          title: 'Regulation and Adoption',
          objective: 'Explore the evolving regulatory landscape and paths to mainstream adoption.',
          key_concepts: ['KYC/AML', 'Institutional adoption', 'Regulatory frameworks', 'Tax implications', 'CBDC']
        },
        { 
          title: 'Emerging Trends and Innovations',
          objective: 'Discover upcoming trends and innovations in the cryptocurrency ecosystem.',
          key_concepts: ['Layer 2 solutions', 'Interoperability', 'Web3', 'DAO', 'Privacy technologies']
        }
      ]
    ];
    
    // Create subtopics, resources, and quiz questions
    for (let topicIndex = 0; topicIndex < createdTopics.length; topicIndex++) {
      const topic = createdTopics[topicIndex];
      
      for (let subtopicIndex = 0; subtopicIndex < subtopicData[topicIndex].length; subtopicIndex++) {
        const data = subtopicData[topicIndex][subtopicIndex];
        
        // Create subtopic
        const [subtopic] = await db.insert(subtopics).values({
          topic_id: topic.id,
          title: data.title,
          objective: data.objective,
          key_concepts: data.key_concepts,
          order: subtopicIndex + 1
        }).returning();
        
        // Add resources for each subtopic
        const resourceTypes = ['text', 'image', 'video', 'text']; // Two text resources, one image, one video
        const resourceDescriptions = [
          `Comprehensive article about ${data.title}`,
          `Infographic explaining key concepts of ${data.title}`,
          `Video tutorial on ${data.title}`,
          `Case studies related to ${data.title}`
        ];
        
        const resourcePurposes = [
          'To provide in-depth information about the topic',
          'To visualize complex concepts in an easy-to-understand format',
          'To demonstrate practical applications through visual explanation',
          'To connect theoretical knowledge with real-world examples'
        ];
        
        const recommendedWhen = [
          'When the learner needs detailed information about the topic',
          'When the learner prefers visual learning and concept mapping',
          'When the learner wants to see practical demonstrations',
          'When the learner wants to understand real-world applications'
        ];
        
        for (let i = 0; i < resourceTypes.length; i++) {
          const type = resourceTypes[i];
          await db.insert(resources).values({
            subtopic_id: subtopic.id,
            type: type,
            url: type === 'image' ? 'https://example.com/crypto/images/placeholder.jpg' : 'https://example.com/crypto/resource',
            description: resourceDescriptions[i],
            purpose: resourcePurposes[i],
            content_tags: [data.title.toLowerCase(), ...data.key_concepts.slice(0, 2), type],
            recommended_when: recommendedWhen[i]
          });
        }
        
        // Create crypto-specific quiz questions for each subtopic
        await createQuizQuestionsForSubtopic(subtopic.id, subtopic.title, data.key_concepts);
      }
    }
    
    // Create final test questions for the cryptocurrency lesson
    await createFinalTestQuestions(lesson.id);
    
    console.log('Cryptocurrency database seeding complete');
  } catch (error) {
    console.error('Error seeding cryptocurrency database:', error);
    throw error;
  }
}

// Helper function to create quiz questions for crypto subtopics
async function createQuizQuestionsForSubtopic(subtopicId: number, subtopicTitle: string, keyConcepts: string[]) {
  // Define specific questions based on the subtopic title
  let questions: any[] = [];
  
  if (subtopicTitle === 'History of Cryptocurrency') {
    questions = [
      {
        question: 'Who is credited with creating Bitcoin?',
        options: ['Vitalik Buterin', 'Satoshi Nakamoto', 'Charlie Lee', 'Nick Szabo'],
        answer: 1,
        explanation: 'Satoshi Nakamoto is the pseudonymous person or group who published the Bitcoin whitepaper in 2008 and created the original Bitcoin software.'
      },
      {
        question: 'In what year was the Bitcoin whitepaper published?',
        options: ['2006', '2008', '2010', '2013'],
        answer: 1,
        explanation: 'The Bitcoin whitepaper titled "Bitcoin: A Peer-to-Peer Electronic Cash System" was published by Satoshi Nakamoto in October 2008.'
      },
      {
        question: 'What was the first real-world purchase made with Bitcoin?',
        options: ['A car', 'Two pizzas', 'A house', 'Computer parts'],
        answer: 1,
        explanation: 'In May 2010, Laszlo Hanyecz purchased two pizzas for 10,000 BTC, marking the first known commercial transaction using Bitcoin.'
      },
      {
        question: 'Which cryptocurrency was the first "altcoin" created after Bitcoin?',
        options: ['Ethereum', 'Litecoin', 'Namecoin', 'Ripple'],
        answer: 2,
        explanation: 'Namecoin, launched in April 2011, is widely considered the first altcoin created after Bitcoin.'
      },
      {
        question: "Which of these was NOT an early influence on Bitcoin's development?",
        options: ["DigiCash", "B-money", "Instagram", "Hashcash"],
        answer: 2,
        explanation: "Instagram, a social media platform, had no influence on Bitcoin's development. DigiCash, B-money, and Hashcash were all projects that influenced Bitcoin's design."
      }
    ];
  } else if (subtopicTitle === 'How Cryptocurrencies Work') {
    questions = [
      {
        question: 'What cryptographic technique is fundamental to cryptocurrency transactions?',
        options: ['RSA encryption', 'Digital signatures', 'Symmetric encryption', 'Stream ciphers'],
        answer: 1,
        explanation: 'Digital signatures are fundamental to cryptocurrency transactions, allowing users to prove ownership of their funds and authorize transactions.'
      },
      {
        question: 'Which of the following best describes a "blockchain"?',
        options: [
          'A centralized database',
          'A distributed ledger of transactions',
          'A type of cryptocurrency',
          'A password manager'
        ],
        answer: 1,
        explanation: 'A blockchain is a distributed ledger of transactions maintained by a network of computers, creating an immutable record of all transactions.'
      },
      {
        question: 'What happens during the mining process in Proof of Work cryptocurrencies?',
        options: [
          'Creation of private keys',
          'Solving complex mathematical puzzles to validate transactions',
          'Physical extraction of digital coins',
          'Converting fiat currency to cryptocurrency'
        ],
        answer: 1,
        explanation: 'In Proof of Work cryptocurrencies, miners solve complex mathematical puzzles to validate transactions and add new blocks to the blockchain.'
      },
      {
        question: 'What is a "node" in cryptocurrency networks?',
        options: [
          'A unit of cryptocurrency',
          'A computer that maintains a copy of the blockchain',
          'A transaction between two parties',
          'The founder of a cryptocurrency'
        ],
        answer: 1,
        explanation: 'A node is a computer that maintains a copy of the blockchain and participates in the network, helping to validate and relay transactions.'
      },
      {
        question: 'What is the primary purpose of cryptography in cryptocurrencies?',
        options: [
          'To make transactions faster',
          'To reduce transaction fees',
          'To secure transactions and control the creation of new units',
          'To increase mining profitability'
        ],
        answer: 2,
        explanation: 'Cryptography in cryptocurrencies is primarily used to secure transactions and control the creation of new units, ensuring the integrity and security of the system.'
      }
    ];
  } else {
    // Generate generic questions for other subtopics
    questions = [
      {
        question: `Which of the following is most closely associated with ${subtopicTitle}?`,
        options: [keyConcepts[0], 'Traditional banking', 'Paper currency', 'Stock markets'],
        answer: 0,
        explanation: `${keyConcepts[0]} is a key concept in ${subtopicTitle}, representing a fundamental aspect of this area in cryptocurrency.`
      },
      {
        question: `What is the primary benefit of ${keyConcepts[1]} in cryptocurrency systems?`,
        options: [
          'Increased centralization',
          'Enhanced security and transparency',
          'Slower transaction speeds',
          'Higher transaction fees'
        ],
        answer: 1,
        explanation: `${keyConcepts[1]} provides enhanced security and transparency in cryptocurrency systems, which is a critical benefit for users.`
      },
      {
        question: `How does ${subtopicTitle} relate to the concept of decentralization?`,
        options: [
          'It opposes decentralization',
          'It is unrelated to decentralization',
          'It enhances and supports decentralization',
          'It only affects centralized systems'
        ],
        answer: 2,
        explanation: `${subtopicTitle} enhances and supports decentralization, which is a core principle of most cryptocurrency systems.`
      },
      {
        question: `Which of the following is NOT typically considered a feature of ${subtopicTitle}?`,
        options: [
          'Enhanced security',
          'Greater transparency',
          'Reliance on central authorities',
          'User control'
        ],
        answer: 2,
        explanation: `Reliance on central authorities is NOT typically a feature of ${subtopicTitle}, as cryptocurrency systems generally aim to reduce or eliminate dependence on centralized control.`
      },
      {
        question: `What potential challenge is associated with ${subtopicTitle} in cryptocurrency?`,
        options: [
          'Too much user privacy',
          'Regulatory uncertainty',
          'Too slow adoption',
          'Excessive simplicity'
        ],
        answer: 1,
        explanation: `Regulatory uncertainty is a significant challenge associated with ${subtopicTitle} in cryptocurrency, as legal frameworks continue to evolve around these new technologies.`
      }
    ];
  }
  
  // Insert the questions into the database
  for (const question of questions) {
    await db.insert(quizQuestions).values({
      subtopic_id: subtopicId,
      question: question.question,
      options: question.options,
      answer: question.answer,
      explanation: question.explanation
    });
  }
}

// Helper function to create final test questions for cryptocurrency lesson
async function createFinalTestQuestions(lessonId: number) {
  // Rename the array to avoid conflict with the table name imported from schema
  const testQuestions = [
    {
      question: 'What was the first cryptocurrency ever created?',
      options: ['Ethereum', 'Bitcoin', 'Litecoin', 'Dogecoin'],
      answer: 1,
      explanation: 'Bitcoin was the first cryptocurrency, created by Satoshi Nakamoto in 2009.'
    },
    {
      question: 'What technology underlies most cryptocurrencies?',
      options: ['Artificial Intelligence', 'Cloud Computing', 'Blockchain', 'Quantum Computing'],
      answer: 2,
      explanation: 'Blockchain technology underlies most cryptocurrencies, providing a secure, decentralized ledger for transactions.'
    },
    {
      question: 'What is the process called when new cryptocurrencies are created through mathematical calculations?',
      options: ['Printing', 'Mining', 'Minting', 'Harvesting'],
      answer: 1,
      explanation: 'Mining is the process where computers solve complex mathematical problems to validate transactions and add new blocks to the blockchain, resulting in the release of new coins.'
    },
    {
      question: 'What is a "private key" in cryptocurrency?',
      options: [
        'A password to access an exchange account',
        'The hash of a transaction',
        'A secret code that allows you to spend your cryptocurrency',
        'The ID number of a cryptocurrency wallet'
      ],
      answer: 2,
      explanation: 'A private key is a secret, alphanumeric code that allows you to access and control your cryptocurrency. It proves ownership and enables you to sign transactions.'
    },
    {
      question: 'What is the term for the halving of mining rewards in Bitcoin?',
      options: ['Fork', 'Halving', 'Sharding', 'Staking'],
      answer: 1,
      explanation: 'The "halving" is a built-in event in Bitcoin\'s protocol where mining rewards are cut in half approximately every four years, reducing the rate at which new bitcoins are created.'
    },
    {
      question: 'Which consensus mechanism does Bitcoin use?',
      options: ['Proof of Stake', 'Proof of Work', 'Proof of Authority', 'Delegated Proof of Stake'],
      answer: 1,
      explanation: 'Bitcoin uses Proof of Work (PoW), where miners compete to solve complex mathematical puzzles to validate transactions and create new blocks.'
    },
    {
      question: 'What are smart contracts?',
      options: [
        'Legal agreements about cryptocurrency ownership',
        'Self-executing contracts with the terms written in code',
        'Agreements between miners and exchanges',
        'Insurance policies for cryptocurrency investments'
      ],
      answer: 1,
      explanation: 'Smart contracts are self-executing contracts with the terms directly written into code. They automatically execute when predetermined conditions are met, without the need for intermediaries.'
    },
    {
      question: 'What are Non-Fungible Tokens (NFTs)?',
      options: [
        'Tokens that can be exchanged on a 1:1 basis',
        'Unique digital assets that represent ownership of specific items',
        'A type of cryptocurrency mining hardware',
        'Software used to secure cryptocurrency wallets'
      ],
      answer: 1,
      explanation: 'NFTs are unique digital assets that represent ownership of specific items, such as digital art, collectibles, or other forms of creative work. Unlike cryptocurrencies, they are not interchangeable.'
    },
    {
      question: 'What is a "51% attack" in cryptocurrency?',
      options: [
        "When 51% of a coin's supply is owned by one entity",
        'When a network attacker controls more than 51% of the mining power',
        'When 51% of exchanges delist a cryptocurrency',
        'When a cryptocurrency loses 51% of its value'
      ],
      answer: 1,
      explanation: 'A 51% attack occurs when a single entity or organization controls more than 51% of the mining power (hash rate) in a blockchain network, potentially allowing them to disrupt the network by double-spending coins.'
    },
    {
      question: 'What is DeFi?',
      options: [
        'Digital Finance',
        'Decentralized Finance',
        'Defined Financial Instruments',
        'Distributed Financial Index'
      ],
      answer: 1,
      explanation: 'DeFi (Decentralized Finance) refers to financial applications built on blockchain technologies that aim to recreate traditional financial systems (like loans, insurance, or trading) without centralized intermediaries.'
    }
  ];
  
  // Insert the final test questions into the database
  // Using our renamed variable testQuestions and the imported table finalTestQuestions
  for (const questionData of testQuestions) {
    await db.insert(finalTestQuestions).values({
      lesson_id: lessonId,
      question: questionData.question,
      options: questionData.options,
      answer: questionData.answer,
      explanation: questionData.explanation
    });
  }
}

// Use the DatabaseStorage implementation
export const storage = new DatabaseStorage();

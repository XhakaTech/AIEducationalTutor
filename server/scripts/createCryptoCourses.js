import fetch from 'node-fetch';
import fs from 'fs/promises';

const BASE_URL = 'http://localhost:5000';
let authToken = null;

async function fetchAPI(endpoint, options = {}) {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  };

  if (authToken) {
    defaultOptions.headers.Authorization = `Bearer ${authToken}`;
  }

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, finalOptions);
  
  if (!response.ok) {
    let errorMessage;
    try {
      const error = await response.json();
      errorMessage = error.message || response.statusText;
    } catch {
      errorMessage = response.statusText;
    }
    throw new Error(`API request failed: ${errorMessage}`);
  }

  return response;
}

async function login() {
  try {
    const response = await fetchAPI('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    const { token } = await response.json();
    authToken = token;
    console.log('Logged in successfully as admin');
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
}

async function createLesson(lessonData) {
  const response = await fetchAPI('/api/admin/lessons', {
    method: 'POST',
    body: JSON.stringify({ lesson: lessonData })
  });
  return response.json();
}

async function createTopic(topicData) {
  const response = await fetchAPI('/api/admin/topics', {
    method: 'POST',
    body: JSON.stringify({ topic: topicData })
  });
  return response.json();
}

async function createSubtopic(subtopicData) {
  const response = await fetchAPI('/api/admin/subtopics', {
    method: 'POST',
    body: JSON.stringify({ subtopic: subtopicData })
  });
  return response.json();
}

async function createResource(resourceData) {
  const response = await fetchAPI('/api/admin/resources', {
    method: 'POST',
    body: JSON.stringify({ resource: resourceData })
  });
  return response.json();
}

async function createQuizQuestion(questionData) {
  const response = await fetchAPI('/api/admin/quiz-questions', {
    method: 'POST',
    body: JSON.stringify({ question: questionData })
  });
  return response.json();
}

async function verifySubtopic(subtopicId) {
  try {
    const response = await fetch(`${BASE_URL}/admin/subtopics/${subtopicId}`);
    if (!response.ok) {
      console.error(`Subtopic ${subtopicId} not found`);
      return false;
    }
    const subtopic = await response.json();
    return !!subtopic;
  } catch (error) {
    console.error('Error verifying subtopic:', error);
    return false;
  }
}

async function clearDatabase() {
  try {
    // Get all lessons
    const lessons = await fetchAPI('/admin/lessons');
    
    // Delete each lesson (this will cascade delete related data)
    for (const lesson of lessons) {
      await fetchAPI(`/admin/lessons/${lesson.id}`, 'DELETE');
      console.log(`Deleted lesson: ${lesson.title}`);
    }
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

const courses = [
  {
    title: "Cryptocurrency Fundamentals",
    description: "Master the essential concepts of cryptocurrency and blockchain technology. This comprehensive course covers everything from basic terminology to practical applications.",
    icon: "📚",
    topics: [
      {
        title: "Introduction to Blockchain",
        subtopics: [
          {
            title: "What is Blockchain Technology?",
            objective: "Understand the fundamental concepts and mechanics of blockchain technology",
            key_concepts: ["Distributed Ledger", "Consensus Mechanisms", "Cryptographic Hashing", "Immutability"],
            resources: [
              {
                title: "Blockchain Technology Explained",
                type: "video",
                url: "https://www.youtube.com/watch?v=SSo_EIwHSd4",
                description: "Comprehensive video explanation of blockchain technology fundamentals",
                purpose: "Visual introduction to blockchain concepts",
                content_tags: ["blockchain", "basics", "technology"],
                recommended_when: "Starting the course",
                is_optional: false
              },
              {
                title: "How Blockchain Works",
                type: "article",
                url: "https://www.investopedia.com/terms/b/blockchain.asp",
                description: "Detailed article explaining blockchain mechanics",
                purpose: "Deep dive into blockchain functionality",
                content_tags: ["technical", "blockchain", "mechanics"],
                recommended_when: "After watching the introduction video",
                is_optional: false
              }
            ],
            quiz_questions: [
              {
                question: "What is the primary purpose of blockchain technology?",
                options: [
                  "To create cryptocurrencies",
                  "To maintain a decentralized, immutable ledger of transactions",
                  "To replace traditional banking systems",
                  "To mine Bitcoin"
                ],
                answer: 1,
                explanation: "Blockchain's primary purpose is to maintain a decentralized, immutable ledger that can record any type of transaction or data."
              }
            ]
          },
          {
            title: "Blockchain Architecture",
            objective: "Learn about the key components that make up a blockchain system",
            key_concepts: ["Blocks", "Nodes", "Mining", "Network Topology"],
            resources: [
              {
                title: "Understanding Blockchain Architecture",
                type: "article",
                url: "https://www.ibm.com/topics/blockchain-architecture",
                description: "Detailed explanation of blockchain architecture components",
                purpose: "Technical understanding of blockchain structure",
                content_tags: ["architecture", "technical", "components"],
                recommended_when: "After grasping basic concepts",
                is_optional: false
              }
            ],
            quiz_questions: [
              {
                question: "What is a block in blockchain technology?",
                options: [
                  "A single transaction",
                  "A collection of validated transactions with a timestamp",
                  "A type of cryptocurrency",
                  "A mining computer"
                ],
                answer: 1,
                explanation: "A block is a collection of validated transactions that includes a timestamp and reference to the previous block."
              }
            ]
          }
        ]
      },
      {
        title: "Digital Currencies Basics",
        subtopics: [
          {
            title: "Understanding Cryptocurrency",
            objective: "Learn what cryptocurrencies are and how they work",
            key_concepts: ["Digital Assets", "Decentralization", "Cryptography", "Mining"],
            resources: [
              {
                title: "What is Cryptocurrency?",
                type: "video",
                url: "https://www.youtube.com/watch?v=1YyAzVmP9xQ",
                description: "Comprehensive introduction to cryptocurrency concepts",
                purpose: "Basic understanding of digital currencies",
                content_tags: ["cryptocurrency", "basics", "introduction"],
                recommended_when: "Starting cryptocurrency section",
                is_optional: false
              }
            ],
            quiz_questions: [
              {
                question: "What makes cryptocurrencies different from traditional currencies?",
                options: [
                  "They only exist digitally",
                  "They are decentralized and not controlled by any central authority",
                  "They use encryption",
                  "All of the above"
                ],
                answer: 3,
                explanation: "Cryptocurrencies combine digital-only existence, decentralization, and encryption technologies."
              }
            ]
          }
        ]
      }
    ],
    final_test_questions: [
      {
        question: "Which of the following best describes blockchain technology?",
        options: [
          "A centralized database managed by banks",
          "A distributed ledger technology that records transactions immutably",
          "A type of cryptocurrency",
          "A computer programming language"
        ],
        answer: 1,
        explanation: "Blockchain is a distributed ledger technology that allows for immutable record-keeping across a network of computers."
      }
    ]
  },
  {
    title: "Technical Analysis Mastery",
    description: "Learn how to analyze cryptocurrency markets using technical analysis tools and indicators.",
    icon: "📊",
    topics: [
      {
        title: "Chart Reading Fundamentals",
        subtopics: [
          {
            title: "Understanding Price Charts",
            objective: "Learn how to read and interpret different types of price charts",
            key_concepts: ["Candlesticks", "Support/Resistance", "Timeframes", "Volume"],
            resources: [
              {
                title: "Mastering Candlestick Charts",
                type: "video",
                url: "https://www.youtube.com/watch?v=QM-NnR6-Y_U",
                description: "Detailed tutorial on reading candlestick charts",
                purpose: "Foundation for technical analysis",
                content_tags: ["charts", "technical analysis", "candlesticks"],
                recommended_when: "Beginning technical analysis",
                is_optional: false
              }
            ],
            quiz_questions: [
              {
                question: "What does a green candlestick indicate?",
                options: [
                  "Price decreased during the period",
                  "Price increased during the period",
                  "No price change",
                  "Market was closed"
                ],
                answer: 1,
                explanation: "A green (or white) candlestick indicates that the closing price was higher than the opening price."
              }
            ]
          }
        ]
      }
    ],
    final_test_questions: [
      {
        question: "Which timeframe is most suitable for day trading?",
        options: [
          "Monthly charts",
          "Weekly charts",
          "1-minute to 1-hour charts",
          "Yearly charts"
        ],
        answer: 2,
        explanation: "Day traders typically use shorter timeframes (1-minute to 1-hour charts) to make trading decisions."
      }
    ]
  },
  {
    title: "DeFi (Decentralized Finance)",
    description: "Explore the world of decentralized finance, from lending protocols to yield farming strategies.",
    icon: "🏦",
    topics: [
      {
        title: "Lending and Borrowing",
        subtopics: [
          {
            title: "DeFi Lending Basics",
            objective: "Understand how decentralized lending protocols work",
            key_concepts: ["Collateralization", "Interest Rates", "Liquidation", "Risk Management"],
            resources: [
              {
                title: "Introduction to DeFi Lending",
                type: "video",
                url: "https://www.youtube.com/watch?v=aTp9er6S73M",
                description: "Comprehensive overview of DeFi lending protocols",
                purpose: "Understanding DeFi lending fundamentals",
                content_tags: ["defi", "lending", "protocols"],
                recommended_when: "Starting DeFi course",
                is_optional: false
              },
              {
                title: "How Aave Works",
                type: "article",
                url: "https://docs.aave.com/faq/",
                description: "Deep dive into one of the leading lending protocols",
                purpose: "Real-world protocol example",
                content_tags: ["aave", "lending", "case study"],
                recommended_when: "After understanding basics",
                is_optional: false
              }
            ],
            quiz_questions: [
              {
                question: "What is collateralization in DeFi lending?",
                options: [
                  "A type of cryptocurrency",
                  "Assets deposited as security for a loan",
                  "A trading strategy",
                  "A type of smart contract"
                ],
                answer: 1,
                explanation: "Collateralization refers to the assets that borrowers must deposit as security to take out a loan in DeFi protocols."
              }
            ]
          }
        ]
      },
      {
        title: "Decentralized Exchanges",
        subtopics: [
          {
            title: "Understanding DEX Mechanics",
            objective: "Learn how decentralized exchanges work and how to use them",
            key_concepts: ["Automated Market Makers", "Liquidity Pools", "Impermanent Loss", "Token Swaps"],
            resources: [
              {
                title: "How Do DEXes Work?",
                type: "video",
                url: "https://www.youtube.com/watch?v=1PbZMudPP5E",
                description: "Detailed explanation of DEX mechanics",
                purpose: "Core understanding of DEX functionality",
                content_tags: ["dex", "amm", "trading"],
                recommended_when: "Starting DEX section",
                is_optional: false
              }
            ],
            quiz_questions: [
              {
                question: "What is impermanent loss in liquidity pools?",
                options: [
                  "A permanent loss of funds",
                  "A temporary price discrepancy",
                  "The potential loss compared to holding assets",
                  "A type of trading fee"
                ],
                answer: 2,
                explanation: "Impermanent loss occurs when the price ratio of pooled assets changes compared to when they were deposited."
              }
            ]
          }
        ]
      }
    ],
    final_test_questions: [
      {
        question: "Which of the following is NOT a key component of DeFi?",
        options: [
          "Smart Contracts",
          "Central Bank Oversight",
          "Automated Market Makers",
          "Liquidity Pools"
        ],
        answer: 1,
        explanation: "DeFi is characterized by its lack of central authority oversight, making central bank oversight not a component of DeFi systems."
      }
    ]
  },
  {
    title: "Advanced Trading Strategies",
    description: "Master sophisticated trading techniques and risk management strategies for cryptocurrency markets.",
    icon: "📈",
    topics: [
      {
        title: "Order Types and Execution",
        subtopics: [
          {
            title: "Advanced Order Types",
            objective: "Master different types of orders and their strategic use",
            key_concepts: ["Limit Orders", "Stop Orders", "OCO Orders", "Trailing Stops"],
            resources: [
              {
                title: "Mastering Order Types",
                type: "video",
                url: "https://www.youtube.com/watch?v=TzABVrE5V0s",
                description: "Comprehensive guide to cryptocurrency order types",
                purpose: "Understanding advanced order execution",
                content_tags: ["trading", "orders", "execution"],
                recommended_when: "Starting advanced trading",
                is_optional: false
              }
            ],
            quiz_questions: [
              {
                question: "What is a trailing stop order?",
                options: [
                  "A fixed stop-loss order",
                  "An order that follows price movement at a set distance",
                  "A market order",
                  "A limit order"
                ],
                answer: 1,
                explanation: "A trailing stop order automatically adjusts the stop price at a fixed distance from market price, allowing for profit protection while letting profits run."
              }
            ]
          }
        ]
      },
      {
        title: "Position Sizing",
        subtopics: [
          {
            title: "Risk Management Through Position Sizing",
            objective: "Learn how to properly size positions to manage risk",
            key_concepts: ["Risk Per Trade", "Portfolio Allocation", "Kelly Criterion", "Risk:Reward Ratios"],
            resources: [
              {
                title: "Position Sizing Strategies",
                type: "article",
                url: "https://www.babypips.com/learn/forex/position-sizing",
                description: "Comprehensive guide to position sizing",
                purpose: "Risk management fundamentals",
                content_tags: ["risk management", "trading", "position sizing"],
                recommended_when: "Before live trading",
                is_optional: false
              }
            ],
            quiz_questions: [
              {
                question: "What is the recommended maximum risk per trade?",
                options: [
                  "1-2% of trading capital",
                  "5-10% of trading capital",
                  "25% of trading capital",
                  "50% of trading capital"
                ],
                answer: 0,
                explanation: "Professional traders typically risk no more than 1-2% of their trading capital on any single trade to ensure longevity."
              }
            ]
          }
        ]
      }
    ],
    final_test_questions: [
      {
        question: "Which risk management principle is most important for long-term trading success?",
        options: [
          "Always using leverage",
          "Consistent position sizing",
          "Trading without stop losses",
          "Using only market orders"
        ],
        answer: 1,
        explanation: "Consistent position sizing is crucial for long-term success as it helps manage risk and protect trading capital."
      }
    ]
  },
  {
    title: "Crypto Security and Best Practices",
    description: "Learn essential security practices to protect your cryptocurrency investments and avoid common threats.",
    icon: "🔒",
    topics: [
      {
        title: "Wallet Security",
        subtopics: [
          {
            title: "Types of Wallets",
            objective: "Understand different wallet types and their security implications",
            key_concepts: ["Hot Wallets", "Cold Storage", "Hardware Wallets", "Seed Phrases"],
            resources: [
              {
                title: "Cryptocurrency Wallet Security Guide",
                type: "article",
                url: "https://www.ledger.com/academy/security/the-safest-way-to-store-crypto",
                description: "Comprehensive guide to wallet security",
                purpose: "Understanding wallet security fundamentals",
                content_tags: ["security", "wallets", "best practices"],
                recommended_when: "Starting security course",
                is_optional: false
              },
              {
                title: "Hardware Wallet Setup Tutorial",
                type: "video",
                url: "https://www.youtube.com/watch?v=GAXc55VXHkE",
                description: "Step-by-step guide to setting up a hardware wallet",
                purpose: "Practical implementation of security measures",
                content_tags: ["hardware wallet", "security", "tutorial"],
                recommended_when: "After understanding basics",
                is_optional: false
              }
            ],
            quiz_questions: [
              {
                question: "Which type of wallet is most secure for long-term storage?",
                options: [
                  "Exchange wallet",
                  "Mobile wallet",
                  "Hardware wallet",
                  "Web wallet"
                ],
                answer: 2,
                explanation: "Hardware wallets provide the highest level of security by keeping private keys offline and protected from malware."
              }
            ]
          }
        ]
      },
      {
        title: "Exchange Security",
        subtopics: [
          {
            title: "Securing Exchange Accounts",
            objective: "Learn best practices for securing cryptocurrency exchange accounts",
            key_concepts: ["2FA", "API Security", "Withdrawal Whitelisting", "Security Audits"],
            resources: [
              {
                title: "Exchange Security Best Practices",
                type: "article",
                url: "https://www.binance.com/en/blog/all/how-to-secure-your-binance-account-7-tips-421499824684901157",
                description: "Comprehensive guide to exchange account security",
                purpose: "Protecting exchange accounts",
                content_tags: ["exchange", "security", "2FA"],
                recommended_when: "Before trading on exchanges",
                is_optional: false
              }
            ],
            quiz_questions: [
              {
                question: "What is the most secure form of 2FA?",
                options: [
                  "SMS-based 2FA",
                  "Email-based 2FA",
                  "Hardware security key",
                  "Recovery phrases"
                ],
                answer: 2,
                explanation: "Hardware security keys provide the strongest form of 2FA as they cannot be intercepted or phished like SMS or email codes."
              }
            ]
          }
        ]
      }
    ],
    final_test_questions: [
      {
        question: "What is the most important aspect of cryptocurrency security?",
        options: [
          "Using multiple exchanges",
          "Keeping private keys secure and backed up",
          "Trading frequently",
          "Sharing wallet addresses publicly"
        ],
        answer: 1,
        explanation: "The security of private keys is paramount as they provide direct access to funds and cannot be recovered if lost."
      }
    ]
  },
  {
    title: "NFT Trading and Investment",
    description: "Master the art of NFT trading, from understanding valuations to building a profitable portfolio.",
    icon: "🎨",
    topics: [
      {
        title: "NFT Fundamentals",
        subtopics: [
          {
            title: "Understanding NFT Technology",
            objective: "Learn the technical foundations of NFTs and their use cases",
            key_concepts: ["Token Standards", "Metadata", "Smart Contracts", "Minting"],
            resources: [
              {
                title: "NFT Technical Guide",
                type: "article",
                url: "https://ethereum.org/en/nft/",
                description: "Comprehensive overview of NFT technology",
                purpose: "Technical understanding of NFTs",
                content_tags: ["nft", "technical", "blockchain"],
                recommended_when: "Starting NFT course",
                is_optional: false
              },
              {
                title: "NFT Minting Process",
                type: "video",
                url: "https://www.youtube.com/watch?v=J4p1sdo3Rz4",
                description: "Step-by-step guide to minting NFTs",
                purpose: "Understanding NFT creation",
                content_tags: ["nft", "minting", "creation"],
                recommended_when: "After understanding basics",
                is_optional: false
              }
            ],
            quiz_questions: [
              {
                question: "What makes an NFT unique?",
                options: [
                  "Its price",
                  "Its blockchain address",
                  "Its token ID and smart contract address",
                  "Its file size"
                ],
                answer: 2,
                explanation: "Each NFT is uniquely identified by its token ID and the smart contract address that created it."
              }
            ]
          }
        ]
      },
      {
        title: "NFT Valuation",
        subtopics: [
          {
            title: "Valuation Metrics",
            objective: "Learn how to assess the value of NFT projects and individual pieces",
            key_concepts: ["Rarity", "Utility", "Community", "Artist Recognition"],
            resources: [
              {
                title: "NFT Valuation Guide",
                type: "article",
                url: "https://www.nftvaluations.com/blog/how-to-value-nfts",
                description: "Comprehensive guide to NFT valuation",
                purpose: "Understanding NFT value drivers",
                content_tags: ["nft", "valuation", "investment"],
                recommended_when: "Before trading NFTs",
                is_optional: false
              }
            ],
            quiz_questions: [
              {
                question: "Which factor is most important in NFT valuation?",
                options: [
                  "File size",
                  "Creation date",
                  "Rarity and utility",
                  "Storage location"
                ],
                answer: 2,
                explanation: "The combination of rarity (scarcity) and utility (usefulness) are key drivers of NFT value."
              }
            ]
          }
        ]
      }
    ],
    final_test_questions: [
      {
        question: "What is the most important consideration when investing in NFTs?",
        options: [
          "The current price",
          "The project's utility, community, and long-term vision",
          "The file format",
          "The marketplace it's listed on"
        ],
        answer: 1,
        explanation: "Successful NFT investment requires evaluating the project's utility, community strength, and long-term sustainability."
      }
    ]
  }
];

async function createCourses() {
  try {
    // Login first
    await login();

    // Create Cryptocurrency Fundamentals lesson
    console.log('Creating Cryptocurrency Fundamentals lesson...');
    const lessonData = {
      title: 'Cryptocurrency Fundamentals',
      description: 'Learn the basics of cryptocurrency, blockchain technology, and how to get started with crypto trading.',
      level: 'beginner',
      language: 'en',
      icon: 'bitcoin',
      is_active: true
    };
    const lesson = await createLesson(lessonData);
    console.log('Lesson created:', lesson);

    // Create topics and subtopics
    const topics = [
      {
        title: 'Introduction to Cryptocurrency',
        description: 'Understanding the basics of cryptocurrency and blockchain technology',
        order: 0,
        lesson_id: lesson.id
      },
      {
        title: 'Getting Started with Crypto Trading',
        description: 'Learn how to start trading cryptocurrencies safely and effectively',
        order: 1,
        lesson_id: lesson.id
      }
    ];

    for (const topicData of topics) {
      console.log(`Creating topic: ${topicData.title}`);
      const topic = await createTopic(topicData);
      console.log('Topic created:', topic);

      // Create subtopics for each topic
      const subtopics = [
        {
          title: 'What is Cryptocurrency?',
          content: 'Learn about the history and basic concepts of cryptocurrency',
          order: 0,
          topic_id: topic.id
        },
        {
          title: 'How Blockchain Works',
          content: 'Understand the technology behind cryptocurrencies',
          order: 1,
          topic_id: topic.id
        }
      ];

      for (const subtopicData of subtopics) {
        console.log(`Creating subtopic: ${subtopicData.title}`);
        const subtopic = await createSubtopic(subtopicData);
        console.log('Subtopic created:', subtopic);

        // Create resources for each subtopic
        const resourceData = {
          title: 'Introduction Video',
          type: 'video',
          url: 'https://example.com/video',
          subtopic_id: subtopic.id
        };
        console.log('Creating resource for subtopic');
        const resource = await createResource(resourceData);
        console.log('Resource created:', resource);

        // Create quiz questions for each subtopic
        const questionData = {
          question: 'What is the main purpose of blockchain technology?',
          options: ['To create digital currencies', 'To provide secure and transparent record-keeping', 'To replace traditional banking', 'To enable anonymous transactions'],
          answer: 1, // Index of the correct answer (0-based)
          explanation: 'Blockchain technology was designed to create a secure, transparent, and decentralized way of recording transactions and data.',
          subtopic_id: subtopic.id
        };
        console.log('Creating quiz question');
        const question = await createQuizQuestion(questionData);
        console.log('Quiz question created:', question);
      }
    }

    console.log('All courses created successfully!');
  } catch (error) {
    console.error('Error creating courses:', error);
    process.exit(1);
  }
}

async function createFinalTestQuestion(lessonId, questionData) {
  const data = {
    lesson_id: lessonId,
    question: questionData.question,
    options: questionData.options,
    answer: questionData.answer,
    explanation: questionData.explanation
  };

  const response = await fetchAPI('/api/admin/final-test-questions', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  console.log(`Created final test question for lesson ${lessonId}`);
  return response;
}

// Run the script
async function main() {
  try {
    console.log('Starting course creation process...');
    
    // Get all lessons
    const response = await fetchAPI('/api/admin/lessons');
    const lessons = await response.json();
    
    // Delete each lesson (this will cascade delete related data)
    for (const lesson of lessons) {
      await fetchAPI(`/api/admin/lessons/${lesson.id}`, {
        method: 'DELETE'
      });
      console.log(`Deleted lesson: ${lesson.title}`);
    }
    
    console.log('Database cleared successfully');
    await createCourses();
    console.log('Courses created successfully');
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 
 
 
 
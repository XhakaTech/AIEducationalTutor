// This is a simplified script for creating test data by using the API directly

async function fetchAPI(endpoint, method = 'GET', data = null) {
  console.log(`${method} ${endpoint}${data ? ' with data' : ''}`);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer admin123' // Simple admin token
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    // Use localhost with the right port
    const response = await fetch(`http://localhost:5000/api${endpoint}`, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error calling API ${endpoint}:`, error.message);
    throw error;
  }
}

async function getExistingLessons() {
  try {
    const lessons = await fetchAPI('/admin/lessons');
    return lessons;
  } catch (error) {
    console.error('Error fetching lessons:', error.message);
    return [];
  }
}

async function deleteLesson(id) {
  try {
    await fetchAPI(`/admin/lessons/${id}`, 'DELETE');
    console.log(`Deleted lesson ID: ${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting lesson ${id}:`, error.message);
    return false;
  }
}

async function createLesson(lessonData) {
  try {
    const lesson = await fetchAPI('/admin/lessons', 'POST', { lesson: lessonData });
    console.log(`Created lesson: ${lesson.title} (ID: ${lesson.id})`);
    return lesson;
  } catch (error) {
    console.error('Error creating lesson:', error.message);
    return null;
  }
}

async function createTopic(topicData) {
  try {
    const topic = await fetchAPI('/admin/topics', 'POST', { topic: topicData });
    console.log(`  Created topic: ${topic.title} (ID: ${topic.id})`);
    return topic;
  } catch (error) {
    console.error('Error creating topic:', error.message);
    return null;
  }
}

async function createSubtopic(subtopicData) {
  try {
    const subtopic = await fetchAPI('/admin/subtopics', 'POST', { subtopic: subtopicData });
    console.log(`    Created subtopic: ${subtopic.title} (ID: ${subtopic.id})`);
    return subtopic;
  } catch (error) {
    console.error('Error creating subtopic:', error.message);
    return null;
  }
}

async function createResource(resourceData) {
  try {
    const resource = await fetchAPI('/admin/resources', 'POST', { resource: resourceData });
    console.log(`      Created resource: ${resource.title} (ID: ${resource.id})`);
    return resource;
  } catch (error) {
    console.error('Error creating resource:', error.message);
    return null;
  }
}

async function createQuizQuestion(questionData) {
  try {
    const question = await fetchAPI('/admin/quiz-questions', 'POST', { question: questionData });
    console.log(`      Created quiz question ID: ${question.id}`);
    return question;
  } catch (error) {
    console.error('Error creating quiz question:', error.message);
    return null;
  }
}

async function createFinalTestQuestion(questionData) {
  try {
    const question = await fetchAPI('/admin/final-test-questions', 'POST', { question: questionData });
    console.log(`  Created final test question ID: ${question.id}`);
    return question;
  } catch (error) {
    console.error('Error creating final test question:', error.message);
    return null;
  }
}

async function clearDatabase() {
  console.log("Clearing all existing data...");
  
  try {
    // Get all lessons first
    const lessons = await getExistingLessons();
    
    if (lessons.length === 0) {
      console.log("No existing lessons to delete.");
      return;
    }
    
    // Delete each lesson (this should cascade to related entities if set up properly)
    for (const lesson of lessons) {
      await deleteLesson(lesson.id);
    }
    
    console.log("All data deleted successfully");
  } catch (error) {
    console.error("Error clearing database:", error);
    process.exit(1);
  }
}

async function createTestData() {
  console.log("Creating test lessons...");
  
  const testLessons = [
    {
      title: "Introduction to Bitcoin",
      description: "Learn the fundamentals of Bitcoin, blockchain, and how cryptocurrency works",
      level: "beginner",
      language: "en",
      icon: "₿",
      is_active: true
    },
    {
      title: "Blockchain Technology Fundamentals",
      description: "Understand the core concepts behind blockchain technology and its applications",
      level: "beginner",
      language: "en",
      icon: "🔗",
      is_active: true
    },
    {
      title: "Cryptocurrency Trading Basics",
      description: "Learn the essentials of trading cryptocurrency, including market analysis and strategies",
      level: "intermediate",
      language: "en",
      icon: "📈",
      is_active: true
    },
    {
      title: "Smart Contracts and DApps",
      description: "Explore smart contracts and decentralized applications on blockchain platforms",
      level: "intermediate",
      language: "en",
      icon: "📝",
      is_active: true
    },
    {
      title: "Ethereum Development",
      description: "Learn to build on the Ethereum blockchain with Solidity and Web3",
      level: "advanced",
      language: "en",
      icon: "Ξ",
      is_active: true
    },
    {
      title: "Cryptocurrency Security Best Practices",
      description: "Protect your digital assets with security best practices and tools",
      level: "intermediate",
      language: "en",
      icon: "🔒",
      is_active: true
    },
    {
      title: "DeFi: Decentralized Finance",
      description: "Understand decentralized finance protocols, platforms, and opportunities",
      level: "advanced",
      language: "en",
      icon: "💰",
      is_active: true
    },
    {
      title: "NFTs and Digital Ownership",
      description: "Explore non-fungible tokens, digital art, and blockchain-based ownership",
      level: "intermediate",
      language: "en",
      icon: "🖼️",
      is_active: true
    }
  ];
  
  try {
    // Insert lessons
    for (const lessonData of testLessons) {
      const lesson = await createLesson(lessonData);
      if (!lesson) continue;
      
      // Create 3-5 topics per lesson
      const topicCount = Math.floor(Math.random() * 3) + 3; // 3-5 topics
      
      for (let i = 1; i <= topicCount; i++) {
        const topic = await createTopic({
          lesson_id: lesson.id,
          title: `Topic ${i}: ${getTopicTitle(lesson.title, i)}`,
          order: i
        });
        
        if (!topic) continue;
        
        // Create 2-4 subtopics per topic
        const subtopicCount = Math.floor(Math.random() * 3) + 2; // 2-4 subtopics
        
        for (let j = 1; j <= subtopicCount; j++) {
          const subtopic = await createSubtopic({
            topic_id: topic.id,
            title: `Subtopic ${j}: ${getSubtopicTitle(topic.title, j)}`,
            objective: `Learn about ${getSubtopicTitle(topic.title, j)} and how it applies to ${lesson.title}`,
            key_concepts: generateKeyConcepts(),
            order: j
          });
          
          if (!subtopic) continue;
          
          // Create 2-4 resources per subtopic
          const resourceCount = Math.floor(Math.random() * 3) + 2; // 2-4 resources
          
          for (let k = 1; k <= resourceCount; k++) {
            const resourceType = getRandomResourceType();
            await createResource({
              subtopic_id: subtopic.id,
              type: resourceType,
              url: generateResourceUrl(resourceType, k),
              title: `Resource ${k}: ${getResourceTitle(resourceType)}`,
              description: `A ${resourceType} resource about ${subtopic.title}`,
              purpose: `To help understand ${getSubtopicTitle(topic.title, j)}`,
              content_tags: generateContentTags(lesson.title, topic.title),
              recommended_when: k === 1 ? "before starting" : "after completing previous resources",
              is_optional: k > 2 // First two resources are required
            });
          }
          
          // Create 3 quiz questions per subtopic
          for (let q = 1; q <= 3; q++) {
            await createQuizQuestion({
              subtopic_id: subtopic.id,
              question: generateQuizQuestion(subtopic.title, q),
              options: generateQuizOptions(),
              answer: Math.floor(Math.random() * 4), // Random correct answer index (0-3)
              explanation: `This is the explanation for quiz question ${q} about ${subtopic.title}`
            });
          }
        }
      }
      
      // Create 5 final test questions per lesson
      for (let ft = 1; ft <= 5; ft++) {
        await createFinalTestQuestion({
          lesson_id: lesson.id,
          question: `Final test question ${ft} for ${lesson.title}?`,
          options: generateQuizOptions(),
          answer: Math.floor(Math.random() * 4), // Random correct answer index (0-3)
          explanation: `This is the explanation for final test question ${ft} about ${lesson.title}`
        });
      }
    }
    
    console.log("Test data creation completed successfully!");
  } catch (error) {
    console.error("Error creating test data:", error);
    process.exit(1);
  }
}

function getTopicTitle(lessonTitle, index) {
  const topics = {
    "Introduction to Bitcoin": [
      "History of Bitcoin",
      "Blockchain Basics",
      "Bitcoin Wallets",
      "Mining and Consensus",
      "Bitcoin Economics"
    ],
    "Blockchain Technology Fundamentals": [
      "Distributed Ledger Technology",
      "Consensus Mechanisms",
      "Cryptographic Fundamentals",
      "Types of Blockchains",
      "Use Cases and Applications"
    ],
    "Cryptocurrency Trading Basics": [
      "Exchanges and Markets",
      "Trading Pairs and Order Types",
      "Technical Analysis",
      "Fundamental Analysis",
      "Risk Management"
    ],
    "Smart Contracts and DApps": [
      "Smart Contract Fundamentals",
      "Ethereum Virtual Machine",
      "DApp Architecture",
      "Web3 Integration",
      "Testing and Security"
    ],
    "Ethereum Development": [
      "Solidity Programming",
      "Smart Contract Development",
      "Testing and Deployment",
      "Gas Optimization",
      "Security Best Practices"
    ],
    "Cryptocurrency Security Best Practices": [
      "Wallet Security",
      "Private Key Management",
      "Exchange Security",
      "Common Scams and Threats",
      "Cold Storage Solutions"
    ],
    "DeFi: Decentralized Finance": [
      "Lending and Borrowing Protocols",
      "Decentralized Exchanges",
      "Yield Farming",
      "Stablecoins",
      "DeFi Risks and Challenges"
    ],
    "NFTs and Digital Ownership": [
      "NFT Fundamentals",
      "Creating and Minting NFTs",
      "NFT Marketplaces",
      "Digital Art and Collectibles",
      "Future of Digital Ownership"
    ]
  };
  
  const defaultTopics = [
    "Introduction and Overview",
    "Key Concepts",
    "Practical Applications",
    "Advanced Topics",
    "Future Developments"
  ];
  
  const topicList = topics[lessonTitle] || defaultTopics;
  return topicList[index - 1] || `Topic ${index}`;
}

function getSubtopicTitle(topicTitle, index) {
  // Extract the main title after the colon
  const mainTopicTitle = topicTitle.includes(": ") ? topicTitle.split(": ")[1] : topicTitle;
  
  const subtopics = {
    "History of Bitcoin": [
      "Satoshi Nakamoto and the Genesis Block",
      "Early Development and Community",
      "Major Milestones and Events",
      "Evolution of Bitcoin Over Time"
    ],
    "Blockchain Basics": [
      "What is a Blockchain?",
      "Blocks, Transactions, and Hashes",
      "Decentralization Explained",
      "Immutability and Transparency"
    ],
    "Bitcoin Wallets": [
      "Types of Wallets",
      "Creating and Securing a Wallet",
      "Public and Private Keys",
      "Transactions and Confirmations"
    ],
    "Distributed Ledger Technology": [
      "Centralized vs. Distributed Systems",
      "How Distributed Ledgers Work",
      "Benefits of Distribution",
      "Challenges and Limitations"
    ],
    "Trading Pairs and Order Types": [
      "Understanding Trading Pairs",
      "Market Orders vs. Limit Orders",
      "Stop Orders and OCO",
      "Order Books and Depth Charts"
    ]
  };
  
  const defaultSubtopics = [
    "Understanding the Fundamentals",
    "Key Components and Mechanics",
    "Practical Implementation",
    "Case Studies and Examples"
  ];
  
  const subtopicList = subtopics[mainTopicTitle] || defaultSubtopics;
  return subtopicList[index - 1] || `Subtopic for ${mainTopicTitle} ${index}`;
}

function generateKeyConcepts() {
  const allConcepts = [
    "Blockchain", "Decentralization", "Consensus", "Cryptography", 
    "Mining", "Hash Functions", "Public Key", "Private Key", 
    "Digital Signature", "Merkle Tree", "Smart Contract", "Gas", 
    "Token", "Wallet", "Node", "Fork", "Block Height", "Timestamp",
    "Difficulty", "Nonce", "Transaction Fee", "UTXO", "Address",
    "Proof of Work", "Proof of Stake", "DApp", "Web3", "Oracle"
  ];
  
  const count = Math.floor(Math.random() * 5) + 3; // 3-7 concepts
  const concepts = [];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * allConcepts.length);
    if (!concepts.includes(allConcepts[randomIndex])) {
      concepts.push(allConcepts[randomIndex]);
    }
  }
  
  return concepts;
}

function getRandomResourceType() {
  const types = ["article", "video", "tutorial", "image", "document", "interactive"];
  return types[Math.floor(Math.random() * types.length)];
}

function generateResourceUrl(type, index) {
  switch (type) {
    case "article":
      return `https://example.com/articles/crypto-article-${index}`;
    case "video":
      return `https://example.com/videos/crypto-video-${index}`;
    case "tutorial":
      return `https://example.com/tutorials/crypto-tutorial-${index}`;
    case "image":
      return `https://example.com/images/crypto-image-${index}.png`;
    case "document":
      return `https://example.com/documents/crypto-doc-${index}.pdf`;
    case "interactive":
      return `https://example.com/interactive/crypto-demo-${index}`;
    default:
      return `https://example.com/resources/resource-${index}`;
  }
}

function getResourceTitle(type) {
  switch (type) {
    case "article":
      return "Comprehensive Article";
    case "video":
      return "Video Explanation";
    case "tutorial":
      return "Step-by-step Tutorial";
    case "image":
      return "Infographic";
    case "document":
      return "Research Paper";
    case "interactive":
      return "Interactive Demo";
    default:
      return "Resource";
  }
}

function generateContentTags(lesson, topic) {
  // Extract main topic title without the numbering
  const mainTopic = topic.includes(": ") ? topic.split(": ")[1] : topic;
  
  // Base tags on lesson and topic
  const tags = [
    lesson.toLowerCase().replace(/\s+/g, '-').substring(0, 20),
    mainTopic.toLowerCase().replace(/\s+/g, '-').substring(0, 20)
  ];
  
  // Add some random tags
  const possibleTags = [
    "beginner", "intermediate", "advanced",
    "tutorial", "explanation", "deep-dive",
    "practical", "theoretical", "case-study"
  ];
  
  const randomTag = possibleTags[Math.floor(Math.random() * possibleTags.length)];
  if (!tags.includes(randomTag)) {
    tags.push(randomTag);
  }
  
  return tags;
}

function generateQuizQuestion(subtopicTitle, index) {
  // Extract the main subtopic title
  const mainSubtopic = subtopicTitle.includes(": ") ? subtopicTitle.split(": ")[1] : subtopicTitle;
  
  return `Question ${index}: What is the most important aspect of ${mainSubtopic}?`;
}

function generateQuizOptions() {
  return [
    "First possible answer option",
    "Second possible answer option",
    "Third possible answer option",
    "Fourth possible answer option"
  ];
}

async function main() {
  try {
    console.log("Starting database operations...");
    
    // Check existing lessons first
    const existingLessons = await getExistingLessons();
    console.log(`Found ${existingLessons.length} existing lessons:`);
    existingLessons.forEach(lesson => {
      console.log(`- ${lesson.id}: ${lesson.title}`);
    });
    
    // Ask for confirmation before proceeding
    console.log("\nWARNING: This will delete ALL existing data and create new test data.");
    console.log("Proceeding automatically...");
    
    await clearDatabase();
    await createTestData();
    
    console.log("All operations completed successfully!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Check if server is running
try {
  console.log('Checking if server is running...');
  fetch('http://localhost:5000/api/health')
    .then(response => {
      if (response.ok) {
        console.log('Server is running. Starting data creation...');
        main();
      } else {
        console.error('Server seems to be running but returned an error. Make sure it\'s working properly.');
      }
    })
    .catch(error => {
      console.error('Server doesn\'t appear to be running. Please start the server first:', error.message);
    });
} catch (error) {
  console.error('Error checking server status:', error);
} 
 
 
 
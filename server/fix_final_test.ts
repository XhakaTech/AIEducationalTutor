import { db } from './db';
import { finalTestQuestions } from '@shared/schema';

// Function to add final test questions to the database
async function addFinalTestQuestions() {
  console.log('Inserting final test questions...');
  
  const questions = [
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

  try {
    // Get the lesson ID
    const result = await db.query.lessons.findFirst();
    if (!result) {
      console.error('No lesson found in the database');
      return;
    }
    
    const lessonId = result.id;
    console.log(`Found lesson with ID: ${lessonId}`);
    
    // Insert questions for this lesson
    for (const question of questions) {
      await db.insert(finalTestQuestions).values({
        lesson_id: lessonId,
        question: question.question,
        options: question.options,
        answer: question.answer,
        explanation: question.explanation
      });
    }
    
    console.log('Successfully inserted final test questions');
  } catch (error) {
    console.error('Error inserting final test questions:', error);
  }
}

// Run the function
addFinalTestQuestions().catch(console.error);
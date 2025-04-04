import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function checkDatabase() {
  console.log('Checking database contents...\n');
  
  // Check lessons
  const lessons = await db.query.lessons.findMany();
  console.log('Lessons:', lessons.length);
  lessons.forEach(lesson => {
    console.log(`- ${lesson.id}: ${lesson.title} (${lesson.level})`);
  });
  
  // Check topics
  const topics = await db.query.topics.findMany();
  console.log('\nTopics:', topics.length);
  topics.forEach(topic => {
    console.log(`- ${topic.id}: ${topic.title} (Lesson ${topic.lesson_id})`);
  });
  
  // Check subtopics
  const subtopics = await db.query.subtopics.findMany();
  console.log('\nSubtopics:', subtopics.length);
  subtopics.forEach(subtopic => {
    console.log(`- ${subtopic.id}: ${subtopic.title} (Topic ${subtopic.topic_id})`);
  });
  
  // Check resources
  const resources = await db.query.resources.findMany();
  console.log('\nResources:', resources.length);
  
  // Check quiz questions
  const quizQuestions = await db.query.quizQuestions.findMany();
  console.log('\nQuiz Questions:', quizQuestions.length);
  
  await client.end();
}

checkDatabase().catch(console.error); 
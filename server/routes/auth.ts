import { Router } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
    
    if (!user.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user[0].id,
        username: user[0].username,
        name: user[0].name,
        email: user[0].email
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email } = req.body;

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingUser.length) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db.insert(users).values({
      username,
      password: hashedPassword,
      name,
      email
    }).returning();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser[0].id,
        username: newUser[0].username,
        name: newUser[0].name,
        email: newUser[0].email
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

// Verify token middleware
export const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default router; 
 
 
 
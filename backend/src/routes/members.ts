import { Hono } from 'hono';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { desc } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

type Variables = {
  userId: string;
};

export const membersRouter = new Hono<{ Variables: Variables }>();

// Auth Middleware
membersRouter.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey') as { userId: string };
    c.set('userId', decoded.userId);
    await next();
  } catch (e) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
});

membersRouter.get('/', async (c) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt));
    
    return c.json({ members: allUsers });
  } catch (error) {
    console.error('Fetch members error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

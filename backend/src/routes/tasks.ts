import { Hono } from 'hono';
import { db } from '../db/index.js';
import { tasksPages, tasksPageItems, tasksPageComments } from '../db/schema.js';
import { eq, asc } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

type Variables = {
  userId: string;
};

export const tasksRouter = new Hono<{ Variables: Variables }>();

// Auth Middleware
tasksRouter.use('*', async (c, next) => {
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

tasksRouter.get('/', async (c) => {
  try {
    const userId = c.get('userId');
    
    // Find existing page
    let page = await db.select().from(tasksPages).where(eq(tasksPages.userId, userId)).limit(1);
    
    // If not found, create one
    if (page.length === 0) {
      page = await db.insert(tasksPages).values({ userId, title: '' }).returning();
    }
    
    const pageId = page[0].id;
    
    // Get tasks items and comments
    const items = await db.select().from(tasksPageItems).where(eq(tasksPageItems.pageId, pageId)).orderBy(asc(tasksPageItems.order));
    const comments = await db.select().from(tasksPageComments).where(eq(tasksPageComments.pageId, pageId)).orderBy(asc(tasksPageComments.createdAt));
    
    return c.json({
      page: page[0],
      items,
      comments: comments.map(c => c.content) // simplified comments for the UI
    });
  } catch (error) {
    console.error('Fetch tasks page error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

tasksRouter.post('/sync', async (c) => {
  try {
    const userId = c.get('userId');
    const { title, icon, cover, items, comments } = await c.req.json();
    
    let page = await db.select().from(tasksPages).where(eq(tasksPages.userId, userId)).limit(1);
    
    if (page.length === 0) {
      page = await db.insert(tasksPages).values({ userId, title, icon, cover }).returning();
    } else {
      page = await db.update(tasksPages)
        .set({ title, icon, cover, updatedAt: new Date() })
        .where(eq(tasksPages.userId, userId))
        .returning();
    }
    
    const pageId = page[0].id;
    
    // Sync items - simplest way is to delete all and insert new ones
    // A better approach for production would be updating, but this works well for a Notion-like sync
    await db.delete(tasksPageItems).where(eq(tasksPageItems.pageId, pageId));
    
    if (items && items.length > 0) {
      const newItems = items.map((item: any, index: number) => ({
        pageId,
        text: item.text,
        completed: item.completed,
        order: index
      }));
      await db.insert(tasksPageItems).values(newItems);
    }
    
    // Sync comments
    await db.delete(tasksPageComments).where(eq(tasksPageComments.pageId, pageId));
    
    if (comments && comments.length > 0) {
      const newComments = comments.map((comment: string) => ({
        pageId,
        userId,
        content: comment
      }));
      await db.insert(tasksPageComments).values(newComments);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Sync tasks page error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

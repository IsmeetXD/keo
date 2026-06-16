import { Hono } from 'hono';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const authRouter = new Hono();

authRouter.post('/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return c.json({ error: 'Name, email, and password are required' }, 400);
    }

    // Check if user exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    if (existingUsers.length > 0) {
      return c.json({ error: 'User already exists' }, 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await db.insert(users).values({
      name,
      email,
      passwordHash,
    }).returning();

    const user = newUser[0];

    // Create JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '7d' }
    );

    return c.json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

authRouter.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    if (existingUsers.length === 0) {
      return c.json({ error: 'Invalid email or password' }, 400);
    }

    const user = existingUsers[0];
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return c.json({ error: 'Invalid email or password' }, 400);
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '7d' }
    );

    return c.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error during login' }, 500);
  }
});

authRouter.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey') as { userId: string };
    
    const existingUsers = await db.select().from(users).where(eq(users.id, decoded.userId));
    if (existingUsers.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    const user = existingUsers[0];
    
    return c.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Fetch me error:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
});

authRouter.put('/password', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey') as { userId: string };

    const body = await c.req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Current and new password are required' }, 400);
    }

    const existingUsers = await db.select().from(users).where(eq(users.id, decoded.userId));
    if (existingUsers.length === 0) return c.json({ error: 'User not found' }, 404);
    
    const user = existingUsers[0];
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) return c.json({ error: 'Invalid current password' }, 400);

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, user.id));

    return c.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

authRouter.put('/profile', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey') as { userId: string };

    const body = await c.req.json();
    const { name, email } = body;

    if (!name || !email) {
      return c.json({ error: 'Name and email are required' }, 400);
    }

    const updated = await db.update(users).set({ name, email }).where(eq(users.id, decoded.userId)).returning();
    if (updated.length === 0) return c.json({ error: 'User not found' }, 404);

    return c.json({ message: 'Profile updated successfully', user: updated[0] });
  } catch (error) {
    console.error('Profile update error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

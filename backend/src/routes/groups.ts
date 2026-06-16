import { Hono } from 'hono';
import { db } from '../db/index.js';
import { groups, groupMembers, groupMessages, workspaces, users } from '../db/schema.js';
import { desc, eq, asc, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

type Variables = {
  userId: string;
};

export const groupsRouter = new Hono<{ Variables: Variables }>();

// Auth Middleware
groupsRouter.use('*', async (c, next) => {
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

// GET all groups
groupsRouter.get('/', async (c) => {
  try {
    const userId = c.get('userId');
    const allGroups = await db.select().from(groups).orderBy(desc(groups.createdAt));
    
    // Check membership for current user
    const memberships = await db.select().from(groupMembers).where(eq(groupMembers.userId, userId));
    const memberGroupIds = new Set(memberships.map(m => m.groupId));

    const formatted = allGroups.map(g => ({
      id: g.id,
      name: g.name,
      description: g.description,
      creatorId: g.creatorId,
      createdAt: g.createdAt,
      isMember: memberGroupIds.has(g.id)
    }));
    
    return c.json({ groups: formatted });
  } catch (error) {
    console.error('Fetch groups error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST create group
groupsRouter.post('/', async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { name, description } = body;

    if (!name) {
      return c.json({ error: 'Name is required' }, 400);
    }
    
    // Get default workspace
    let workspaceList = await db.select().from(workspaces).limit(1);
    let defaultWorkspaceId;
    
    if (workspaceList.length === 0) {
      const newWs = await db.insert(workspaces).values({
        name: 'Default Workspace',
        slug: 'default-workspace',
      }).returning();
      defaultWorkspaceId = newWs[0].id;
    } else {
      defaultWorkspaceId = workspaceList[0].id;
    }

    // Create group
    const newGroup = await db.insert(groups).values({
      name,
      description: description || '',
      workspaceId: defaultWorkspaceId,
      creatorId: userId
    }).returning();

    // Add creator as member and admin
    await db.insert(groupMembers).values({
      groupId: newGroup[0].id,
      userId,
      role: 'admin'
    });

    return c.json({
      group: {
        ...newGroup[0],
        isMember: true
      }
    });
  } catch (error) {
    console.error('Create group error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET single group
groupsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.get('userId');
    
    const groupResult = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
    if (groupResult.length === 0) {
      return c.json({ error: 'Group not found' }, 404);
    }

    const membership = await db.select().from(groupMembers).where(
      and(eq(groupMembers.groupId, id), eq(groupMembers.userId, userId))
    ).limit(1);

    return c.json({
      group: groupResult[0],
      isMember: membership.length > 0,
      role: membership.length > 0 ? membership[0].role : null
    });
  } catch (error) {
    console.error('Get group error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT update group
groupsRouter.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.get('userId');
    const body = await c.req.json();
    const { name, description } = body;
    
    if (!name) {
      return c.json({ error: 'Name is required' }, 400);
    }
    
    // Check if group exists and get creator
    const groupResult = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
    if (groupResult.length === 0) {
      return c.json({ error: 'Group not found' }, 404);
    }
    
    // Check if user is the creator (admin)
    if (groupResult[0].creatorId !== userId) {
      return c.json({ error: 'Forbidden. Only the group creator can edit this group.' }, 403);
    }

    const updatedGroup = await db.update(groups)
      .set({ name, description, updatedAt: new Date() })
      .where(eq(groups.id, id))
      .returning();
      
    return c.json({ group: updatedGroup[0] });
  } catch (error) {
    console.error('Update group error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE single group
groupsRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.get('userId');
    
    // Check if group exists and get creator
    const groupResult = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
    if (groupResult.length === 0) {
      return c.json({ error: 'Group not found' }, 404);
    }
    
    // Check if user is the creator (admin)
    if (groupResult[0].creatorId !== userId) {
      return c.json({ error: 'Forbidden. Only the group creator can delete this group.' }, 403);
    }

    // Delete the group (cascade will handle members and messages based on schema)
    await db.delete(groups).where(eq(groups.id, id));
    
    return c.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST join group
groupsRouter.post('/:id/join', async (c) => {
  try {
    const groupId = c.req.param('id');
    const userId = c.get('userId');
    
    const groupResult = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
    if (groupResult.length === 0) {
      return c.json({ error: 'Group not found' }, 404);
    }

    const existingMembership = await db.select().from(groupMembers).where(
      and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))
    ).limit(1);

    if (existingMembership.length > 0) {
      return c.json({ message: 'Already a member' });
    }

    await db.insert(groupMembers).values({
      groupId,
      userId,
      role: 'member'
    });

    return c.json({ message: 'Joined successfully' });
  } catch (error) {
    console.error('Join group error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET group messages
groupsRouter.get('/:id/messages', async (c) => {
  try {
    const groupId = c.req.param('id');
    const userId = c.get('userId');

    // Check membership
    const membership = await db.select().from(groupMembers).where(
      and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))
    ).limit(1);

    if (membership.length === 0) {
      return c.json({ error: 'Forbidden. You must join the group first.' }, 403);
    }

    // Fetch messages with user details
    const messages = await db.select({
      id: groupMessages.id,
      content: groupMessages.content,
      createdAt: groupMessages.createdAt,
      userId: users.id,
      userName: users.name,
      userAvatar: users.avatarUrl
    })
    .from(groupMessages)
    .innerJoin(users, eq(groupMessages.userId, users.id))
    .where(eq(groupMessages.groupId, groupId))
    .orderBy(asc(groupMessages.createdAt));

    return c.json({ messages });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST send message
groupsRouter.post('/:id/messages', async (c) => {
  try {
    const groupId = c.req.param('id');
    const userId = c.get('userId');
    const { content } = await c.req.json();

    if (!content || content.trim() === '') {
      return c.json({ error: 'Message content is required' }, 400);
    }

    // Check membership
    const membership = await db.select().from(groupMembers).where(
      and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))
    ).limit(1);

    if (membership.length === 0) {
      return c.json({ error: 'Forbidden. You must join the group first.' }, 403);
    }

    const newMessage = await db.insert(groupMessages).values({
      groupId,
      userId,
      content: content.trim()
    }).returning();

    // Fetch user details for the response
    const sender = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    return c.json({
      message: {
        id: newMessage[0].id,
        content: newMessage[0].content,
        createdAt: newMessage[0].createdAt,
        userId: sender[0].id,
        userName: sender[0].name,
        userAvatar: sender[0].avatarUrl
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET group members
groupsRouter.get('/:id/members', async (c) => {
  try {
    const groupId = c.req.param('id');
    const userId = c.get('userId');

    // Check if requester is a member
    const membership = await db.select().from(groupMembers).where(
      and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))
    ).limit(1);

    if (membership.length === 0) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const members = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: groupMembers.role,
      joinedAt: groupMembers.joinedAt
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId));

    return c.json({ members });
  } catch (error) {
    console.error('Fetch members error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE remove member
groupsRouter.delete('/:id/members/:memberId', async (c) => {
  try {
    const groupId = c.req.param('id');
    const memberId = c.req.param('memberId');
    const userId = c.get('userId');

    // Check if group exists and get creator
    const groupResult = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
    if (groupResult.length === 0) {
      return c.json({ error: 'Group not found' }, 404);
    }

    if (groupResult[0].creatorId !== userId) {
      return c.json({ error: 'Forbidden. Only admin can remove members.' }, 403);
    }

    if (memberId === userId) {
      return c.json({ error: 'Cannot remove yourself using this endpoint' }, 400);
    }

    await db.delete(groupMembers).where(
      and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, memberId))
    );

    return c.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

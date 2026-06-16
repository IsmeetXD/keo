import { Hono } from 'hono';
import { db } from '../db/index.js';
import { boards, workspaces, columns, tasks } from '../db/schema.js';
import { desc, eq, asc } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

type Variables = {
  userId: string;
};

export const boardsRouter = new Hono<{ Variables: Variables }>();

// Auth Middleware
boardsRouter.use('*', async (c, next) => {
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

boardsRouter.get('/', async (c) => {
  try {
    // Fetch all boards ordered by newest
    const allBoards = await db.select().from(boards).orderBy(desc(boards.updatedAt));
    
    const formatted = allBoards.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      updatedAt: b.updatedAt, 
      members: 1, 
      tasks: 0
    }));
    
    return c.json({ boards: formatted });
  } catch (error) {
    console.error('Fetch boards error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

boardsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, description } = body;

    if (!name) {
      return c.json({ error: 'Name is required' }, 400);
    }
    
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

    const newBoard = await db.insert(boards).values({
      name,
      description: description || '',
      workspaceId: defaultWorkspaceId,
    }).returning();

    return c.json({
      board: {
        id: newBoard[0].id,
        name: newBoard[0].name,
        description: newBoard[0].description,
        updatedAt: newBoard[0].updatedAt,
        members: 1,
        tasks: 0
      }
    });
  } catch (error) {
    console.error('Create board error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

boardsRouter.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { name, description } = body;
    
    if (!name) {
      return c.json({ error: 'Name is required' }, 400);
    }
    
    const updatedBoard = await db.update(boards)
      .set({ name, description, updatedAt: new Date() })
      .where(eq(boards.id, id))
      .returning();
      
    if (updatedBoard.length === 0) {
      return c.json({ error: 'Board not found' }, 404);
    }
    
    return c.json({ board: updatedBoard[0] });
  } catch (error) {
    console.error('Update board error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

boardsRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const deletedBoard = await db.delete(boards).where(eq(boards.id, id)).returning();
    
    if (deletedBoard.length === 0) {
      return c.json({ error: 'Board not found' }, 404);
    }
    
    return c.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET single board with its columns and tasks
boardsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const board = await db.select().from(boards).where(eq(boards.id, id)).limit(1);
    if (board.length === 0) {
      return c.json({ error: 'Board not found' }, 404);
    }

    const boardColumns = await db.select().from(columns).where(eq(columns.boardId, id)).orderBy(asc(columns.order));
    
    let boardTasks: any[] = [];
    if (boardColumns.length > 0) {
      const columnIds = boardColumns.map(col => col.id);
      // Fetch all tasks for all columns in this board
      // A simple loop is fine for MVP, or we can just fetch all tasks where columnId in columnIds
      // Since drizzle in query builder doesn't easily do 'inArray' without importing it, we'll loop
      for (const colId of columnIds) {
        const colTasks = await db.select().from(tasks).where(eq(tasks.columnId, colId)).orderBy(asc(tasks.order));
        boardTasks = [...boardTasks, ...colTasks];
      }
    }

    return c.json({
      board: board[0],
      columns: boardColumns,
      tasks: boardTasks
    });
  } catch (error) {
    console.error('Get board details error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST create column
boardsRouter.post('/:id/columns', async (c) => {
  try {
    const boardId = c.req.param('id');
    const { name } = await c.req.json();
    
    if (!name) return c.json({ error: 'Name is required' }, 400);

    const existingCols = await db.select().from(columns).where(eq(columns.boardId, boardId));
    const nextOrder = existingCols.length;

    const newCol = await db.insert(columns).values({
      boardId,
      name,
      order: nextOrder
    }).returning();

    return c.json({ column: newCol[0] });
  } catch (error) {
    console.error('Create column error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE column
boardsRouter.delete('/:id/columns/:colId', async (c) => {
  try {
    const colId = c.req.param('colId');
    const deletedCol = await db.delete(columns).where(eq(columns.id, colId)).returning();
    
    if (deletedCol.length === 0) return c.json({ error: 'Column not found' }, 404);
    return c.json({ message: 'Deleted' });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST create task
boardsRouter.post('/:id/columns/:colId/tasks', async (c) => {
  try {
    const columnId = c.req.param('colId');
    const { title } = await c.req.json();
    
    if (!title) return c.json({ error: 'Title is required' }, 400);

    const existingTasks = await db.select().from(tasks).where(eq(tasks.columnId, columnId));
    const nextOrder = existingTasks.length;

    const newTask = await db.insert(tasks).values({
      columnId,
      title,
      order: nextOrder
    }).returning();

    return c.json({ task: newTask[0] });
  } catch (error) {
    console.error('Create task error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT update task
boardsRouter.put('/:id/tasks/:taskId', async (c) => {
  try {
    const taskId = c.req.param('taskId');
    const { title, columnId, order } = await c.req.json();
    
    const updateData: any = { updatedAt: new Date() };
    if (title) updateData.title = title;
    if (columnId) updateData.columnId = columnId;
    if (order !== undefined) updateData.order = order;

    const updatedTask = await db.update(tasks).set(updateData).where(eq(tasks.id, taskId)).returning();
    
    if (updatedTask.length === 0) return c.json({ error: 'Task not found' }, 404);
    return c.json({ task: updatedTask[0] });
  } catch (error) {
    console.error('Update task error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE task
boardsRouter.delete('/:id/tasks/:taskId', async (c) => {
  try {
    const taskId = c.req.param('taskId');
    const deletedTask = await db.delete(tasks).where(eq(tasks.id, taskId)).returning();
    
    if (deletedTask.length === 0) return c.json({ error: 'Task not found' }, 404);
    return c.json({ message: 'Deleted' });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

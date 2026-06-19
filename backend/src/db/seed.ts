import { db } from './index.js';
import * as schema from './schema.js';
import { hash } from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  try {
    // 1. Create a user
    console.log('Creating user...');
    const hashedPassword = await hash('password123', 10);
    const [user] = await db.insert(schema.users).values({
      name: 'Admin User',
      email: 'admin@keo.local',
      passwordHash: hashedPassword,
    }).returning();

    // 2. Create a workspace
    console.log('Creating workspace...');
    const [workspace] = await db.insert(schema.workspaces).values({
      name: 'Main Workspace',
      slug: 'main-workspace',
      description: 'The default workspace for Keo',
    }).returning();

    // 3. Add user to workspace as owner
    console.log('Adding user to workspace...');
    await db.insert(schema.workspaceMembers).values({
      workspaceId: workspace.id,
      userId: user.id,
      role: 'owner',
    });

    // 4. Create a board
    console.log('Creating board...');
    const [board] = await db.insert(schema.boards).values({
      workspaceId: workspace.id,
      name: 'Development Board',
      description: 'Board for tracking development tasks',
    }).returning();

    // 5. Create columns
    console.log('Creating columns...');
    const columnsData = [
      { boardId: board.id, name: 'To Do', order: 0 },
      { boardId: board.id, name: 'In Progress', order: 1 },
      { boardId: board.id, name: 'Done', order: 2 },
    ];
    
    const createdColumns = await db.insert(schema.columns).values(columnsData).returning();

    // 6. Create some tasks
    console.log('Creating tasks...');
    await db.insert(schema.tasks).values([
      {
        columnId: createdColumns[0].id, // To Do
        title: 'Set up database seeding',
        description: 'Create a script to populate the database with initial data.',
        priority: 'high',
        assigneeId: user.id,
        order: 0,
      },
      {
        columnId: createdColumns[1].id, // In Progress
        title: 'Fix PostgreSQL connection',
        description: 'Resolve the ident authentication issue on localhost.',
        priority: 'urgent',
        assigneeId: user.id,
        order: 0,
      }
    ]);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();

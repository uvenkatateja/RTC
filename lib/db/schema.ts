import { pgTable, text, uuid, timestamp, integer, jsonb, index } from 'drizzle-orm/pg-core';

// Users table (synced from Clerk)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Boards table
export const boards = pgTable('boards', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  ownerId: text('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  ownerIdx: index('boards_owner_idx').on(table.ownerId),
}));

// Board members (many-to-many)
export const boardMembers = pgTable('board_members', {
  boardId: uuid('board_id').references(() => boards.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').default('member').notNull(), // owner, member, viewer
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (table) => ({
  boardIdx: index('board_members_board_idx').on(table.boardId),
  userIdx: index('board_members_user_idx').on(table.userId),
}));

// Lists (columns in board)
export const lists = pgTable('lists', {
  id: uuid('id').defaultRandom().primaryKey(),
  boardId: uuid('board_id').references(() => boards.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  position: integer('position').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  boardIdx: index('lists_board_idx').on(table.boardId),
  positionIdx: index('lists_position_idx').on(table.boardId, table.position),
}));

// Labels
export const labels = pgTable('labels', {
  id: uuid('id').defaultRandom().primaryKey(),
  boardId: uuid('board_id').references(() => boards.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tasks
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  listId: uuid('list_id').references(() => lists.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  position: integer('position').notNull(),
  priority: text('priority').default('no-priority').notNull(),
  dueDate: timestamp('due_date'),
  progressCompleted: integer('progress_completed').default(0).notNull(),
  progressTotal: integer('progress_total').default(0).notNull(),
  commentsCount: integer('comments_count').default(0).notNull(),
  attachmentsCount: integer('attachments_count').default(0).notNull(),
  linksCount: integer('links_count').default(0).notNull(),
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  listIdx: index('tasks_list_idx').on(table.listId),
  positionIdx: index('tasks_position_idx').on(table.listId, table.position),
  createdByIdx: index('tasks_created_by_idx').on(table.createdBy),
}));

// Task assignees (many-to-many)
export const taskAssignees = pgTable('task_assignees', {
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
}, (table) => ({
  taskIdx: index('task_assignees_task_idx').on(table.taskId),
  userIdx: index('task_assignees_user_idx').on(table.userId),
}));

// Task labels (many-to-many)
export const taskLabels = pgTable('task_labels', {
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  labelId: uuid('label_id').references(() => labels.id, { onDelete: 'cascade' }).notNull(),
});

// Activity log
export const activityLog = pgTable('activity_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  boardId: uuid('board_id').references(() => boards.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id),
  actionType: text('action_type').notNull(), // created, updated, deleted, moved
  entityType: text('entity_type').notNull(), // task, list, board
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  boardIdx: index('activity_log_board_idx').on(table.boardId),
  createdAtIdx: index('activity_log_created_at_idx').on(table.createdAt),
}));

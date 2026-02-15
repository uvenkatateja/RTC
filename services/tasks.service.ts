import { db } from '@/lib/db';
import { tasks, taskAssignees, taskLabels, labels, users, lists } from '@/lib/db/schema';
import { eq, and, asc, ilike, or, sql, desc } from 'drizzle-orm';

export type Task = typeof tasks.$inferSelect;
export type TaskInsert = typeof tasks.$inferInsert;
export type TaskUpdate = Partial<TaskInsert>;

export class TasksService {
  async getTasks(listId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.listId, listId))
      .orderBy(asc(tasks.position));
  }

  async getTaskWithRelations(taskId: string) {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) return null;

    const assignees = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
      })
      .from(taskAssignees)
      .leftJoin(users, eq(taskAssignees.userId, users.id))
      .where(eq(taskAssignees.taskId, taskId));

    const taskLabelRows = await db
      .select({
        id: labels.id,
        name: labels.name,
        color: labels.color,
      })
      .from(taskLabels)
      .leftJoin(labels, eq(taskLabels.labelId, labels.id))
      .where(eq(taskLabels.taskId, taskId));

    return {
      ...task,
      assignees,
      labels: taskLabelRows,
    };
  }

  async createTask(task: TaskInsert): Promise<Task> {
    // Get next position
    const existingTasks = await db
      .select({ position: tasks.position })
      .from(tasks)
      .where(eq(tasks.listId, task.listId))
      .orderBy(desc(tasks.position))
      .limit(1);

    const nextPosition = existingTasks.length > 0
      ? existingTasks[0].position + 1
      : 0;

    const [newTask] = await db
      .insert(tasks)
      .values({ ...task, position: task.position ?? nextPosition })
      .returning();
    return newTask;
  }

  async updateTask(id: string, updates: TaskUpdate): Promise<Task> {
    const [updated] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();

    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async moveTask(
    taskId: string,
    newListId: string,
    newPosition: number
  ): Promise<Task> {
    const [moved] = await db
      .update(tasks)
      .set({ listId: newListId, position: newPosition, updatedAt: new Date() })
      .where(eq(tasks.id, taskId))
      .returning();

    return moved;
  }

  async assignUser(taskId: string, userId: string): Promise<void> {
    // Check if already assigned
    const [existing] = await db
      .select()
      .from(taskAssignees)
      .where(
        and(
          eq(taskAssignees.taskId, taskId),
          eq(taskAssignees.userId, userId)
        )
      )
      .limit(1);

    if (!existing) {
      await db.insert(taskAssignees).values({ taskId, userId });
    }
  }

  async unassignUser(taskId: string, userId: string): Promise<void> {
    await db
      .delete(taskAssignees)
      .where(
        and(
          eq(taskAssignees.taskId, taskId),
          eq(taskAssignees.userId, userId)
        )
      );
  }

  async addLabel(taskId: string, labelId: string): Promise<void> {
    const [existing] = await db
      .select()
      .from(taskLabels)
      .where(
        and(
          eq(taskLabels.taskId, taskId),
          eq(taskLabels.labelId, labelId)
        )
      )
      .limit(1);

    if (!existing) {
      await db.insert(taskLabels).values({ taskId, labelId });
    }
  }

  async removeLabel(taskId: string, labelId: string): Promise<void> {
    await db
      .delete(taskLabels)
      .where(
        and(
          eq(taskLabels.taskId, taskId),
          eq(taskLabels.labelId, labelId)
        )
      );
  }

  async searchTasks(
    boardId: string,
    query: string,
    page: number = 1,
    limit: number = 20,
    filters?: { priority?: string; assignee?: string }
  ) {
    // Get all list IDs for this board
    const boardLists = await db
      .select({ id: lists.id })
      .from(lists)
      .where(eq(lists.boardId, boardId));

    const listIds = boardLists.map(l => l.id);
    if (listIds.length === 0) {
      return { tasks: [], total: 0, page, limit, totalPages: 0 };
    }

    // Build conditions array
    const conditions: any[] = [];

    // Filter by lists in this board
    for (const listId of listIds) {
      conditions.push(eq(tasks.listId, listId));
    }
    const listCondition = conditions.length === 1
      ? conditions[0]
      : or(...conditions);

    // Build search and filter conditions
    const whereConditions: any[] = [listCondition!];

    if (query) {
      whereConditions.push(
        or(
          ilike(tasks.title, `%${query}%`),
          ilike(tasks.description, `%${query}%`)
        )
      );
    }

    if (filters?.priority && filters.priority !== 'all') {
      whereConditions.push(eq(tasks.priority, filters.priority));
    }

    const whereClause = whereConditions.length === 1
      ? whereConditions[0]
      : and(...whereConditions);

    const offset = (page - 1) * limit;

    const results = await db
      .select()
      .from(tasks)
      .where(whereClause)
      .orderBy(asc(tasks.position))
      .limit(limit)
      .offset(offset);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(whereClause);

    return {
      tasks: results,
      total: Number(countResult?.count ?? 0),
      page,
      limit,
      totalPages: Math.ceil(Number(countResult?.count ?? 0) / limit),
    };
  }
}

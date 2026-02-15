import { db } from '@/lib/db';
import { boards, boardMembers, users, lists, tasks, taskAssignees, taskLabels, labels } from '@/lib/db/schema';
import { eq, and, asc, sql, ilike, or } from 'drizzle-orm';

export type Board = typeof boards.$inferSelect;
export type BoardInsert = typeof boards.$inferInsert;
export type BoardUpdate = Partial<BoardInsert>;

export class BoardsService {
  async getBoards(userId: string): Promise<Board[]> {
    // Get boards where user is owner
    const ownedBoards = await db
      .select()
      .from(boards)
      .where(eq(boards.ownerId, userId));

    // Get boards where user is a member
    const memberBoards = await db
      .select({ board: boards })
      .from(boardMembers)
      .innerJoin(boards, eq(boardMembers.boardId, boards.id))
      .where(eq(boardMembers.userId, userId));

    // Combine and deduplicate
    const boardMap = new Map<string, Board>();
    ownedBoards.forEach(b => boardMap.set(b.id, b));
    memberBoards.forEach(m => boardMap.set(m.board.id, m.board));

    return Array.from(boardMap.values());
  }

  async getBoard(id: string, userId: string): Promise<Board> {
    const [board] = await db
      .select()
      .from(boards)
      .where(eq(boards.id, id))
      .limit(1);

    if (!board) throw new Error('Board not found');

    // Check if user has access
    const isOwner = board.ownerId === userId;
    if (!isOwner) {
      const [membership] = await db
        .select()
        .from(boardMembers)
        .where(
          and(
            eq(boardMembers.boardId, id),
            eq(boardMembers.userId, userId)
          )
        )
        .limit(1);

      if (!membership) {
        throw new Error('Access denied');
      }
    }

    return board;
  }

  async getBoardWithDetails(id: string, userId: string) {
    // First verify access
    const board = await this.getBoard(id, userId);

    // Get lists ordered by position
    const boardLists = await db
      .select()
      .from(lists)
      .where(eq(lists.boardId, id))
      .orderBy(asc(lists.position));

    // Get all tasks for this board's lists
    const listIds = boardLists.map(l => l.id);
    let boardTasks: any[] = [];

    if (listIds.length > 0) {
      // Get tasks for each list
      for (const listId of listIds) {
        const listTasks = await db
          .select()
          .from(tasks)
          .where(eq(tasks.listId, listId))
          .orderBy(asc(tasks.position));
        boardTasks.push(...listTasks);
      }
    }

    // Get assignees for all tasks
    const taskIds = boardTasks.map(t => t.id);
    let assigneeMap: Map<string, any[]> = new Map();
    let labelMap: Map<string, any[]> = new Map();

    if (taskIds.length > 0) {
      for (const taskId of taskIds) {
        const assignees = await db
          .select({
            taskId: taskAssignees.taskId,
            userId: taskAssignees.userId,
            assignedAt: taskAssignees.assignedAt,
            userName: users.name,
            userEmail: users.email,
            userAvatar: users.avatarUrl,
          })
          .from(taskAssignees)
          .leftJoin(users, eq(taskAssignees.userId, users.id))
          .where(eq(taskAssignees.taskId, taskId));

        assigneeMap.set(taskId, assignees.map(a => ({
          id: a.userId,
          name: a.userName,
          email: a.userEmail,
          avatarUrl: a.userAvatar,
        })));

        const taskLabelRows = await db
          .select({
            taskId: taskLabels.taskId,
            labelId: taskLabels.labelId,
            labelName: labels.name,
            labelColor: labels.color,
          })
          .from(taskLabels)
          .leftJoin(labels, eq(taskLabels.labelId, labels.id))
          .where(eq(taskLabels.taskId, taskId));

        labelMap.set(taskId, taskLabelRows.map(l => ({
          id: l.labelId,
          name: l.labelName,
          color: l.labelColor,
        })));
      }
    }

    // Get board members
    const members = await db
      .select({
        boardId: boardMembers.boardId,
        userId: boardMembers.userId,
        role: boardMembers.role,
        joinedAt: boardMembers.joinedAt,
        userName: users.name,
        userEmail: users.email,
        userAvatar: users.avatarUrl,
      })
      .from(boardMembers)
      .leftJoin(users, eq(boardMembers.userId, users.id))
      .where(eq(boardMembers.boardId, id));

    // Get owner
    const [owner] = await db
      .select()
      .from(users)
      .where(eq(users.id, board.ownerId))
      .limit(1);

    // Assemble response
    const listsWithTasks = boardLists.map(list => ({
      ...list,
      tasks: boardTasks
        .filter(t => t.listId === list.id)
        .map(task => ({
          ...task,
          assignees: assigneeMap.get(task.id) || [],
          labels: labelMap.get(task.id) || [],
        })),
    }));

    return {
      ...board,
      lists: listsWithTasks,
      members: members.map(m => ({
        boardId: m.boardId,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        user: {
          id: m.userId,
          name: m.userName,
          email: m.userEmail,
          avatarUrl: m.userAvatar,
        },
      })),
      owner: owner || null,
    };
  }

  async createBoard(board: BoardInsert): Promise<Board> {
    const [newBoard] = await db.insert(boards).values(board).returning();
    return newBoard;
  }

  async updateBoard(id: string, updates: BoardUpdate): Promise<Board> {
    const [updated] = await db
      .update(boards)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(boards.id, id))
      .returning();

    return updated;
  }

  async deleteBoard(id: string): Promise<void> {
    await db.delete(boards).where(eq(boards.id, id));
  }

  async addMember(
    boardId: string,
    userId: string,
    role: string = 'member'
  ): Promise<void> {
    await db.insert(boardMembers).values({ boardId, userId, role });
  }

  async removeMember(boardId: string, userId: string): Promise<void> {
    await db
      .delete(boardMembers)
      .where(
        and(
          eq(boardMembers.boardId, boardId),
          eq(boardMembers.userId, userId)
        )
      );
  }

  async getMembers(boardId: string) {
    return await db
      .select({
        userId: boardMembers.userId,
        role: boardMembers.role,
        joinedAt: boardMembers.joinedAt,
        userName: users.name,
        userEmail: users.email,
        userAvatar: users.avatarUrl,
      })
      .from(boardMembers)
      .leftJoin(users, eq(boardMembers.userId, users.id))
      .where(eq(boardMembers.boardId, boardId));
  }
  async findUserByEmail(email: string) {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user;
  }
}

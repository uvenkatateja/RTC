import { db } from '@/lib/db';
import { lists } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export type List = typeof lists.$inferSelect;
export type ListInsert = typeof lists.$inferInsert;
export type ListUpdate = Partial<ListInsert>;

export class ListsService {
  async getLists(boardId: string): Promise<List[]> {
    return await db
      .select()
      .from(lists)
      .where(eq(lists.boardId, boardId))
      .orderBy(asc(lists.position));
  }

  async getList(id: string): Promise<List | null> {
    const [list] = await db
      .select()
      .from(lists)
      .where(eq(lists.id, id))
      .limit(1);
    return list || null;
  }

  async createList(list: ListInsert): Promise<List> {
    const [newList] = await db.insert(lists).values(list).returning();
    return newList;
  }

  async updateList(id: string, updates: ListUpdate): Promise<List> {
    const [updated] = await db
      .update(lists)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(lists.id, id))
      .returning();

    return updated;
  }

  async deleteList(id: string): Promise<void> {
    await db.delete(lists).where(eq(lists.id, id));
  }

  async reorderLists(boardId: string, listIds: string[]): Promise<void> {
    // Update positions for each list
    await Promise.all(
      listIds.map((id, index) =>
        db
          .update(lists)
          .set({ position: index })
          .where(eq(lists.id, id))
      )
    );
  }
}

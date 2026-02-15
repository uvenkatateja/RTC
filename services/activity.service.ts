import { db } from '@/lib/db';
import { activityLog, users } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export type ActivityInsert = typeof activityLog.$inferInsert;

export class ActivityService {
    async logActivity(entry: ActivityInsert): Promise<void> {
        await db.insert(activityLog).values(entry);
    }

    async getActivities(
        boardId: string,
        page: number = 1,
        limit: number = 20
    ) {
        const offset = (page - 1) * limit;

        const activities = await db
            .select({
                id: activityLog.id,
                boardId: activityLog.boardId,
                userId: activityLog.userId,
                actionType: activityLog.actionType,
                entityType: activityLog.entityType,
                entityId: activityLog.entityId,
                metadata: activityLog.metadata,
                createdAt: activityLog.createdAt,
                userName: users.name,
                userEmail: users.email,
                userAvatar: users.avatarUrl,
            })
            .from(activityLog)
            .leftJoin(users, eq(activityLog.userId, users.id))
            .where(eq(activityLog.boardId, boardId))
            .orderBy(desc(activityLog.createdAt))
            .limit(limit)
            .offset(offset);

        // Get total count
        const [countResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(activityLog)
            .where(eq(activityLog.boardId, boardId));

        return {
            activities: activities.map(a => ({
                id: a.id,
                boardId: a.boardId,
                userId: a.userId,
                actionType: a.actionType,
                entityType: a.entityType,
                entityId: a.entityId,
                metadata: a.metadata,
                createdAt: a.createdAt,
                user: a.userId ? {
                    id: a.userId,
                    name: a.userName,
                    email: a.userEmail,
                    avatarUrl: a.userAvatar,
                } : null,
            })),
            total: Number(countResult?.count ?? 0),
            page,
            limit,
            totalPages: Math.ceil(Number(countResult?.count ?? 0) / limit),
        };
    }
}

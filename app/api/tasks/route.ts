import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TasksService } from '@/services/tasks.service';
import { realtimeHub } from '@/lib/realtime';
import { ActivityService } from '@/services/activity.service';
import { db } from '@/lib/db';
import { lists } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ensureUserExists } from '@/lib/ensure-user';

const tasksService = new TasksService();
const activityService = new ActivityService();

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await ensureUserExists(userId);
        const body = await request.json();
        const task = await tasksService.createTask({
            listId: body.listId,
            title: body.title,
            description: body.description || null,
            position: body.position ?? 0,
            priority: body.priority || 'no-priority',
            dueDate: body.dueDate ? new Date(body.dueDate) : null,
            createdBy: userId,
        });

        // Get the board ID from the list
        const [list] = await db
            .select()
            .from(lists)
            .where(eq(lists.id, body.listId))
            .limit(1);

        if (list) {
            // Log activity
            await activityService.logActivity({
                boardId: list.boardId,
                userId,
                actionType: 'created',
                entityType: 'task',
                entityId: task.id,
                metadata: { title: task.title, listTitle: list.title },
            });

            // Broadcast
            realtimeHub.broadcast({
                type: 'task_created',
                boardId: list.boardId,
                payload: { ...task, assignees: [], labels: [] },
                userId,
                timestamp: new Date().toISOString(),
            });
        }

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json(
            { error: 'Failed to create task' },
            { status: 500 }
        );
    }
}

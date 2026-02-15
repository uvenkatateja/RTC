import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TasksService } from '@/services/tasks.service';
import { realtimeHub } from '@/lib/realtime';
import { db } from '@/lib/db';
import { lists, tasks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const tasksService = new TasksService();

// POST /api/tasks/[taskId]/assign - Assign user to task
export async function POST(
    request: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { userId: authUserId } = await auth();
        if (!authUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { taskId } = await params;
        const { userId } = await request.json();

        await tasksService.assignUser(taskId, userId);

        // Get task with relations for broadcast
        const fullTask = await tasksService.getTaskWithRelations(taskId);

        // Get board ID
        const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
        if (task) {
            const [list] = await db.select().from(lists).where(eq(lists.id, task.listId)).limit(1);
            if (list) {
                realtimeHub.broadcast({
                    type: 'task_updated',
                    boardId: list.boardId,
                    payload: fullTask,
                    userId: authUserId,
                    timestamp: new Date().toISOString(),
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error assigning user:', error);
        return NextResponse.json(
            { error: 'Failed to assign user' },
            { status: 500 }
        );
    }
}

// DELETE /api/tasks/[taskId]/assign - Unassign user from task
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { userId: authUserId } = await auth();
        if (!authUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { taskId } = await params;
        const { userId } = await request.json();

        await tasksService.unassignUser(taskId, userId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error unassigning user:', error);
        return NextResponse.json(
            { error: 'Failed to unassign user' },
            { status: 500 }
        );
    }
}

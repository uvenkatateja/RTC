import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TasksService } from '@/services/tasks.service';
import { realtimeHub } from '@/lib/realtime';
import { ActivityService } from '@/services/activity.service';
import { db } from '@/lib/db';
import { lists, tasks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const tasksService = new TasksService();
const activityService = new ActivityService();

// Helper to get boardId from a task
async function getBoardIdFromTask(taskId: string): Promise<string | null> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
    if (!task) return null;
    const [list] = await db.select().from(lists).where(eq(lists.id, task.listId)).limit(1);
    return list?.boardId || null;
}

// GET /api/tasks/[taskId] - Get a task with relations
export async function GET(
    request: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { taskId } = await params;
        const task = await tasksService.getTaskWithRelations(taskId);

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        return NextResponse.json(
            { error: 'Failed to fetch task' },
            { status: 500 }
        );
    }
}

// PATCH /api/tasks/[taskId] - Update a task
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { taskId } = await params;
        const body = await request.json();

        // Handle dueDate conversion
        const updates: any = { ...body };
        if (updates.dueDate) {
            updates.dueDate = new Date(updates.dueDate);
        }

        const task = await tasksService.updateTask(taskId, updates);
        const boardId = await getBoardIdFromTask(taskId);

        if (boardId) {
            await activityService.logActivity({
                boardId,
                userId,
                actionType: 'updated',
                entityType: 'task',
                entityId: taskId,
                metadata: { changes: body, title: task.title },
            });

            const fullTask = await tasksService.getTaskWithRelations(taskId);

            realtimeHub.broadcast({
                type: 'task_updated',
                boardId,
                payload: fullTask,
                userId,
                timestamp: new Date().toISOString(),
            });
        }

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json(
            { error: 'Failed to update task' },
            { status: 500 }
        );
    }
}

// DELETE /api/tasks/[taskId] - Delete a task
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { taskId } = await params;
        const boardId = await getBoardIdFromTask(taskId);

        // Get task info before deletion
        const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);

        await tasksService.deleteTask(taskId);

        if (boardId && task) {
            await activityService.logActivity({
                boardId,
                userId,
                actionType: 'deleted',
                entityType: 'task',
                entityId: taskId,
                metadata: { title: task.title },
            });

            realtimeHub.broadcast({
                type: 'task_deleted',
                boardId,
                payload: { taskId, listId: task.listId },
                userId,
                timestamp: new Date().toISOString(),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json(
            { error: 'Failed to delete task' },
            { status: 500 }
        );
    }
}

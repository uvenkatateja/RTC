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

// PATCH /api/tasks/[taskId]/move - Move task to a different list/position
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
        const { listId: newListId, position } = body;

        // Get current task
        const [currentTask] = await db
            .select()
            .from(tasks)
            .where(eq(tasks.id, taskId))
            .limit(1);

        if (!currentTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        const movedTask = await tasksService.moveTask(taskId, newListId, position);

        // Get board ID
        const [list] = await db
            .select()
            .from(lists)
            .where(eq(lists.id, newListId))
            .limit(1);

        if (list) {
            // Get old and new list names for activity log
            const [oldList] = await db
                .select()
                .from(lists)
                .where(eq(lists.id, currentTask.listId))
                .limit(1);

            await activityService.logActivity({
                boardId: list.boardId,
                userId,
                actionType: 'moved',
                entityType: 'task',
                entityId: taskId,
                metadata: {
                    title: currentTask.title,
                    fromList: oldList?.title,
                    toList: list.title,
                    fromPosition: currentTask.position,
                    toPosition: position,
                },
            });

            const fullTask = await tasksService.getTaskWithRelations(taskId);

            realtimeHub.broadcast({
                type: 'task_moved',
                boardId: list.boardId,
                payload: {
                    task: fullTask,
                    fromListId: currentTask.listId,
                    toListId: newListId,
                    position,
                },
                userId,
                timestamp: new Date().toISOString(),
            });
        }

        return NextResponse.json(movedTask);
    } catch (error) {
        console.error('Error moving task:', error);
        return NextResponse.json(
            { error: 'Failed to move task' },
            { status: 500 }
        );
    }
}

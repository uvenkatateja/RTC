import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ListsService } from '@/services/lists.service';
import { realtimeHub } from '@/lib/realtime';
import { ActivityService } from '@/services/activity.service';
import { db } from '@/lib/db';
import { lists } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const listsService = new ListsService();
const activityService = new ActivityService();

// PATCH /api/lists/[listId] - Update a list
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ listId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { listId } = await params;
        const body = await request.json();
        const list = await listsService.updateList(listId, body);

        // Broadcast
        realtimeHub.broadcast({
            type: 'list_updated',
            boardId: list.boardId,
            payload: list,
            userId,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json(list);
    } catch (error) {
        console.error('Error updating list:', error);
        return NextResponse.json(
            { error: 'Failed to update list' },
            { status: 500 }
        );
    }
}

// DELETE /api/lists/[listId] - Delete a list
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ listId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { listId } = await params;

        // Get the list first so we have the boardId for the activity log
        const [list] = await db
            .select()
            .from(lists)
            .where(eq(lists.id, listId))
            .limit(1);

        await listsService.deleteList(listId);

        if (list) {
            // Log activity
            await activityService.logActivity({
                boardId: list.boardId,
                userId,
                actionType: 'deleted',
                entityType: 'list',
                entityId: listId,
                metadata: { title: list.title },
            });

            // Broadcast
            realtimeHub.broadcast({
                type: 'list_deleted',
                boardId: list.boardId,
                payload: { listId },
                userId,
                timestamp: new Date().toISOString(),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting list:', error);
        return NextResponse.json(
            { error: 'Failed to delete list' },
            { status: 500 }
        );
    }
}

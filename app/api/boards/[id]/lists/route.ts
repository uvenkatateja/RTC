import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ListsService } from '@/services/lists.service';
import { realtimeHub } from '@/lib/realtime';
import { ActivityService } from '@/services/activity.service';

const listsService = new ListsService();
const activityService = new ActivityService();

// GET /api/boards/[id]/lists - Get lists for a board
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: boardId } = await params;
        const lists = await listsService.getLists(boardId);
        return NextResponse.json(lists);
    } catch (error) {
        console.error('Error fetching lists:', error);
        return NextResponse.json(
            { error: 'Failed to fetch lists' },
            { status: 500 }
        );
    }
}

// POST /api/boards/[id]/lists - Create a new list
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: boardId } = await params;
        const body = await request.json();

        // Get next position
        const existingLists = await listsService.getLists(boardId);
        const nextPosition = existingLists.length;

        const list = await listsService.createList({
            boardId,
            title: body.title,
            position: body.position ?? nextPosition,
        });

        // Log activity
        await activityService.logActivity({
            boardId,
            userId,
            actionType: 'created',
            entityType: 'list',
            entityId: list.id,
            metadata: { title: list.title },
        });

        // Broadcast
        realtimeHub.broadcast({
            type: 'list_created',
            boardId,
            payload: list,
            userId,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json(list, { status: 201 });
    } catch (error) {
        console.error('Error creating list:', error);
        return NextResponse.json(
            { error: 'Failed to create list' },
            { status: 500 }
        );
    }
}

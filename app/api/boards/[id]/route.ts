import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { BoardsService } from '@/services/boards.service';
import { realtimeHub } from '@/lib/realtime';
import { ActivityService } from '@/services/activity.service';
import { ensureUserExists } from '@/lib/ensure-user';

const boardsService = new BoardsService();
const activityService = new ActivityService();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureUserExists(userId);
    const { id } = await params;

    // Return full board with lists, tasks, members
    const board = await boardsService.getBoardWithDetails(id, userId);
    return NextResponse.json(board);
  } catch (error: any) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch board' },
      { status: error.message === 'Access denied' ? 403 : 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const board = await boardsService.updateBoard(id, body);

    // Log activity
    await activityService.logActivity({
      boardId: id,
      userId,
      actionType: 'updated',
      entityType: 'board',
      entityId: id,
      metadata: { changes: body },
    });

    // Broadcast real-time update
    realtimeHub.broadcast({
      type: 'board_updated',
      boardId: id,
      payload: board,
      userId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(board);
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json(
      { error: 'Failed to update board' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await boardsService.deleteBoard(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { BoardsService } from '@/services/boards.service';
import { ActivityService } from '@/services/activity.service';
import { ensureUserExists } from '@/lib/ensure-user';

const boardsService = new BoardsService();
const activityService = new ActivityService();

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureUserExists(userId);
    const boards = await boardsService.getBoards(userId);
    return NextResponse.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureUserExists(userId);
    const body = await request.json();

    // Create the board (ownerId always comes from auth, not the client)
    const board = await boardsService.createBoard({
      title: body.title,
      description: body.description || null,
      ownerId: userId,
    });

    // Auto-add the creator as a board member with 'owner' role
    await boardsService.addMember(board.id, userId, 'owner');

    // Log the activity
    await activityService.logActivity({
      boardId: board.id,
      userId,
      actionType: 'created',
      entityType: 'board',
      entityId: board.id,
      metadata: { title: board.title },
    });

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    );
  }
}

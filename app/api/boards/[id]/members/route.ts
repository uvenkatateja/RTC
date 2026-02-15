import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { BoardsService } from '@/services/boards.service';
import { realtimeHub } from '@/lib/realtime';
import { ActivityService } from '@/services/activity.service';

const boardsService = new BoardsService();
const activityService = new ActivityService();

// GET /api/boards/[id]/members
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
        const members = await boardsService.getMembers(boardId);
        return NextResponse.json(members);
    } catch (error) {
        console.error('Error fetching members:', error);
        return NextResponse.json(
            { error: 'Failed to fetch members' },
            { status: 500 }
        );
    }
}

// POST /api/boards/[id]/members - Add a member
// POST /api/boards/[id]/members - Add a member
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId: currentUserId } = await auth();
        if (!currentUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: boardId } = await params;
        const body = await request.json();
        const { email, role } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // 1. Find user by email
        const userToAdd = await boardsService.findUserByEmail(email);

        if (!userToAdd) {
            return NextResponse.json(
                { error: 'User not found. They must sign up for TaskFlow first.' },
                { status: 404 }
            );
        }

        // 2. Check if already a member
        const currentMembers = await boardsService.getMembers(boardId);
        const isMember = currentMembers.some(m => m.userId === userToAdd.id);
        if (isMember) {
            return NextResponse.json({ error: 'User is already a member of this board' }, { status: 409 });
        }

        // 3. Add member
        await boardsService.addMember(boardId, userToAdd.id, role || 'member');

        await activityService.logActivity({
            boardId,
            userId: currentUserId,
            actionType: 'added',
            entityType: 'member',
            entityId: userToAdd.id,
            metadata: { role: role || 'member', email },
        });

        realtimeHub.broadcast({
            type: 'member_added',
            boardId,
            payload: { userId: userToAdd.id, role: role || 'member' },
            userId: currentUserId,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error('Error adding member:', error);
        return NextResponse.json(
            { error: 'Failed to add member' },
            { status: 500 }
        );
    }
}

// DELETE /api/boards/[id]/members - Remove a member
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId: requesterId } = await auth();
        if (!requesterId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: boardId } = await params;
        const body = await request.json();
        const { userId: memberId } = body;

        if (!memberId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Check permission (only owner or the member themselves can remove)
        const board = await boardsService.getBoard(boardId, requesterId);
        if (board.ownerId !== requesterId && memberId !== requesterId) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        await boardsService.removeMember(boardId, memberId);

        await activityService.logActivity({
            boardId,
            userId: requesterId,
            actionType: 'deleted',
            entityType: 'member',
            entityId: memberId,
        });

        realtimeHub.broadcast({
            type: 'member_removed',
            boardId,
            payload: { userId: memberId },
            userId: requesterId,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error removing member:', error);
        return NextResponse.json(
            { error: 'Failed to remove member' },
            { status: 500 }
        );
    }
}

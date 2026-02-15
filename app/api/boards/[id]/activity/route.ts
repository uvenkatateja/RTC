import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ActivityService } from '@/services/activity.service';

const activityService = new ActivityService();

// GET /api/boards/[id]/activity?page=1&limit=20
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
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const result = await activityService.getActivities(boardId, page, limit);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching activity:', error);
        return NextResponse.json(
            { error: 'Failed to fetch activity' },
            { status: 500 }
        );
    }
}

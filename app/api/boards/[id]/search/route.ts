import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TasksService } from '@/services/tasks.service';

const tasksService = new TasksService();

// GET /api/boards/[id]/search?query=...&page=1&limit=20&priority=high
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

        const query = searchParams.get('query') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const priority = searchParams.get('priority') || undefined;
        const assignee = searchParams.get('assignee') || undefined;

        const result = await tasksService.searchTasks(boardId, query, page, limit, {
            priority,
            assignee,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error searching tasks:', error);
        return NextResponse.json(
            { error: 'Failed to search tasks' },
            { status: 500 }
        );
    }
}

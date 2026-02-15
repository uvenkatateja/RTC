import { auth } from '@clerk/nextjs/server';
import { realtimeHub } from '@/lib/realtime';

// GET /api/boards/[id]/events - SSE endpoint for real-time updates
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { id: boardId } = await params;

    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            // Send initial connection message
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'connected', boardId })}\n\n`)
            );

            // Send heartbeat every 30 seconds
            const heartbeat = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(': heartbeat\n\n'));
                } catch {
                    clearInterval(heartbeat);
                }
            }, 30000);

            // Subscribe to board events
            const unsubscribe = realtimeHub.subscribe(boardId, (event) => {
                // Don't send events back to the user who triggered them
                // (they already have optimistic updates)
                if (event.userId === userId) return;

                try {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
                    );
                } catch {
                    unsubscribe();
                    clearInterval(heartbeat);
                }
            });

            // Clean up on abort
            request.signal.addEventListener('abort', () => {
                unsubscribe();
                clearInterval(heartbeat);
                try {
                    controller.close();
                } catch {
                    // Already closed
                }
            });
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}

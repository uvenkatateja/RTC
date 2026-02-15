'use client';

import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RealtimeEvent } from '@/types';

export function useRealtimeBoard(boardId: string | undefined) {
    const queryClient = useQueryClient();
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        if (!boardId) return;

        // Create SSE connection
        const eventSource = new EventSource(`/api/boards/${boardId}/events`);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
            try {
                const data: RealtimeEvent = JSON.parse(event.data);

                // When we receive any event, invalidate the board query
                // This triggers a refetch and the UI updates automatically
                switch (data.type) {
                    case 'task_created':
                    case 'task_updated':
                    case 'task_deleted':
                    case 'task_moved':
                    case 'list_created':
                    case 'list_updated':
                    case 'list_deleted':
                    case 'board_updated':
                    case 'member_added':
                    case 'member_removed':
                        queryClient.invalidateQueries({ queryKey: ['boards', boardId] });
                        break;
                    default:
                        // Connected or heartbeat
                        break;
                }
            } catch (e) {
                // Ignore parse errors (heartbeats, etc.)
            }
        };

        eventSource.onerror = () => {
            // Auto-reconnect is handled by the EventSource API
            console.log('SSE connection error, will auto-reconnect...');
        };

        return () => {
            eventSource.close();
            eventSourceRef.current = null;
        };
    }, [boardId, queryClient]);
}

export function useActivity(boardId: string, page: number = 1) {
    return useQuery({
        queryKey: ['activity', boardId, page],
        queryFn: async () => {
            const response = await fetch(
                `/api/boards/${boardId}/activity?page=${page}&limit=20`
            );
            if (!response.ok) throw new Error('Failed to fetch activity');
            return response.json();
        },
        enabled: !!boardId,
    });
}

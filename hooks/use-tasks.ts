import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { TaskWithRelations, CreateTaskRequest, UpdateTaskRequest, MoveTaskRequest } from '@/types';

export function useTasks(boardId: string) {
    // Tasks are included in the board query, but we can also query specifically
    return useQuery({
        queryKey: ['boards', boardId],
        queryFn: async () => {
            const response = await fetch(`/api/boards/${boardId}`);
            if (!response.ok) throw new Error('Failed to fetch board');
            return response.json();
        },
        enabled: !!boardId,
    });
}

export function useCreateTask(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (task: CreateTaskRequest) => {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task),
            });
            if (!response.ok) throw new Error('Failed to create task');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boards', boardId] });
        },
    });
}

export function useUpdateTask(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ taskId, updates }: { taskId: string; updates: UpdateTaskRequest }) => {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error('Failed to update task');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boards', boardId] });
        },
    });
}

export function useDeleteTask(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (taskId: string) => {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete task');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boards', boardId] });
        },
    });
}

export function useMoveTask(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ taskId, ...moveData }: MoveTaskRequest & { taskId: string }) => {
            const response = await fetch(`/api/tasks/${taskId}/move`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(moveData),
            });
            if (!response.ok) throw new Error('Failed to move task');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boards', boardId] });
        },
    });
}

export function useAssignTask(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }) => {
            const response = await fetch(`/api/tasks/${taskId}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            if (!response.ok) throw new Error('Failed to assign user');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boards', boardId] });
        },
    });
}

export function useSearchTasks(boardId: string, query: string, page: number = 1) {
    return useQuery({
        queryKey: ['search', boardId, query, page],
        queryFn: async () => {
            const params = new URLSearchParams({
                query,
                page: page.toString(),
                limit: '20',
            });
            const response = await fetch(`/api/boards/${boardId}/search?${params}`);
            if (!response.ok) throw new Error('Failed to search tasks');
            return response.json();
        },
        enabled: !!boardId && !!query && query.length > 0,
    });
}

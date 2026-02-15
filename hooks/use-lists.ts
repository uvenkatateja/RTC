import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateList(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (title: string) => {
            const response = await fetch(`/api/boards/${boardId}/lists`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
            });
            if (!response.ok) throw new Error('Failed to create list');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boards', boardId] });
        },
    });
}

export function useUpdateList(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ listId, updates }: { listId: string; updates: { title?: string; position?: number } }) => {
            const response = await fetch(`/api/lists/${listId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error('Failed to update list');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boards', boardId] });
        },
    });
}

export function useDeleteList(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (listId: string) => {
            const response = await fetch(`/api/lists/${listId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete list');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boards', boardId] });
        },
    });
}

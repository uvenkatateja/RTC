import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';

type BoardInsert = {
  title: string;
  description?: string;
};

type BoardUpdate = {
  title?: string;
  description?: string;
};

export function useBoards() {
  const { user } = useUser();

  return useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const response = await fetch('/api/boards');
      if (!response.ok) throw new Error('Failed to fetch boards');
      return response.json();
    },
    enabled: !!user?.id,
  });
}

export function useBoard(id: string) {
  const { user } = useUser();

  return useQuery({
    queryKey: ['boards', id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const response = await fetch(`/api/boards/${id}`);
      if (!response.ok) throw new Error('Failed to fetch board');
      return response.json();
    },
    enabled: !!id && !!user?.id,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (board: BoardInsert) => {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(board),
      });
      if (!response.ok) throw new Error('Failed to create board');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
}

export function useUpdateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BoardUpdate }) => {
      const response = await fetch(`/api/boards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update board');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['boards', variables.id] });
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/boards/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete board');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
}
export function useAddMember(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const response = await fetch(`/api/boards/${boardId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add member");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", boardId] });
    },
  });
}
export function useRemoveMember(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/boards/${boardId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove member");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", boardId] });
    },
  });
}

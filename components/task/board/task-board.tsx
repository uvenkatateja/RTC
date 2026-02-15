'use client';

import { useState, useCallback, useMemo } from 'react';
import { TaskColumn } from './task-column';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2 } from 'lucide-react';
import { useCreateList } from '@/hooks/use-lists';
import { useMoveTask } from '@/hooks/use-tasks';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard } from './task-card';
import { FilterState } from '@/components/task/header/task-filters';
import { useUser } from '@clerk/nextjs';

interface TaskBoardProps {
  board: any;
  filters?: FilterState;
  sortBy?: string;
  onTaskSelect?: (taskId: string) => void;
}

const priorityOrder: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
  'no-priority': 4,
};

function filterAndSortTasks(
  tasks: any[],
  filters: FilterState,
  sortBy: string,
  currentUserId?: string | null
): any[] {
  let filtered = [...tasks];

  // Apply priority filter
  if (filters.priority !== 'all') {
    filtered = filtered.filter((t) => t.priority === filters.priority);
  }

  // Apply assignee filter
  if (filters.assignee === 'me' && currentUserId) {
    filtered = filtered.filter((t) =>
      t.assignees?.some((a: any) => a.id === currentUserId || a.userId === currentUserId)
    );
  } else if (filters.assignee === 'unassigned') {
    filtered = filtered.filter((t) => !t.assignees || t.assignees.length === 0);
  }

  // Apply sort
  switch (sortBy) {
    case 'priority':
      filtered.sort(
        (a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4)
      );
      break;
    case 'date':
      filtered.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
      break;
    case 'alphabetical':
      filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      break;
    case 'assignee':
      filtered.sort((a, b) => {
        const aName = a.assignees?.[0]?.name || a.assignees?.[0]?.email || 'zzz';
        const bName = b.assignees?.[0]?.name || b.assignees?.[0]?.email || 'zzz';
        return aName.localeCompare(bName);
      });
      break;
    default:
      // 'status' — keep original position order
      break;
  }

  return filtered;
}

export function TaskBoard({ board, filters = { priority: 'all', assignee: 'all' }, sortBy = 'status', onTaskSelect }: TaskBoardProps) {
  const lists = board?.lists || [];
  const boardId = board?.id;

  const { user } = useUser();

  const createList = useCreateList(boardId);
  const moveTask = useMoveTask(boardId);

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [activeTask, setActiveTask] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    try {
      await createList.mutateAsync(newListTitle);
      setNewListTitle('');
      setIsAddingList(false);
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    // Find the task across all lists
    for (const list of lists) {
      const task = list.tasks?.find((t: any) => t.id === active.id);
      if (task) {
        setActiveTask({ ...task, listId: list.id });
        break;
      }
    }
  }, [lists]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    // Find which list the task is being dropped into
    let targetListId: string | null = null;
    let targetPosition = 0;

    // Check if dropped over a list (column)
    const targetList = lists.find((l: any) => l.id === overId);
    if (targetList) {
      // Dropped on empty area of a list
      targetListId = targetList.id;
      targetPosition = targetList.tasks?.length || 0;
    } else {
      // Dropped on another task - find which list it belongs to
      for (const list of lists) {
        const taskIndex = list.tasks?.findIndex((t: any) => t.id === overId);
        if (taskIndex !== undefined && taskIndex >= 0) {
          targetListId = list.id;
          targetPosition = taskIndex;
          break;
        }
      }
    }

    if (!targetListId) return;

    // Find current task's list
    let currentListId: string | null = null;
    for (const list of lists) {
      if (list.tasks?.find((t: any) => t.id === activeTaskId)) {
        currentListId = list.id;
        break;
      }
    }

    // Only move if something changed
    if (currentListId === targetListId && !over) return;

    try {
      await moveTask.mutateAsync({
        taskId: activeTaskId,
        listId: targetListId,
        position: targetPosition,
      });
    } catch (error) {
      console.error('Error moving task:', error);
    }
  }, [lists, moveTask]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-3 px-3 pt-4 pb-2 min-w-max overflow-hidden">
        <SortableContext
          items={lists.map((l: any) => l.id)}
          strategy={horizontalListSortingStrategy}
        >
          {lists.map((list: any) => {
            const filteredTasks = filterAndSortTasks(
              list.tasks || [],
              filters,
              sortBy,
              user?.id
            );
            return (
              <TaskColumn
                key={list.id}
                list={list}
                tasks={filteredTasks}
                boardId={boardId}
                board={board}
                onTaskSelect={onTaskSelect}
              />
            );
          })}
        </SortableContext>

        {/* Add List */}
        <div className="shrink-0 w-[300px] lg:w-[360px]">
          {isAddingList ? (
            <div className="rounded-lg border border-border p-3 bg-muted/70 dark:bg-muted/50">
              <Input
                placeholder="List title..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddList();
                  if (e.key === 'Escape') {
                    setIsAddingList(false);
                    setNewListTitle('');
                  }
                }}
                autoFocus
                className="mb-2"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddList}
                  disabled={!newListTitle.trim() || createList.isPending}
                  size="sm"
                >
                  {createList.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Add List'
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setIsAddingList(false);
                    setNewListTitle('');
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 rounded-lg border border-dashed border-border p-3 h-auto text-muted-foreground hover:text-foreground hover:border-primary"
              onClick={() => setIsAddingList(true)}
            >
              <Plus className="size-4" />
              Add another list
            </Button>
          )}
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-80 rotate-3">
            <TaskCard task={activeTask} boardId={boardId} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

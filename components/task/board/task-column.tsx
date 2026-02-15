"use client";

import { useState } from "react";
import { TaskCard } from "./task-card";
import { Plus, MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCreateTask } from "@/hooks/use-tasks";
import { useDeleteList } from "@/hooks/use-lists";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface TaskColumnProps {
  list: any;
  tasks: any[];
  boardId: string;
  board?: any;
  onTaskSelect?: (taskId: string) => void;
}

export function TaskColumn({ list, tasks, boardId, board, onTaskSelect }: TaskColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const createTask = useCreateTask(boardId);
  const deleteList = useDeleteList(boardId);

  const { setNodeRef } = useDroppable({
    id: list.id,
  });

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      await createTask.mutateAsync({
        listId: list.id,
        title: newTaskTitle,
      });
      setNewTaskTitle("");
      setIsAddingTask(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleDeleteList = async () => {
    if (confirm("Delete this list and all its tasks?")) {
      try {
        await deleteList.mutateAsync(list.id);
      } catch (error) {
        console.error("Error deleting list:", error);
      }
    }
  };

  return (
    <div id={list.id} className="shrink-0 w-[300px] lg:w-[360px] flex flex-col h-full flex-1 scroll-mt-20">
      <div
        ref={setNodeRef}
        className="rounded-lg border border-border p-3 bg-muted/70 dark:bg-muted/50 flex flex-col max-h-full"
      >
        <div className="flex items-center justify-between mb-2 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{list.title}</span>
            <span className="text-xs text-muted-foreground">
              ({tasks.length})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsAddingTask(true)}
            >
              <Plus className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDeleteList}
                  className="text-destructive"
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete list
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto h-full">
          <SortableContext
            items={tasks.map((t: any) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                boardId={boardId}
                board={board}
                onTaskSelect={onTaskSelect}
              />
            ))}
          </SortableContext>

          {isAddingTask ? (
            <div className="bg-background rounded-lg border border-border p-3">
              <Input
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTask();
                  if (e.key === "Escape") {
                    setIsAddingTask(false);
                    setNewTaskTitle("");
                  }
                }}
                autoFocus
                className="mb-2 text-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim() || createTask.isPending}
                  size="sm"
                  className="text-xs"
                >
                  Add
                </Button>
                <Button
                  onClick={() => {
                    setIsAddingTask(false);
                    setNewTaskTitle("");
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-xs h-auto py-1 px-0 self-start hover:bg-background"
              onClick={() => setIsAddingTask(true)}
            >
              <Plus className="size-4" />
              <span>Add task</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

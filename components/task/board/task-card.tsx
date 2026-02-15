"use client";

import { useState } from "react";
import {
  Calendar,
  MessageSquare,
  FileText,
  Link,
  CheckCircle,
  InfoIcon,
  Hexagon,
  Stars,
  Minus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDeleteTask } from "@/hooks/use-tasks";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { TaskDetailSheet } from "./task-detail-sheet";

interface TaskCardProps {
  task: any;
  boardId: string;
  board?: any;
  isDragging?: boolean;
  onTaskSelect?: (taskId: string) => void;
}

const priorityConfig: Record<string, { icon: any; color: string; label: string }> = {
  urgent: { icon: Stars, color: "text-pink-500", label: "Urgent" },
  high: { icon: InfoIcon, color: "text-red-500", label: "High" },
  medium: { icon: Hexagon, color: "text-cyan-500", label: "Medium" },
  low: { icon: Minus, color: "text-gray-400", label: "Low" },
  "no-priority": { icon: Minus, color: "text-gray-300", label: "" },
};

export function TaskCard({ task, boardId, board, isDragging, onTaskSelect }: TaskCardProps) {
  const deleteTask = useDeleteTask(boardId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const priority = priorityConfig[task.priority] || priorityConfig["no-priority"];
  const PriorityIcon = priority.icon;

  const hasProgress = task.progressTotal > 0;
  const isCompleted = task.progressCompleted === task.progressTotal && hasProgress;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this task?")) {
      try {
        await deleteTask.mutateAsync(task.id);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open detail if clicking drag handle or delete
    const target = e.target as HTMLElement;
    if (target.closest('[data-drag-handle]') || target.closest('[data-delete-btn]')) return;
    onTaskSelect?.(task.id);
  };

  const formattedDate = task.dueDate
    ? format(new Date(task.dueDate), "MMM d")
    : null;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleCardClick}
        className={cn(
          "bg-background shrink-0 rounded-lg overflow-hidden border border-border group cursor-pointer hover:border-primary/40 transition-colors",
          isDragging && "shadow-lg ring-2 ring-primary/20"
        )}
      >
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2 mb-2">
            {/* Drag handle */}
            <div
              data-drag-handle
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <GripVertical className="size-4 text-muted-foreground" />
            </div>

            {/* Priority icon */}
            {priority.label && (
              <div
                className={cn(
                  "size-5 mt-0.5 shrink-0 flex items-center justify-center"
                )}
              >
                <PriorityIcon className={cn("size-4", priority.color)} />
              </div>
            )}

            <h3 className="text-sm font-medium leading-tight flex-1">
              {task.title}
            </h3>

            {isCompleted && (
              <CheckCircle className="size-4 shrink-0 text-green-500" />
            )}

            {/* Delete button */}
            <Button
              data-delete-btn
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={handleDelete}
            >
              <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.labels.map((label: any) => (
                <Badge
                  key={label.id}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0.5 font-medium"
                  style={{
                    backgroundColor: label.color + "20",
                    color: label.color,
                    borderColor: label.color + "40",
                  }}
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="px-3 py-2.5 border-t border-border border-dashed">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {formattedDate && (
                <div className="flex items-center gap-1.5 border border-border rounded-sm py-1 px-2">
                  <Calendar className="size-3" />
                  <span>{formattedDate}</span>
                </div>
              )}
              {task.commentsCount > 0 && (
                <div className="flex items-center gap-1.5 border border-border rounded-sm py-1 px-2">
                  <MessageSquare className="size-3" />
                  <span>{task.commentsCount}</span>
                </div>
              )}
              {task.attachmentsCount > 0 && (
                <div className="flex items-center gap-1.5 border border-border rounded-sm py-1 px-2">
                  <FileText className="size-3" />
                  <span>{task.attachmentsCount}</span>
                </div>
              )}
              {task.linksCount > 0 && (
                <div className="flex items-center gap-1.5 border border-border rounded-sm py-1 px-2">
                  <Link className="size-3" />
                  <span>{task.linksCount}</span>
                </div>
              )}
              {hasProgress && (
                <div className="flex items-center gap-1.5 border border-border rounded-sm py-1 px-2">
                  {isCompleted ? (
                    <CheckCircle className="size-3 text-green-500" />
                  ) : (
                    <div className="size-3 rounded-full border-2 border-primary" />
                  )}
                  <span>
                    {task.progressCompleted}/{task.progressTotal}
                  </span>
                </div>
              )}
            </div>

            {task.assignees && task.assignees.length > 0 && (
              <div className="flex -space-x-2">
                {task.assignees.map((user: any) => (
                  <Avatar
                    key={user.id}
                    className="size-5 border-2 border-background"
                  >
                    <AvatarImage src={user.avatarUrl} alt={user.name || ""} />
                    <AvatarFallback className="text-[10px]">
                      {(user.name || user.email || "?")
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


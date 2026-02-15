"use client";

import { useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Calendar,
    Stars,
    InfoIcon,
    Hexagon,
    Minus,
    Save,
    UserPlus,
    UserMinus,
    Check,
    Loader2,
    Layers,
} from "lucide-react";
import { useUpdateTask, useAssignTask } from "@/hooks/use-tasks";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskDetailSheetProps {
    task: any;
    board: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const priorities = [
    { id: "urgent", name: "Urgent", icon: Stars, color: "text-pink-500" },
    { id: "high", name: "High", icon: InfoIcon, color: "text-red-500" },
    { id: "medium", name: "Medium", icon: Hexagon, color: "text-cyan-500" },
    { id: "low", name: "Low", icon: Minus, color: "text-gray-400" },
    { id: "no-priority", name: "No priority", icon: Minus, color: "text-gray-300" },
];

export function TaskDetailSheet({
    task,
    board,
    open,
    onOpenChange,
}: TaskDetailSheetProps) {
    const [title, setTitle] = useState(task?.title || "");
    const [description, setDescription] = useState(task?.description || "");
    const [priority, setPriority] = useState(task?.priority || "no-priority");
    const [dueDate, setDueDate] = useState(
        task?.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""
    );
    const [hasChanges, setHasChanges] = useState(false);

    const updateTask = useUpdateTask(board?.id);
    const assignTask = useAssignTask(board?.id);
    const queryClient = useQueryClient();

    // Reset state when task changes
    useEffect(() => {
        if (task) {
            setTitle(task.title || "");
            setDescription(task.description || "");
            setPriority(task.priority || "no-priority");
            setDueDate(
                task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""
            );
            setHasChanges(false);
        }
    }, [task?.id]);

    const handleSave = async () => {
        if (!task) return;
        try {
            await updateTask.mutateAsync({
                taskId: task.id,
                updates: {
                    title: title.trim(),
                    description: description.trim() || undefined,
                    priority,
                    dueDate: dueDate || null,
                },
            });
            setHasChanges(false);
        } catch (error) {
            console.error("Failed to update task:", error);
        }
    };

    const handleAssign = async (userId: string) => {
        if (!task) return;
        try {
            await assignTask.mutateAsync({ taskId: task.id, userId });
        } catch (error) {
            console.error("Failed to assign user:", error);
        }
    };

    const handleUnassign = async (userId: string) => {
        if (!task) return;
        try {
            // Call DELETE to unassign
            const response = await fetch(`/api/tasks/${task.id}/assign`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            if (!response.ok) throw new Error("Failed to unassign");
            // Refresh the board data
            queryClient.invalidateQueries({ queryKey: ['boards', board?.id] });
        } catch (error) {
            console.error("Failed to unassign user:", error);
        }
    };

    const isAssigned = (userId: string) => {
        return task?.assignees?.some((a: any) => a.id === userId || a.userId === userId);
    };

    if (!task) return null;

    const currentPriority = priorities.find((p) => p.id === priority) || priorities[4];
    const PriorityIcon = currentPriority.icon;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-left">Edit Task</SheetTitle>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                            Title
                        </label>
                        <Input
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setHasChanges(true);
                            }}
                            placeholder="Task title..."
                            className="text-base font-medium"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                                setHasChanges(true);
                            }}
                            placeholder="Add a description..."
                            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                        />
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                            Priority
                        </label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 w-full justify-start"
                                >
                                    <PriorityIcon
                                        className={cn("size-4", currentPriority.color)}
                                    />
                                    {currentPriority.name}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48">
                                {priorities.map((p) => {
                                    const Icon = p.icon;
                                    return (
                                        <DropdownMenuItem
                                            key={p.id}
                                            onClick={() => {
                                                setPriority(p.id);
                                                setHasChanges(true);
                                            }}
                                            className="flex items-center gap-2"
                                        >
                                            <Icon className={cn("size-4", p.color)} />
                                            <span>{p.name}</span>
                                            {priority === p.id && (
                                                <Check className="size-4 ml-auto text-primary" />
                                            )}
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                            Due Date
                        </label>
                        <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-muted-foreground" />
                            <Input
                                type="date"
                                value={dueDate}
                                onChange={(e) => {
                                    setDueDate(e.target.value);
                                    setHasChanges(true);
                                }}
                                className="flex-1"
                            />
                            {dueDate && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setDueDate("");
                                        setHasChanges(true);
                                    }}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Assignees */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                            Assignees
                        </label>

                        {/* Current assignees */}
                        {task.assignees && task.assignees.length > 0 && (
                            <div className="space-y-2 mb-3">
                                {task.assignees.map((user: any) => (
                                    <div
                                        key={user.id || user.userId}
                                        className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                                    >
                                        <Avatar className="size-6">
                                            <AvatarImage src={user.avatarUrl} />
                                            <AvatarFallback className="text-[10px]">
                                                {(user.name || user.email || "?")
                                                    .split(" ")
                                                    .map((n: string) => n[0])
                                                    .join("")
                                                    .toUpperCase()
                                                    .slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm flex-1 truncate">
                                            {user.name || user.email}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => handleUnassign(user.id || user.userId)}
                                        >
                                            <UserMinus className="size-3 text-muted-foreground" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Assign member dropdown */}
                        {board?.members && board.members.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2 w-full">
                                        <UserPlus className="size-4" />
                                        Assign member
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>Board Members</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {board.members.map((member: any) => {
                                        const assigned = isAssigned(member.userId);
                                        return (
                                            <DropdownMenuItem
                                                key={member.userId}
                                                onClick={() => {
                                                    if (!assigned) {
                                                        handleAssign(member.userId);
                                                    }
                                                }}
                                                className="flex items-center gap-2"
                                                disabled={assigned}
                                            >
                                                <Avatar className="size-5">
                                                    <AvatarImage src={member.user?.avatarUrl} />
                                                    <AvatarFallback className="text-[10px]">
                                                        {(member.user?.name || member.user?.email || "?")
                                                            .split(" ")
                                                            .map((n: string) => n[0])
                                                            .join("")
                                                            .toUpperCase()
                                                            .slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="flex-1 truncate text-sm">
                                                    {member.user?.name || member.user?.email}
                                                </span>
                                                {assigned && (
                                                    <Check className="size-4 text-primary" />
                                                )}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {/* Labels */}
                    {task.labels && task.labels.length > 0 && (
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                                Labels
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {task.labels.map((label: any) => (
                                    <Badge
                                        key={label.id}
                                        variant="secondary"
                                        className="text-xs px-2 py-0.5"
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
                        </div>
                    )}

                    {/* Save Button */}
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || updateTask.isPending || !title.trim()}
                        className="w-full gap-2"
                    >
                        {updateTask.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Save className="size-4" />
                        )}
                        {updateTask.isPending ? "Saving..." : "Save Changes"}
                    </Button>

                    {/* Meta info */}
                    <div className="pt-4 border-t border-border space-y-1">
                        <p className="text-[10px] text-muted-foreground">
                            Created: {task.createdAt ? format(new Date(task.createdAt), "PPp") : "Unknown"}
                        </p>
                        {task.updatedAt && (
                            <p className="text-[10px] text-muted-foreground">
                                Updated: {format(new Date(task.updatedAt), "PPp")}
                            </p>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

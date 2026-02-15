"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCreateTask } from "@/hooks/use-tasks";
import { Loader2, Plus, Sparkles } from "lucide-react";

interface TaskCreateDialogProps {
    board: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TaskCreateDialog({
    board,
    open,
    onOpenChange,
}: TaskCreateDialogProps) {
    const [title, setTitle] = useState("");
    const [listId, setListId] = useState(board?.lists?.[0]?.id || "");
    const createTask = useCreateTask(board?.id);

    const handleCreate = async () => {
        if (!title.trim() || !listId) return;
        try {
            await createTask.mutateAsync({
                title: title.trim(),
                listId,
            });
            setTitle("");
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to create task:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="size-4 text-primary" />
                        Create New Task
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground block">
                            Task Title
                        </label>
                        <Input
                            placeholder="What needs to be done?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleCreate();
                            }}
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground block">
                            Which List?
                        </label>
                        <Select value={listId} onValueChange={setListId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a list" />
                            </SelectTrigger>
                            <SelectContent>
                                {board?.lists?.map((list: any) => (
                                    <SelectItem key={list.id} value={list.id}>
                                        {list.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="pt-2">
                        <Button
                            className="w-full gap-2 bg-linear-to-r from-primary to-primary/80"
                            onClick={handleCreate}
                            disabled={!title.trim() || !listId || createTask.isPending}
                        >
                            {createTask.isPending ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Plus className="size-4" />
                            )}
                            {createTask.isPending ? "Creating..." : "Create Task"}
                        </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
                        <Sparkles className="size-3 text-amber-500" />
                        Press Enter to create quickly
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

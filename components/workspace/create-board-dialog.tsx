"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateBoard } from "@/hooks/use-boards";
import { Loader2, Plus } from "lucide-react";

interface CreateBoardDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateBoardDialog({
    open,
    onOpenChange,
}: CreateBoardDialogProps) {
    const [title, setTitle] = useState("");
    const createBoard = useCreateBoard();

    const handleCreate = async () => {
        if (!title.trim()) return;
        try {
            await createBoard.mutateAsync({
                title: title.trim(),
                description: "",
            });
            setTitle("");
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to create board:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Board</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input
                        id="title"
                        placeholder="Board title (e.g. 'Marketing Launch')"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreate();
                        }}
                        autoFocus
                    />
                    <Button
                        onClick={handleCreate}
                        disabled={!title.trim() || createBoard.isPending}
                        className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                        {createBoard.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="mr-2 h-4 w-4" />
                        )}
                        Create Board
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { useState } from "react";
import {
    X,
    Settings,
    Trash2,
    Loader2,
    Save,
    AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateBoard, useDeleteBoard } from "@/hooks/use-boards";
import { useRouter } from "next/navigation";

interface SettingsPanelProps {
    board: any;
    onClose: () => void;
}

export function SettingsPanel({ board, onClose }: SettingsPanelProps) {
    const [title, setTitle] = useState(board?.title || "");
    const [description, setDescription] = useState(board?.description || "");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const updateBoard = useUpdateBoard();
    const deleteBoard = useDeleteBoard();
    const router = useRouter();

    const handleSave = async () => {
        if (!title.trim()) return;
        try {
            await updateBoard.mutateAsync({
                id: board.id,
                updates: { title: title.trim(), description: description.trim() }
            });
            onClose();
        } catch (error) {
            console.error("Failed to update board:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteBoard.mutateAsync(board.id);
            router.push("/boards");
        } catch (error) {
            console.error("Failed to delete board:", error);
        }
    };

    return (
        <div className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border shadow-lg z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <Settings className="size-4" />
                    <h3 className="font-semibold text-sm">Board Settings</h3>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onClose}
                >
                    <X className="size-4" />
                </Button>
            </div>

            {/* Settings Form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Board Title
                    </label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Board title..."
                        className="text-sm"
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Board description..."
                        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                </div>

                <Button
                    onClick={handleSave}
                    disabled={!title.trim() || updateBoard.isPending}
                    className="w-full gap-2"
                >
                    {updateBoard.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Save className="size-4" />
                    )}
                    {updateBoard.isPending ? "Saving..." : "Save Changes"}
                </Button>

                {/* Board Info */}
                <div className="pt-4 border-t border-border space-y-2">
                    <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Created:</span>{" "}
                        {board?.createdAt
                            ? new Date(board.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })
                            : "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Lists:</span> {board?.lists?.length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Members:</span>{" "}
                        {board?.members?.length || 0}
                    </p>
                </div>

                {/* Danger Zone */}
                <div className="pt-4 border-t border-destructive/20">
                    <h4 className="text-xs font-semibold text-destructive mb-3 flex items-center gap-1.5">
                        <AlertTriangle className="size-3" />
                        Danger Zone
                    </h4>
                    {showDeleteConfirm ? (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                                This will permanently delete the board, all lists, and all tasks.
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-1.5 flex-1"
                                    onClick={handleDelete}
                                    disabled={deleteBoard.isPending}
                                >
                                    {deleteBoard.isPending ? (
                                        <Loader2 className="size-3 animate-spin" />
                                    ) : (
                                        <Trash2 className="size-3" />
                                    )}
                                    {deleteBoard.isPending ? "Deleting..." : "Delete Board"}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            <Trash2 className="size-3" />
                            Delete this board
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

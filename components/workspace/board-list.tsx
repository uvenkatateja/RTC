"use client";

import { useBoards } from "@/hooks/use-boards";
import Link from "next/link";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateBoardDialog } from "./create-board-dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const gradients = [
    "from-pink-500 to-rose-500",
    "from-blue-500 to-indigo-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-purple-500 to-violet-500",
];

interface BoardListProps {
    searchQuery?: string;
    viewMode?: "grid" | "list";
    sortBy?: string;
    filterBy?: string;
}

export function BoardList({ searchQuery = "", viewMode = "grid", sortBy = "recent", filterBy = "all" }: BoardListProps) {
    const { data: boards, isLoading } = useBoards();
    const [createOpen, setCreateOpen] = useState(false);

    // 1. Filter
    const filteredBoards = boards?.filter((board: any) =>
        board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (board.description && board.description.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

    // 2. Sort
    const sortedBoards = [...filteredBoards].sort((a: any, b: any) => {
        switch (sortBy) {
            case "oldest":
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case "alphabetical":
                return a.title.localeCompare(b.title);
            case "startDate":
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case "recent":
            default:
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    if (viewMode === "list") {
        return (
            <div className="flex flex-col gap-3">
                {/* Create Board Row */}
                <div
                    role="button"
                    onClick={() => setCreateOpen(true)}
                    className="flex items-center gap-4 p-4 rounded-lg border border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer"
                >
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                        <Plus className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">Create new board</span>
                </div>

                {sortedBoards.map((board: any, index: number) => {
                    const gradient = gradients[index % gradients.length];
                    return (
                        <Link key={board.id} href={`/boards/${board.id}`}>
                            <div className="group flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card hover:shadow-sm transition-all hover:bg-muted/30">
                                <div className={cn("h-12 w-1.5 rounded-full bg-linear-to-b opacity-75 group-hover:opacity-100", gradient)} />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                                        {board.title}
                                    </h3>
                                    {board.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-1 truncate">
                                            {board.description}
                                        </p>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground whitespace-nowrap">
                                    Updated {formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true })}
                                </div>
                            </div>
                        </Link>
                    );
                })}
                <CreateBoardDialog open={createOpen} onOpenChange={setCreateOpen} />
            </div>
        )
    }

    // Grid View
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Create Board Card */}
                <div
                    role="button"
                    onClick={() => setCreateOpen(true)}
                    className="group relative flex flex-col items-center justify-center p-6 h-36 rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer animate-in fade-in zoom-in-95 duration-200"
                >
                    <div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                        <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                            <Plus className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-medium">Create new board</span>
                    </div>
                </div>

                {/* Existing Boards */}
                {sortedBoards.map((board: any, index: number) => {
                    const gradient = gradients[index % gradients.length];
                    return (
                        <Link key={board.id} href={`/boards/${board.id}`} className="block h-full">
                            <div className="group relative h-36 flex flex-col rounded-xl overflow-hidden border border-border/50 bg-card hover:shadow-lg transition-all hover:-translate-y-1 hover:border-primary/20">
                                {/* Gradient Bar */}
                                <div
                                    className={cn(
                                        "absolute top-0 left-0 w-1.5 h-full bg-linear-to-b opacity-80 group-hover:opacity-100 transition-opacity",
                                        gradient
                                    )}
                                />

                                <div className="flex-1 p-5 pl-7 flex flex-col bg-linear-to-br from-card to-muted/10 group-hover:from-card group-hover:to-muted/20">
                                    <div className="mb-2">
                                        <h3 className="font-semibold text-lg tracking-tight truncate group-hover:text-primary transition-colors">
                                            {board.title}
                                        </h3>
                                    </div>

                                    {board.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {board.description}
                                        </p>
                                    )}

                                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/30">
                                        <span className="text-xs font-medium text-muted-foreground/70 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
            <CreateBoardDialog open={createOpen} onOpenChange={setCreateOpen} />
        </div>
    );
}

// Helper icon
import { Clock } from "lucide-react";

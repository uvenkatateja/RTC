"use client";

import { useBoards } from "@/hooks/use-boards";
import Link from "next/link";
import { Plus } from "lucide-react";
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
}

export function BoardList({ searchQuery = "" }: BoardListProps) {
    const { data: boards, isLoading } = useBoards();
    const [createOpen, setCreateOpen] = useState(false);

    const filteredBoards = boards?.filter((board: any) =>
        board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (board.description && board.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Create Board Card */}
                <div
                    role="button"
                    onClick={() => setCreateOpen(true)}
                    className="group relative flex flex-col items-center justify-center p-6 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer"
                >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                        <Plus className="h-8 w-8" />
                        <span className="text-sm font-medium">Create new board</span>
                    </div>
                </div>

                {/* Existing Boards */}
                {filteredBoards?.map((board: any, index: number) => {
                    const gradient = gradients[index % gradients.length];
                    return (
                        <Link key={board.id} href={`/boards/${board.id}`}>
                            <div className="group relative h-32 rounded-lg overflow-hidden border border-border/50 bg-card hover:shadow-lg transition-all hover:scale-[1.02]">
                                <div
                                    className={cn(
                                        "absolute top-0 left-0 w-2 h-full bg-linear-to-b opacity-75 group-hover:opacity-100 transition-opacity",
                                        gradient
                                    )}
                                />
                                <div className="p-4 pl-6 flex flex-col h-full bg-linear-to-br from-transparent to-muted/20">
                                    <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                                        {board.title}
                                    </h3>
                                    {board.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                            {board.description}
                                        </p>
                                    )}
                                    <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground/80 group-hover:text-muted-foreground transition-colors">
                                        <span>
                                            Updated {formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <CreateBoardDialog open={createOpen} onOpenChange={setCreateOpen} />
        </>
    );
}

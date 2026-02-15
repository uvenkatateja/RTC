"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, History, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ActivityPanelProps {
    boardId: string;
    onClose: () => void;
}

const actionLabels: Record<string, string> = {
    created: "created",
    updated: "updated",
    deleted: "deleted",
    moved: "moved",
    added: "added",
};

const entityLabels: Record<string, string> = {
    task: "task",
    list: "list",
    board: "board",
    member: "member",
};

export function ActivityPanel({ boardId, onClose }: ActivityPanelProps) {
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ["activity", boardId, page],
        queryFn: async () => {
            const response = await fetch(
                `/api/boards/${boardId}/activity?page=${page}&limit=15`
            );
            if (!response.ok) throw new Error("Failed to fetch activity");
            return response.json();
        },
        enabled: !!boardId,
    });

    return (
        <div className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border shadow-lg z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <History className="size-4" />
                    <h3 className="font-semibold text-sm">Activity History</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                    <X className="size-4" />
                </Button>
            </div>

            {/* Activity List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-3 animate-pulse">
                                <div className="size-6 rounded-full bg-muted shrink-0" />
                                <div className="flex-1 space-y-1">
                                    <div className="h-3 bg-muted rounded w-3/4" />
                                    <div className="h-2 bg-muted rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : data?.activities?.length === 0 ? (
                    <div className="text-center py-8">
                        <History className="size-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                            No activity yet. Start by creating lists and tasks!
                        </p>
                    </div>
                ) : (
                    data?.activities?.map((activity: any) => (
                        <div key={activity.id} className="flex gap-3">
                            <Avatar className="size-6 shrink-0">
                                <AvatarImage src={activity.user?.avatarUrl} />
                                <AvatarFallback className="text-[10px]">
                                    {(activity.user?.name || activity.user?.email || "?")
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs">
                                    <span className="font-medium">
                                        {activity.user?.name || activity.user?.email || "Unknown"}
                                    </span>{" "}
                                    <span className="text-muted-foreground">
                                        {actionLabels[activity.actionType] || activity.actionType}
                                    </span>{" "}
                                    <span className="text-muted-foreground">
                                        {entityLabels[activity.entityType] || activity.entityType}
                                    </span>
                                    {activity.metadata?.title && (
                                        <>
                                            {" "}
                                            <span className="font-medium">
                                                "{activity.metadata.title}"
                                            </span>
                                        </>
                                    )}
                                </p>
                                {activity.metadata?.fromList && activity.metadata?.toList && (
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                        from "{activity.metadata.fromList}" to "{activity.metadata.toList}"
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {formatDistanceToNow(new Date(activity.createdAt), {
                                        addSuffix: true,
                                    })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="p-4 border-t border-border flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                    >
                        <ChevronLeft className="size-3 mr-1" />
                        Prev
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        {page} / {data.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={page >= data.totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                        <ChevronRight className="size-3 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
}

"use client";

import { useMemo } from "react";
import {
    X,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isTomorrow, isPast, addDays, isBefore, isAfter, startOfDay } from "date-fns";

interface SchedulePanelProps {
    board: any;
    onClose: () => void;
}

export function SchedulePanel({ board, onClose }: SchedulePanelProps) {
    const allTasks = useMemo(() => {
        const tasks: any[] = [];
        board?.lists?.forEach((list: any) => {
            list.tasks?.forEach((task: any) => {
                if (task.dueDate) {
                    tasks.push({ ...task, listTitle: list.title });
                }
            });
        });
        // Sort by due date ascending
        tasks.sort(
            (a, b) =>
                new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
        return tasks;
    }, [board]);

    const overdueTasks = allTasks.filter(
        (t) => isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))
    );
    const todayTasks = allTasks.filter((t) => isToday(new Date(t.dueDate)));
    const tomorrowTasks = allTasks.filter((t) =>
        isTomorrow(new Date(t.dueDate))
    );
    const upcomingTasks = allTasks.filter((t) => {
        const d = new Date(t.dueDate);
        return (
            !isPast(d) && !isToday(d) && !isTomorrow(d) && isBefore(d, addDays(new Date(), 7))
        );
    });
    const laterTasks = allTasks.filter((t) =>
        isAfter(new Date(t.dueDate), addDays(new Date(), 7))
    );

    const noDateTasks = useMemo(() => {
        const tasks: any[] = [];
        board?.lists?.forEach((list: any) => {
            list.tasks?.forEach((task: any) => {
                if (!task.dueDate) {
                    tasks.push({ ...task, listTitle: list.title });
                }
            });
        });
        return tasks;
    }, [board]);

    const renderTaskGroup = (title: string, tasks: any[], icon: React.ReactNode, color: string) => {
        if (tasks.length === 0) return null;
        return (
            <div className="mb-4">
                <div className={`flex items-center gap-2 mb-2 text-xs font-semibold ${color}`}>
                    {icon}
                    <span>{title}</span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                        {tasks.length}
                    </Badge>
                </div>
                <div className="space-y-1.5">
                    {tasks.map((task: any) => (
                        <div
                            key={task.id}
                            className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors text-sm"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-xs">{task.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-muted-foreground">
                                        {task.listTitle}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">·</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {format(new Date(task.dueDate), "MMM d, yyyy")}
                                    </span>
                                </div>
                            </div>
                            {task.priority && task.priority !== "no-priority" && (
                                <Badge
                                    variant="outline"
                                    className="text-[10px] capitalize h-5 px-1.5"
                                >
                                    {task.priority}
                                </Badge>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border shadow-lg z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <h3 className="font-semibold text-sm">Schedule</h3>
                    <Badge variant="secondary" className="text-[10px]">
                        {allTasks.length} scheduled
                    </Badge>
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

            {/* Schedule List */}
            <div className="flex-1 overflow-y-auto p-4">
                {allTasks.length === 0 && noDateTasks.length > 0 ? (
                    <div className="text-center py-8">
                        <Calendar className="size-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                            No scheduled tasks yet.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Add due dates to your tasks to see them here.
                        </p>
                    </div>
                ) : allTasks.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar className="size-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                            No tasks yet. Create some tasks to get started.
                        </p>
                    </div>
                ) : (
                    <>
                        {renderTaskGroup(
                            "Overdue",
                            overdueTasks,
                            <AlertCircle className="size-3" />,
                            "text-destructive"
                        )}
                        {renderTaskGroup(
                            "Today",
                            todayTasks,
                            <Clock className="size-3" />,
                            "text-amber-500"
                        )}
                        {renderTaskGroup(
                            "Tomorrow",
                            tomorrowTasks,
                            <ChevronRight className="size-3" />,
                            "text-blue-500"
                        )}
                        {renderTaskGroup(
                            "This Week",
                            upcomingTasks,
                            <Calendar className="size-3" />,
                            "text-foreground"
                        )}
                        {renderTaskGroup(
                            "Later",
                            laterTasks,
                            <Calendar className="size-3" />,
                            "text-muted-foreground"
                        )}
                    </>
                )}

                {/* No date tasks */}
                {noDateTasks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-[10px] text-muted-foreground mb-2">
                            {noDateTasks.length} task{noDateTasks.length !== 1 ? "s" : ""}{" "}
                            without due date
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

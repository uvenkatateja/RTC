"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Link as LinkIcon,
  ArrowLeft,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import Link from "next/link";
import { TaskFilters, FilterState } from "./task-filters";
import { TaskSort } from "./task-sort";

import { TaskImportExport } from "./task-import-export";
import { UserButton } from "@clerk/nextjs";
import { ActivityPanel } from "@/components/task/activity-panel";
import { SidebarView } from "../sidebar/task-sidebar";

interface TaskHeaderProps {
  board: any;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  onCreateTask: () => void;
}

export function TaskHeader({
  board,
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  activeView,
  onViewChange,
  onCreateTask,
}: TaskHeaderProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <>
      <div className="border-b border-border bg-background">
        <div className="flex items-center justify-between px-3 lg:px-6 py-3">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href="/boards">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-semibold">
                {board.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <UserButton afterSignOutUrl="/" />
            <Button
              variant={activeView === "activity" ? "secondary" : "outline"}
              size="sm"
              className="gap-2 hidden lg:flex"
              onClick={() => onViewChange(activeView === "activity" ? "board" : "activity")}
            >
              <History className="size-4" />
              Activity
            </Button>
            <ThemeToggle />
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {board.lists?.length || 0} lists · {" "}
                {board.lists?.reduce(
                  (sum: number, l: any) => sum + (l.tasks?.length || 0),
                  0
                ) || 0}{" "}
                tasks
              </span>
              {/* Member avatars */}
              {board.members && board.members.length > 0 && (
                <div className="flex -space-x-2 ml-2">
                  {board.members.slice(0, 4).map((member: any) => (
                    <Avatar
                      key={member.userId}
                      className="size-5 border-2 border-background"
                    >
                      <AvatarImage
                        src={member.user?.avatarUrl}
                        alt={member.user?.name || ""}
                      />
                      <AvatarFallback className="text-[10px]">
                        {(member.user?.name || "?")
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {board.members.length > 4 && (
                    <div className="size-5 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px]">
                      +{board.members.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 hidden lg:flex"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                // Optional: You could add a toast here if you had one installed
                toast.success("Board link copied to clipboard!");
              }}
            >
              <LinkIcon className="size-4" />
              Share
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between px-3 lg:px-6 py-3 border-t border-border overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <TaskFilters filters={filters} onFiltersChange={onFiltersChange} />
            <TaskSort sortBy={sortBy} onSortChange={onSortChange} />

          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 hidden lg:flex font-normal"
                >
                  <CalendarIcon className="size-4" />
                  {date
                    ? date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="end"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  captionLayout="dropdown"
                  onSelect={(selectedDate: Date | undefined) => {
                    setDate(selectedDate);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
            <TaskImportExport board={board} />
            <Button size="sm" className="sm:gap-2 shrink-0" onClick={onCreateTask}>
              <Plus className="size-4" />
              <span className="hidden sm:inline">New task</span>
            </Button>
          </div>
        </div>
      </div>

    </>
  );
}

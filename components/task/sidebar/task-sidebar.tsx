"use client";

import { useState, useCallback } from "react";
import {
  Bell,
  LayoutGrid,
  Circle,
  Star,
  FileCheck,
  FileText,
  Calendar,
  Users,
  ChevronDown,
  Folder,
  Search,
  Check,
  Plus,
  History,
  ArrowLeft,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Kbd } from "@/components/ui/kbd";
import { useSearchTasks } from "@/hooks/use-tasks";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type SidebarView =
  | "board"
  | "assigned"
  | "tasks"
  | "schedule"
  | "activity"
  | "members"
  | "settings";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon, label, badge, active, onClick }: SidebarItemProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-between px-3 py-2 h-auto text-sm",
        active
          ? "bg-muted text-foreground font-medium"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge && (
        <div className="bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center">
          {badge}
        </div>
      )}
    </Button>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        className="gap-2 px-1 mb-2 text-xs h-auto py-0 text-muted-foreground hover:text-foreground"
      >
        <span>{title}</span>
        <ChevronDown className="size-3" />
      </Button>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

interface TaskSidebarProps extends React.ComponentProps<typeof Sidebar> {
  board?: any;
  activeView?: SidebarView;
  onViewChange?: (view: SidebarView) => void;
  onTaskSelect?: (taskId: string) => void;
  onListClick?: (listId: string) => void;
}

export function TaskSidebar({
  board,
  activeView = "board",
  onViewChange,
  onTaskSelect,
  onListClick,
  ...props
}: TaskSidebarProps) {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults } = useSearchTasks(
    board?.id || "",
    searchQuery,
    1
  );

  const boardInitials = board?.title
    ?.split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "TF";

  const handleViewChange = (view: SidebarView) => {
    onViewChange?.(view);
  };

  // Count tasks assigned to me
  const myTaskCount =
    board?.lists?.reduce((count: number, list: any) => {
      return (
        count +
        (list.tasks?.filter((t: any) =>
          t.assignees?.some(
            (a: any) => a.id === user?.id || a.userId === user?.id
          )
        )?.length || 0)
      );
    }, 0) || 0;

  // Count all tasks
  const totalTaskCount =
    board?.lists?.reduce(
      (count: number, list: any) => count + (list.tasks?.length || 0),
      0
    ) || 0;

  // Count tasks with due dates
  const scheduledCount =
    board?.lists?.reduce((count: number, list: any) => {
      return (
        count +
        (list.tasks?.filter((t: any) => t.dueDate)?.length || 0)
      );
    }, 0) || 0;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="pb-0">
        <div className="px-4 pt-4 pb-0">
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 h-auto p-0! hover:bg-transparent"
                >
                  <div className="size-6 bg-linear-to-br from-purple-500 to-pink-600 rounded-sm shadow flex items-center justify-center text-white text-xs font-semibold">
                    {boardInitials}
                  </div>
                  <span className="font-semibold truncate max-w-[120px]">
                    {board?.title || "TaskFlow"}
                  </span>
                  <ChevronDown className="size-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuItem asChild>
                  <Link href="/boards" className="flex items-center gap-3 w-full">
                    <ArrowLeft className="size-4" />
                    <span>All Boards</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div className="flex items-center gap-3 w-full">
                    <div className="size-6 bg-linear-to-br from-purple-500 to-pink-600 rounded-sm shadow flex items-center justify-center text-white text-xs font-semibold">
                      {boardInitials}
                    </div>
                    <span className="font-semibold">{board?.title}</span>
                    <Check className="size-4 ml-auto" />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user && (
              <Avatar className="size-6">
                <AvatarImage src={user.imageUrl} />
                <AvatarFallback className="text-[10px]">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          <div className="mt-4 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-10 text-xs h-8 bg-background"
            />
            <Kbd className="absolute right-2 top-1/2 -translate-y-1/2">/</Kbd>
          </div>

          {/* Search Results */}
          {searchQuery && searchResults?.tasks?.length > 0 && (
            <div className="mt-2 max-h-60 overflow-y-auto rounded-md border border-border bg-background p-2 space-y-1">
              {searchResults.tasks.map((task: any) => (
                <div
                  key={task.id}
                  className="p-2 rounded-md hover:bg-muted text-xs cursor-pointer"
                  onClick={() => {
                    onTaskSelect?.(task.id);
                    setSearchQuery("");
                  }}
                >
                  <p className="font-medium truncate">{task.title}</p>
                  {task.description && (
                    <p className="text-muted-foreground truncate mt-0.5">
                      {task.description}
                    </p>
                  )}
                </div>
              ))}
              {searchResults.totalPages > 1 && (
                <p className="text-[10px] text-muted-foreground text-center pt-1">
                  {searchResults.total} results found
                </p>
              )}
            </div>
          )}
          {searchQuery && searchResults?.tasks?.length === 0 && (
            <div className="mt-2 p-3 rounded-md border border-border bg-background text-center">
              <p className="text-xs text-muted-foreground">No tasks found</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <div className="space-y-0.5 mb-6">
          <SidebarItem
            icon={<LayoutGrid className="size-4" />}
            label="Board View"
            active={activeView === "board"}
            onClick={() => handleViewChange("board")}
          />
          <SidebarItem
            icon={<Circle className="size-4" />}
            label="Assigned to me"
            active={activeView === "assigned"}
            badge={myTaskCount > 0 ? myTaskCount.toString() : undefined}
            onClick={() => handleViewChange("assigned")}
          />
          <SidebarItem
            icon={<Star className="size-4" />}
            label="All Tasks"
            active={activeView === "tasks"}
            badge={totalTaskCount > 0 ? totalTaskCount.toString() : undefined}
            onClick={() => handleViewChange("tasks")}
          />
          <SidebarItem
            icon={<Calendar className="size-4" />}
            label="Schedule"
            active={activeView === "schedule"}
            badge={scheduledCount > 0 ? scheduledCount.toString() : undefined}
            onClick={() => handleViewChange("schedule")}
          />
          <SidebarItem
            icon={<History className="size-4" />}
            label="Activity"
            active={activeView === "activity"}
            onClick={() => handleViewChange("activity")}
          />
        </div>

        {/* Board Members */}
        {board?.members && board.members.length > 0 && (
          <SidebarSection title="Members">
            {board.members.map((member: any) => (
              <div
                key={member.userId}
                className="flex items-center gap-3 px-3 py-1.5 text-sm text-muted-foreground"
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
                <span className="truncate">
                  {member.user?.name || member.user?.email}
                </span>
                <span className="text-[10px] ml-auto capitalize opacity-60">
                  {member.role}
                </span>
              </div>
            ))}
          </SidebarSection>
        )}

        {/* Board Lists summary */}
        {board?.lists && (
          <SidebarSection title="Lists">
            {board.lists.map((list: any) => (
              <SidebarItem
                key={list.id}
                icon={<Folder className="size-4" />}
                label={list.title}
                badge={list.tasks?.length?.toString()}
                onClick={() => onListClick?.(list.id)}
              />
            ))}
          </SidebarSection>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-0.5">
        <SidebarItem
          icon={<Users className="size-4" />}
          label="Members"
          active={activeView === "members"}
          onClick={() => handleViewChange("members")}
        />
        <SidebarItem
          icon={<Settings className="size-4" />}
          label="Settings"
          active={activeView === "settings"}
          onClick={() => handleViewChange("settings")}
        />
      </SidebarFooter>
    </Sidebar>
  );
}

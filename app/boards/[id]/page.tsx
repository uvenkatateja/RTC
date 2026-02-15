'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { TaskSidebar, SidebarView } from '@/components/task/sidebar/task-sidebar';
import { TaskHeader } from '@/components/task/header/task-header';
import { TaskBoard } from '@/components/task/board/task-board';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useBoard } from '@/hooks/use-boards';
import { useRealtimeBoard } from '@/hooks/use-realtime';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FilterState } from '@/components/task/header/task-filters';
import { ActivityPanel } from '@/components/task/activity-panel';
import { MembersPanel } from '@/components/task/members-panel';
import { SettingsPanel } from '@/components/task/settings-panel';
import { SchedulePanel } from '@/components/task/schedule-panel';
import { TaskDetailSheet } from '@/components/task/board/task-detail-sheet';
import { TaskCreateDialog } from '@/components/task/board/task-create-dialog';

export default function BoardPage() {
  const params = useParams();
  const boardId = params.id as string;

  const { data: board, isLoading, error } = useBoard(boardId);
  const [filters, setFilters] = useState<FilterState>({ priority: 'all', assignee: 'all' });
  const [sortBy, setSortBy] = useState('status');
  const [sidebarView, setSidebarView] = useState<SidebarView>('board');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Find selected task object
  const selectedTask = board?.lists?.flatMap((l: any) => l.tasks || [])
    .find((t: any) => t.id === selectedTaskId);

  // Connect to real-time updates for this board
  useRealtimeBoard(boardId);

  // Handle sidebar view changes — some views apply filters, others open panels
  const handleViewChange = (view: SidebarView) => {
    // Close any open panels first by switching view
    setSidebarView(view);

    // Apply filters based on view
    switch (view) {
      case 'board':
        // Reset to default view
        setFilters({ priority: 'all', assignee: 'all' });
        setSortBy('status');
        break;
      case 'assigned':
        // Filter to "assigned to me"
        setFilters({ priority: 'all', assignee: 'me' });
        break;
      case 'tasks':
        // Show all tasks (clear filters)
        setFilters({ priority: 'all', assignee: 'all' });
        break;
      // schedule, activity, members, settings are handled as panel overlays
    }
  };

  const handleListClick = (listId: string) => {
    setSidebarView('board');
    setTimeout(() => {
      const element = document.getElementById(listId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'center' });
      }
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Board not found</h2>
          <p className="text-muted-foreground mb-4">
            This board doesn't exist or you don't have access to it.
          </p>
          <Button asChild>
            <Link href="/boards">← Back to boards</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Determine which panel to show
  const showActivity = sidebarView === 'activity';
  const showMembers = sidebarView === 'members';
  const showSettings = sidebarView === 'settings';
  const showSchedule = sidebarView === 'schedule';

  const closePanel = () => setSidebarView('board');

  return (
    <SidebarProvider>
      <TaskSidebar
        board={board}
        activeView={sidebarView}
        onViewChange={handleViewChange}
        onTaskSelect={setSelectedTaskId}
        onListClick={handleListClick}
      />
      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        <TaskHeader
          board={board}
          filters={filters}
          onFiltersChange={setFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          activeView={sidebarView}
          onViewChange={handleViewChange}
          onCreateTask={() => setShowCreateDialog(true)}
        />
        <main className="w-full h-full overflow-x-auto">
          <TaskBoard
            board={board}
            filters={filters}
            sortBy={sortBy}
            onTaskSelect={setSelectedTaskId}
          />
        </main>
      </div>

      <TaskDetailSheet
        task={selectedTask}
        board={board}
        open={!!selectedTaskId}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
      />

      {/* Overlay Panels */}
      {showActivity && (
        <ActivityPanel boardId={board.id} onClose={closePanel} />
      )}
      {showMembers && (
        <MembersPanel
          boardId={board.id}
          members={board.members || []}
          ownerId={board.ownerId}
          onClose={closePanel}
        />
      )}
      {showSettings && (
        <SettingsPanel board={board} onClose={closePanel} />
      )}
      {showSchedule && (
        <SchedulePanel board={board} onClose={closePanel} />
      )}

      <TaskCreateDialog
        board={board}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </SidebarProvider>
  );
}

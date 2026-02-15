// Shared types derived from Drizzle schema
// These types are used across frontend and backend

export interface UserType {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BoardType {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListType {
  id: string;
  boardId: string;
  title: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskType {
  id: string;
  listId: string;
  title: string;
  description: string | null;
  position: number;
  priority: 'no-priority' | 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string | null;
  progressCompleted: number;
  progressTotal: number;
  commentsCount: number;
  attachmentsCount: number;
  linksCount: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LabelType {
  id: string;
  boardId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface TaskAssigneeType {
  taskId: string;
  userId: string;
  assignedAt: string;
}

export interface TaskLabelType {
  taskId: string;
  labelId: string;
}

export interface ActivityLogType {
  id: string;
  boardId: string | null;
  userId: string | null;
  actionType: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  user?: UserType | null;
}

export interface BoardMemberType {
  boardId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user?: UserType;
}

// Extended types with relations
export interface TaskWithRelations extends TaskType {
  assignees: UserType[];
  labels: LabelType[];
}

export interface ListWithTasks extends ListType {
  tasks: TaskWithRelations[];
}

export interface BoardWithDetails extends BoardType {
  lists: ListWithTasks[];
  members: BoardMemberType[];
  owner?: UserType;
}

// API request/response types
export interface CreateBoardRequest {
  title: string;
  description?: string;
}

export interface CreateListRequest {
  boardId: string;
  title: string;
}

export interface CreateTaskRequest {
  listId: string;
  title: string;
  description?: string;
  priority?: TaskType['priority'];
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: TaskType['priority'];
  dueDate?: string | null;
  progressCompleted?: number;
  progressTotal?: number;
}

export interface MoveTaskRequest {
  listId: string;
  position: number;
}

export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  priority?: string;
  assignee?: string;
}

// Real-time event types
export interface RealtimeEvent {
  type: 'task_created' | 'task_updated' | 'task_deleted' | 'task_moved' |
        'list_created' | 'list_updated' | 'list_deleted' |
        'board_updated' | 'member_added' | 'member_removed';
  boardId: string;
  payload: any;
  userId: string;
  timestamp: string;
}

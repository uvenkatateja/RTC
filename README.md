
# 📋 TaskFlow - Real-Time Task Collaboration Platform

A modern, full-stack task management application built with Next.js, Drizzle ORM, Clerk Authentication, and real-time capabilities via Ably. Designed to be a lightweight, high-performance alternative to Trello/Notion.

## 🚀 Features

-   **Authentication**: Secure signup/login via Clerk (Google, Email, etc.).
-   **Boards & Lists**: Create unlimited boards and organize tasks into lists.
-   **Task Management**: Create, update, delete, and organize tasks.
-   **Drag & Drop**: Smooth drag-and-drop interface for tasks and lists (`@dnd-kit`).
-   **Real-time Collaboration**: Instant updates across all connected clients (tasks move live!).
-   **Members**: Invite team members to boards via email.
-   **Activity Log**: detailed history of all actions on the board.
-   **Search & Filtering**: Powerful search and filtering capabilities.
-   **Export**: Export boards to JSON, CSV, or Markdown.
-   **Dark Mode**: Fully supports light and dark themes.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
-   **Language**: TypeScript
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **UI Components**: [Shadcn/ui](https://ui.shadcn.com/) (Radix UI)
-   **State Management**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
-   **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Toast Notifications**: [Sonner](https://sonner.emilkowal.ski/)

### Backend
-   **API**: Next.js API Routes (Serverless Functions)
-   **Database**: PostgreSQL (via [Neon Serverless](https://neon.tech/))
-   **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
-   **Auth**: [Clerk](https://clerk.com/)
-   **Real-time**: [Ably](https://ably.com/) (WebSockets)

## 🏗️ Architecture

### Database Schema
The database is normalized and built on PostgreSQL. Key tables:

-   **Users**: Managed by Clerk (synced via webhooks or on-demand).
-   **Boards**: `id`, `title`, `owner_id`, `created_at`
-   **Lists**: `id`, `board_id`, `title`, `position` (for ordering)
-   **Tasks**: `id`, `list_id`, `title`, `description`, `priority`, `due_date`, `position`
-   **BoardMembers**: `board_id`, `search_id`, `role` (owner/member)
-   **ActivityLogs**: `id`, `board_id`, `user_id`, `action_type`, `entity_type`, `metadata`

### Real-time Strategy
We use **Ably** for reliable Pub/Sub messaging.
1.  **Events**: When a user performs an action (e.g., moves a task), the API updates the database *and* publishes a message to the board's Ably channel.
2.  **Clients**: All clients connected to that board subscribe to the channel.
3.  **Sync**: Upon receiving a message (e.g., `task_moved`), the client creates an optimistic update or invalidates the React Query cache to re-fetch latest data instantly.

## 🚀 Getting Started

### Prerequisites
-   Node.js 18+
-   pnpm (recommended) or npm
-   PostgreSQL database (Neon recommended)
-   Clerk account
-   Ably account

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/taskflow.git
    cd taskflow
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    # Database
    DATABASE_URL="postgresql://..."

    # Authentication (Clerk)
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
    CLERK_SECRET_KEY="sk_test_..."

    # Real-time (Ably)
    ABLY_API_KEY="root:..."
    ```

4.  **Database Migration**
    Push the schema to your database:
    ```bash
    pnpm db:push
    ```

5.  **Run Development Server**
    ```bash
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 API Documentation

### Boards
-   `GET /api/boards` - List all boards involved with.
-   `POST /api/boards` - Create a new board.
-   `GET /api/boards/[id]` - Get full board details (lists, tasks, members).
-   `DELETE /api/boards/[id]` - Delete a board.

### Lists
-   `POST /api/lists` - Create a new list.
-   `PATCH /api/lists/[id]` - Update list (title, position).
-   `DELETE /api/lists/[id]` - Delete a list.

### Tasks
-   `POST /api/tasks` - Create a new task.
-   `PATCH /api/tasks/[id]` - Update task details.
-   `DELETE /api/tasks/[id]` - Delete a task.
-   `PATCH /api/tasks/[id]/move` - Move task (change list/position).
-   `POST /api/tasks/[id]/assign` - Assign a user to a task.

### Members
-   `GET /api/boards/[id]/members` - List members.
-   `POST /api/boards/[id]/members` - Invite member by email.
-   `DELETE /api/boards/[id]/members` - Remove member.

## 🧪 Scalability Considerations

-   **Serverless Database**: Neon scales compute automatically to handle load spikes.
-   **Edge Caching**: Next.js App Router allows for granular caching policies.
-   **Optimistic UI**: Use of React Query ensures the app feels instant even on slower networks.
-   **WebSocket Offloading**: Using a managed service (Ably) prevents the backend from handling millions of open WebSocket connections, allowing the API to remain stateless and auto-scale.

---

Built with ❤️ by [Your Name] for the Full Stack Engineer Interview Assignment.

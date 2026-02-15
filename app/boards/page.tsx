"use client";

import { BoardList } from "@/components/workspace/board-list";
import {
  Clock,
  Filter,
  LayoutGrid,
  List,
  Search,
  LogOut,
  User,
  Plus,
  Command,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { CreateBoardDialog } from "@/components/workspace/create-board-dialog";

export default function BoardsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutGrid className="h-5 w-5" />
            </div>
            TaskFlow
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block w-full max-w-sm">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search boards..."
                className="h-9 w-64 rounded-md bg-muted px-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="hidden text-xs text-muted-foreground lg:inline-flex border border-border px-1.5 rounded-sm bg-background">
                  ⌘K
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
                    <AvatarFallback>
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.fullName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header >

      <main className="container max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Welcome back, {user?.firstName} 👋
            </h1>
            <p className="mt-2 text-muted-foreground text-lg">
              Manage your projects, collaborate with your team, and stay organized.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              className="gap-2 shadow-lg shadow-primary/20"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-5 w-5" />
              Create Board
            </Button>
          </div>
        </div>

        {/* Filters and Views Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-border/50 pb-4">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <Button variant="secondary" size="sm" className="h-8 px-3 shadow-none">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Grid
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-muted-foreground hover:text-foreground">
              <List className="mr-2 h-4 w-4" />
              List
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center text-sm text-muted-foreground mr-2">
              <span className="font-medium text-foreground mr-1">Sort by:</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Start Date</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Most Recent</DropdownMenuItem>
                <DropdownMenuItem>Oldest First</DropdownMenuItem>
                <DropdownMenuItem>Alphabetical</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>All Boards</DropdownMenuItem>
                <DropdownMenuItem>Favorites</DropdownMenuItem>
                <DropdownMenuItem>Archived</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Boards Grid */}
        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-1 bg-primary rounded-full"></div>
              <h2 className="text-xl font-semibold tracking-tight">Your Boards</h2>
            </div>

            <BoardList searchQuery={searchQuery} />
          </section>
        </div>
      </main>

      {/* Global Create Dialog - triggered by header button too if needed, but for now specific to page */}
      <CreateBoardDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div >
  );
}

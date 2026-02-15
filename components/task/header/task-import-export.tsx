"use client";

import * as React from "react";
import {
  ChevronDown,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskImportExportProps {
  board: any;
}

export function TaskImportExport({ board }: TaskImportExportProps) {
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(board, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${board.title.replace(/\s+/g, "_").toLowerCase()}_export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Board exported as JSON");
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Task ID,Title,Description,Status,Priority,Due Date\n";

    board.lists.forEach((list: any) => {
      list.tasks.forEach((task: any) => {
        const row = [
          task.id,
          `"${task.title.replace(/"/g, '""')}"`,
          `"${(task.description || "").replace(/"/g, '""')}"`,
          list.title,
          task.priority,
          task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "",
        ].join(",");
        csvContent += row + "\n";
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${board.title.replace(/\s+/g, "_").toLowerCase()}_tasks.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Board exported as CSV");
  };

  const handleExportMarkdown = () => {
    let mdContent = `# ${board.title}\n\n${board.description || ""}\n\n`;

    board.lists.forEach((list: any) => {
      mdContent += `## ${list.title}\n\n`;
      list.tasks.forEach((task: any) => {
        mdContent += `### ${task.title}\n`;
        if (task.description) mdContent += `${task.description}\n`;
        mdContent += `\n*Priority: ${task.priority}*`;
        if (task.dueDate) mdContent += ` | *Due: ${new Date(task.dueDate).toLocaleDateString()}*`;
        mdContent += `\n\n`;
      });
    });

    const blob = new Blob([mdContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${board.title.replace(/\s+/g, "_").toLowerCase()}_export.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Board exported as Markdown");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 hidden lg:flex">
          Export
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Download className="size-4" />
          Export Options
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={handleExportJSON}>
          <FileJson className="size-4" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileSpreadsheet className="size-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportMarkdown}>
          <FileText className="size-4" />
          Export as Markdown
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


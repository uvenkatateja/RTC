
import {
    Circle,
    CheckCircle2,
    HelpCircle,
    Timer,
    XCircle,
} from "lucide-react";

export const statuses = [
    {
        id: "todo",
        label: "Todo",
        icon: Circle,
    },
    {
        id: "in-progress",
        label: "In Progress",
        icon: Timer,
    },
    {
        id: "done",
        label: "Done",
        icon: CheckCircle2,
    },
    {
        id: "canceled",
        label: "Canceled",
        icon: XCircle,
    },
    {
        id: "backlog",
        label: "Backlog",
        icon: HelpCircle,
    },
];

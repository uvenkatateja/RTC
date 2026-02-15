import { cn } from '@/lib/utils'

const MESCHAC_AVATAR = 'https://avatars.githubusercontent.com/u/47919550?v=4'
const BERNARD_AVATAR = 'https://avatars.githubusercontent.com/u/31113941?v=4'
const THEO_AVATAR = 'https://avatars.githubusercontent.com/u/68236786?v=4'
const GLODIE_AVATAR = 'https://avatars.githubusercontent.com/u/99137927?v=4'

export const Table = ({ className }: { className?: string }) => {
    const tasks = [
        {
            id: "TASK-87",
            date: 'May 12, 2026',
            status: 'Done',
            statusVariant: 'success',
            assignee: 'Bernard Ng',
            avatar: BERNARD_AVATAR,
            priority: 'High',
        },
        {
            id: "TASK-88",
            date: 'May 15, 2026',
            status: 'In Progress',
            statusVariant: 'warning',
            assignee: 'Méschac Irung',
            avatar: MESCHAC_AVATAR,
            priority: 'Medium',
        },
        {
            id: "TASK-89",
            date: 'May 22, 2026',
            status: 'Done',
            statusVariant: 'success',
            assignee: 'Glodie Ng',
            avatar: GLODIE_AVATAR,
            priority: 'Low',
        },
        {
            id: "TASK-90",
            date: 'May 25, 2026',
            status: 'To Do',
            statusVariant: 'danger',
            assignee: 'Theo Ng',
            avatar: THEO_AVATAR,
            priority: 'High',
        },
    ]

    return (
        <div className={cn('bg-background relative w-full overflow-hidden rounded-xl border border-border p-6 shadow-md', className)}>
            <div className="mb-6">
                <div className="flex gap-1.5 mb-2">
                    <div className="bg-muted h-3 w-3 rounded-full border border-border"></div>
                    <div className="bg-muted h-3 w-3 rounded-full border border-border"></div>
                    <div className="bg-muted h-3 w-3 rounded-full border border-border"></div>
                </div>
                <div className="text-lg font-semibold">Active Tasks</div>
                <p className="text-sm text-muted-foreground">Recent updates from your team's sprint board</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="px-4 py-3 rounded-l-md">Task ID</th>
                            <th className="px-4 py-3">Due Date</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Assignee</th>
                            <th className="px-4 py-3 rounded-r-md">Priority</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {tasks.map((task) => (
                            <tr key={task.id}>
                                <td className="px-4 py-3 font-mono text-xs">{task.id}</td>
                                <td className="px-4 py-3">{task.date}</td>
                                <td className="px-4 py-3">
                                    <span className={cn(
                                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                        task.statusVariant === 'success' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                        task.statusVariant === 'danger' && 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
                                        task.statusVariant === 'warning' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    )}>
                                        {task.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 overflow-hidden rounded-full bg-muted">
                                            <img
                                                src={task.avatar}
                                                alt={task.assignee}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <span className="font-medium">{task.assignee}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn(
                                        "font-medium",
                                        task.priority === 'High' ? "text-red-500" :
                                            task.priority === 'Medium' ? "text-yellow-500" :
                                                "text-blue-500"
                                    )}>
                                        {task.priority}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

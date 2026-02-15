import { cn } from '@/lib/utils'

const MESCHAC_AVATAR = 'https://avatars.githubusercontent.com/u/47919550?v=4'
const BERNARD_AVATAR = 'https://avatars.githubusercontent.com/u/31113941?v=4'
const THEO_AVATAR = 'https://avatars.githubusercontent.com/u/68236786?v=4'
const GLODIE_AVATAR = 'https://avatars.githubusercontent.com/u/99137927?v=4'

export const Table = ({ className }: { className?: string }) => {
    const customers = [
        {
            id: 1,
            date: '10/31/2023',
            status: 'Paid',
            statusVariant: 'success',
            name: 'Bernard Ng',
            avatar: BERNARD_AVATAR,
            revenue: '$43.99',
        },
        {
            id: 2,
            date: '10/21/2023',
            status: 'Ref',
            statusVariant: 'warning',
            name: 'Méschac Irung',
            avatar: MESCHAC_AVATAR,
            revenue: '$19.99',
        },
        {
            id: 3,
            date: '10/15/2023',
            status: 'Paid',
            statusVariant: 'success',
            name: 'Glodie Ng',
            avatar: GLODIE_AVATAR,
            revenue: '$99.99',
        },
        {
            id: 4,
            date: '10/12/2023',
            status: 'Cancelled',
            statusVariant: 'danger',
            name: 'Theo Ng',
            avatar: THEO_AVATAR,
            revenue: '$19.99',
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
                <div className="text-lg font-semibold">Customers</div>
                <p className="text-sm text-muted-foreground">New users by First user primary channel group</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="px-4 py-3 rounded-l-md">#</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3 rounded-r-md">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {customers.map((customer) => (
                            <tr key={customer.id}>
                                <td className="px-4 py-3">{customer.id}</td>
                                <td className="px-4 py-3">{customer.date}</td>
                                <td className="px-4 py-3">
                                    <span className={cn(
                                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                        customer.statusVariant === 'success' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                        customer.statusVariant === 'danger' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                                        customer.statusVariant === 'warning' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    )}>
                                        {customer.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 overflow-hidden rounded-full bg-muted">
                                            <img
                                                src={customer.avatar}
                                                alt={customer.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <span className="font-medium">{customer.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">{customer.revenue}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

import Skeleton from '@/components/Skeleton'

// Mirrors the layout of src/app/tasks/page.tsx so content fills in without shifting.
export default function TaskListSkeleton() {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 text-lg">
            {/* Header: title, count and Add a task button */}
            <div className="flex flex-wrap justify-between items-end gap-x-8 gap-y-4 mb-10">
                <div>
                    <Skeleton className="h-16 w-72 max-w-full" />
                    <Skeleton className="h-6 w-28 mt-3" />
                </div>
                <Skeleton className="h-12 w-32" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-6 mb-6">
                {['w-8', 'w-24', 'w-24', 'w-12'].map((width, i) => (
                    <Skeleton key={i} className={`h-6 my-2.5 ${width}`} />
                ))}
            </div>

            <ul className="border-b border-ink">
                {Array.from({ length: 4 }, (_, i) => (
                    <li key={i} className="flex flex-wrap justify-between gap-x-8 gap-y-3 py-5 border-t border-ink">
                        <div className="flex-[3_1_18rem] min-w-0">
                            <Skeleton className="h-8 w-64 max-w-full" />
                            <Skeleton className="h-6 w-56 max-w-full mt-1" />
                            <Skeleton className="h-6 w-20 mt-1" />
                        </div>
                        <div className="flex-[1_1_15rem] min-w-0">
                            <Skeleton className="h-12 w-40" />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

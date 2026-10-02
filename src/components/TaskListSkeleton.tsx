import Skeleton from '@/components/Skeleton'

// Mirrors the layout of src/app/tasks/page.tsx so content fills in without shifting.
export default function TaskListSkeleton() {
    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                {/* Header: "Tasks" + Add Task button */}
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-9 w-28" />
                    <Skeleton className="h-9 w-24 rounded-md" />
                </div>

                {/* Stats: 4 cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                                    <div className="ml-5 flex-1">
                                        <Skeleton className="h-4 w-20 my-0.5" />
                                        <Skeleton className="h-5 w-8 my-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <div className="-mb-px flex space-x-8">
                            {['w-24', 'w-20', 'w-24', 'w-24'].map((width, i) => (
                                <div key={i} className="py-2 px-1 border-b-2 border-transparent">
                                    <Skeleton className={`h-4 my-0.5 ${width}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Task cards */}
                <div className="space-y-4">
                    {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    {/* Title + status and priority pills */}
                                    <div className="flex items-center space-x-3 mb-2">
                                        <Skeleton className="h-5 w-48 my-1" />
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                        <Skeleton className="h-6 w-24 rounded-full" />
                                    </div>
                                    {/* Description */}
                                    <Skeleton className="h-4 w-3/4 my-1 mb-4" />
                                    {/* Client / Due / Created */}
                                    <div className="flex items-center space-x-4">
                                        <Skeleton className="h-4 w-32 my-0.5" />
                                        <Skeleton className="h-4 w-24 my-0.5" />
                                        <Skeleton className="h-4 w-28 my-0.5" />
                                    </div>
                                </div>
                                {/* Action buttons */}
                                <div className="flex items-center space-x-2 ml-4">
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-5 w-8" />
                                    <Skeleton className="h-5 w-12" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

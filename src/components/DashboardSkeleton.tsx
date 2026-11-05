import Skeleton from '@/components/Skeleton'

// Mirrors the layout of src/app/page.tsx so content fills in without shifting.
export default function DashboardSkeleton() {
    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                {/* Header: title + subtitle (centered) */}
                <div className="flex flex-col items-center mb-8">
                    <Skeleton className="h-10 w-80 mb-4" />
                    <Skeleton className="h-5 w-72 my-1" />
                </div>

                {/* Stats: 3 cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <Skeleton className="h-8 w-8 flex-shrink-0" />
                                    <div className="ml-5 flex-1">
                                        <Skeleton className="h-4 w-24 my-0.5" />
                                        <Skeleton className="h-8 w-12 my-0.5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick actions: 2 cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {Array.from({ length: 2 }, (_, i) => (
                        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <div className="flex items-center">
                                <Skeleton className="h-9 w-9 mr-4 flex-shrink-0" />
                                <div className="flex-1">
                                    <Skeleton className="h-5 w-36 my-1" />
                                    <Skeleton className="h-4 w-64 max-w-full my-1" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

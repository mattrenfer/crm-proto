import Skeleton from '@/components/Skeleton'

// Mirrors the layout of src/app/clients/[id]/page.tsx (Tasks tab) so content fills in without shifting.
export default function ClientDetailSkeleton() {
    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                {/* Header: back link + client info card */}
                <div className="mb-6">
                    <Skeleton className="h-4 w-32 my-1 mb-5" />
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-9 w-56" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from({ length: 4 }, (_, i) => (
                                <div key={i}>
                                    <Skeleton className="h-4 w-16 my-0.5" />
                                    <Skeleton className="h-4 w-44 my-1" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabs: Tasks / Notes */}
                <div className="mb-6">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <div className="-mb-px flex space-x-8">
                            {['w-20', 'w-20'].map((width, i) => (
                                <div key={i} className="py-2 px-1 border-b-2 border-transparent">
                                    <Skeleton className={`h-4 my-0.5 ${width}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tasks header: "Tasks" + Add Task button */}
                <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-6 w-20 my-0.5" />
                    <Skeleton className="h-9 w-24 rounded-md" />
                </div>

                {/* Task cards */}
                <div className="space-y-4">
                    {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <Skeleton className="h-5 w-56 my-1" />
                                    <Skeleton className="h-4 w-2/3 mt-2 mb-1" />
                                    <div className="mt-2 flex items-center space-x-4">
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                        <Skeleton className="h-6 w-24 rounded-full" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Skeleton className="h-5 w-24" />
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

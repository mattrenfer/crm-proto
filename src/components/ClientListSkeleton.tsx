import Skeleton from '@/components/Skeleton'

// Mirrors the layout of src/app/clients/page.tsx so content fills in without shifting.
// Block heights match the line heights of the text they stand in for.
export default function ClientListSkeleton() {
    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                {/* Header: "Clients" + Add Client button */}
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-28 rounded-md" />
                </div>

                {/* Clients list card */}
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {Array.from({ length: 5 }, (_, i) => (
                            <li key={i}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Skeleton className="h-4 w-40 my-0.5" />
                                            <Skeleton className="h-4 w-56 my-0.5" />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Skeleton className="h-5 w-10" />
                                            <Skeleton className="h-5 w-8" />
                                            <Skeleton className="h-5 w-12" />
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

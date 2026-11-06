import Skeleton from '@/components/Skeleton'

// Mirrors the layout of src/app/clients/page.tsx so content fills in without shifting.
export default function ClientListSkeleton() {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 text-lg">
            {/* Header: title, count and Add a client button */}
            <div className="flex flex-wrap justify-between items-end gap-x-8 gap-y-4 mb-10">
                <div>
                    <Skeleton className="h-16 w-72 max-w-full" />
                    <Skeleton className="h-6 w-24 mt-3" />
                </div>
                <Skeleton className="h-12 w-36" />
            </div>

            <ul className="border-b border-ink">
                {Array.from({ length: 5 }, (_, i) => (
                    <li key={i} className="flex flex-wrap justify-between gap-x-8 gap-y-2 py-5 border-t border-ink">
                        <div className="flex-[2_1_16rem] min-w-0">
                            <Skeleton className="h-8 w-56 max-w-full" />
                            <Skeleton className="h-6 w-72 max-w-full mt-1" />
                        </div>
                        <div className="flex-[1_1_13rem] min-w-0">
                            <Skeleton className="h-6 w-44 max-w-full" />
                            <Skeleton className="h-6 w-20 mt-1" />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

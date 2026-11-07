import Skeleton from '@/components/Skeleton'

// Mirrors the layout of src/app/clients/[id]/page.tsx so content fills in without shifting.
export default function ClientDetailSkeleton() {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 text-lg">
            {/* Header: back link, name, contact line */}
            <div className="mb-10">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-20 w-2/3 max-w-full mt-4" />
                <Skeleton className="h-6 w-96 max-w-full mt-4" />
            </div>

            <div className="flex flex-wrap items-start gap-x-16 gap-y-10">
                {/* Notes */}
                <div className="flex-[3_1_26rem] min-w-0">
                    <Skeleton className="h-10 w-40" />
                    {Array.from({ length: 2 }, (_, i) => (
                        <div key={i} className="mt-5 pt-5 border-t border-ink">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-7 w-full mt-2" />
                            <Skeleton className="h-7 w-5/6 mt-1" />
                        </div>
                    ))}
                </div>

                {/* Tasks */}
                <div className="flex-[2_1_18rem] min-w-0">
                    <Skeleton className="h-10 w-40" />
                    {Array.from({ length: 2 }, (_, i) => (
                        <div key={i} className="mt-5 pt-5 border-t border-ink">
                            <Skeleton className="h-7 w-48 max-w-full" />
                            <Skeleton className="h-6 w-24 mt-1" />
                            <Skeleton className="h-12 w-full mt-3" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

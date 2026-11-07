import Skeleton from '@/components/Skeleton'

// Mirrors the layout of src/app/page.tsx so content fills in without shifting.
export default function DashboardSkeleton() {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 text-lg">
            {/* Masthead */}
            <div className="flex flex-col items-center gap-3">
                <Skeleton className="h-[clamp(4rem,13vw,10rem)] w-3/5" />
                <div className="w-full pt-3 border-t-4 border-double border-ink">
                    <Skeleton className="h-7 w-full" />
                </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-x-16 gap-y-10">
                {/* Lead story */}
                <div className="flex-[2_1_26rem] min-w-0">
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-16 w-full mt-4" />
                    <Skeleton className="h-16 w-2/3 mt-2" />
                </div>

                {/* Also next */}
                <div className="flex-[1_1_18rem] min-w-0 pt-4 border-t border-ink">
                    <Skeleton className="h-8 w-32" />
                    {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="mt-4">
                            <Skeleton className="h-7 w-full" />
                            <Skeleton className="h-7 w-20 mt-1" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

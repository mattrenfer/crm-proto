import type { ReactNode } from 'react'

// The headline at the top of a page, with an optional line under it and a button beside it.
export default function PageHeader({
    title,
    subtitle,
    children,
}: {
    title: string
    subtitle?: string
    children?: ReactNode
}) {
    return (
        <header className="flex flex-wrap justify-between items-end gap-x-8 gap-y-4 mb-10">
            <div>
                <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none tracking-tight">{title}</h1>
                {subtitle && <p className="mt-3 italic">{subtitle}</p>}
            </div>
            {children}
        </header>
    )
}

'use client'

import { describeDue } from '@/lib/dates'
import { useEffect, useState } from 'react'

/**
 * Shows a due date in plain words, using the visitor's clock.
 * The dashboard renders on the server, which runs on UTC, so "Today" worked out there
 * could be a day off in the evening. Waiting for the browser gets it right.
 */
export default function DueLabel({ date }: { date?: string | null }) {
    const [due, setDue] = useState<ReturnType<typeof describeDue> | null>(null)

    useEffect(() => {
        setDue(describeDue(date))
    }, [date])

    return (
        <p className={due?.needsYou ? 'italic font-semibold text-accent' : 'italic'}>
            {/* The non-breaking space holds the line's height until the label appears */}
            {due?.label ?? ' '}
        </p>
    )
}

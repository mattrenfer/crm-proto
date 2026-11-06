// Due dates come from Postgres as 'YYYY-MM-DD', with no time or time zone.
// new Date('2026-11-03') reads that as midnight UTC, which is still Nov 2 in US time zones,
// so build the date from its parts in local time instead.
export function formatDate(date: string) {
    const [year, month, day] = date.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString() // JS months start at 0
}

// Turns a due date into plain words. needsYou marks today and anything past due.
export function describeDue(date: string | null | undefined, today = new Date()) {
    if (!date) return { label: 'No due date', needsYou: false }

    const [year, month, day] = date.split('-').map(Number)
    const due = new Date(year, month - 1, day)
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const daysAway = Math.round((due.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000))

    if (daysAway < 0) return { label: 'Still on your list', needsYou: true }
    if (daysAway === 0) return { label: 'Today', needsYou: true }
    if (daysAway === 1) return { label: 'Tomorrow', needsYou: false }
    if (daysAway < 7) return { label: due.toLocaleDateString(undefined, { weekday: 'long' }), needsYou: false }
    return { label: due.toLocaleDateString(undefined, { month: 'long', day: 'numeric' }), needsYou: false }
}

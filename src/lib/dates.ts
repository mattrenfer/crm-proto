// Due dates come from Postgres as 'YYYY-MM-DD', with no time or time zone.
// new Date('2026-11-03') reads that as midnight UTC, which is still Nov 2 in US time zones,
// so build the date from its parts in local time instead.
export function formatDate(date: string) {
    const [year, month, day] = date.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString() // JS months start at 0
}

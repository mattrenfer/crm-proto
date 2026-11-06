'use client'

import { useEffect, useState } from 'react'

// Today's date from the visitor's clock, for the same reason as DueLabel.
export default function TodayDate() {
    const [today, setToday] = useState(' ')

    useEffect(() => {
        setToday(new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))
    }, [])

    return <span>{today}</span>
}

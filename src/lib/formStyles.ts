// Shared classes, so every form and button in the app stays the same.
export const labelClass = 'block font-semibold mb-1'
export const inputClass =
    'block w-full min-h-12 px-3 bg-sheet text-ink border border-ink rounded-sm placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed'
export const errorClass = 'mt-1 text-danger'
export const buttonClass =
    'inline-flex items-center justify-center min-h-12 px-5 bg-accent text-on-accent font-semibold rounded-sm cursor-pointer hover:bg-ink focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
export const secondaryButtonClass =
    'inline-flex items-center justify-center min-h-12 px-5 text-ink border border-ink rounded-sm cursor-pointer hover:bg-sheet focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
// Quiet actions like Edit and Delete, which sit on every row
export const textButtonClass =
    'min-h-11 px-1 underline underline-offset-4 cursor-pointer hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed'

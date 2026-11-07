import { useEffect, useRef, useId } from 'react'

interface ConfirmProps {
    open: boolean
    onConfirm: () => void
    onCancel: () => void
    isDeleting: boolean
    confirmLabel: string
    confirmDescription?: string
}

export default function ConfirmDialog({
    open,
    onConfirm,
    onCancel,
    isDeleting,
    confirmLabel,
    confirmDescription,
}: ConfirmProps) {
    const dialogModal = useRef<HTMLDialogElement | null>(null)
    const titleId = useId()
    const descriptionId = useId()

    useEffect(() => {
        const modal = dialogModal.current

        if (modal === null) return

        if (open && !modal.open) {
            modal.showModal()
        } else if (!open && modal.open) {
            modal.close()
        }
    }, [open])

    return (
        <dialog
            onClose={onCancel}
            ref={dialogModal}
            className="p-6 bg-paper text-ink border border-ink rounded-sm shadow-xl backdrop:bg-black/50 open:flex open:flex-col m-auto"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
        >
            <div className="flex flex-col gap-2 items-center mb-4">
                <h2 className="font-display text-2xl text-center" id={titleId}>
                    {confirmLabel}
                </h2>
                {confirmDescription && (
                    <p className="text-muted text-center" id={descriptionId}>
                        {confirmDescription}
                    </p>
                )}
            </div>
            <div className="flex flex-row gap-2 items-center">
                <button
                    onClick={() => onConfirm()}
                    disabled={isDeleting}
                    className="bg-danger text-on-accent px-4 min-h-12 rounded-sm w-full font-semibold cursor-pointer hover:bg-ink"
                >
                    {isDeleting ? 'Deleting...' : 'Confirm'}
                </button>
                <button
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="text-ink border border-ink px-4 min-h-12 rounded-sm w-full cursor-pointer hover:bg-sheet"
                >
                    Cancel
                </button>
            </div>
        </dialog>
    )
}

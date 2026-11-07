/**
 * The Handful wordmark: "Hand" in the display serif, "ful" in the teal italic.
 * Size comes from the caller through className, so the nav and login can share it.
 */
export default function Logo({ className = '' }: { className?: string }) {
    return (
        <span className={`font-display tracking-tight text-ink ${className}`}>
            Hand<span className="font-body font-semibold italic text-accent">ful</span>
        </span>
    )
}

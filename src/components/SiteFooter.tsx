import Link from 'next/link'

// Shown on every page. Says plainly that this is an early release, so the tagline can stay the tagline.
export default function SiteFooter() {
    return (
        <footer className="max-w-6xl mx-auto px-4 sm:px-8 pb-10 text-base">
            <div className="flex flex-wrap justify-between gap-x-8 gap-y-2 pt-4 border-t border-ink italic">
                <p>Handful is an early release, and it&apos;s still growing.</p>
                <p className="flex gap-x-6">
                    <Link href="/privacy" className="underline underline-offset-4 hover:text-accent">
                        Privacy
                    </Link>
                    <a href="https://matthewrenfer.com" className="underline underline-offset-4 hover:text-accent">
                        matthewrenfer.com
                    </a>
                </p>
            </div>
        </footer>
    )
}

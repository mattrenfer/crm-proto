import type { ReactNode } from 'react'
import Logo from '@/components/Logo'

/**
 * The front page for logged-out visitors: masthead, what Handful is, then the form.
 * This is where someone new meets the product, so it explains itself before asking for a password.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-paper text-ink text-lg px-4 sm:px-8 py-8">
            <div className="max-w-6xl mx-auto flex flex-col gap-12">
                <header className="flex flex-col gap-3 text-center">
                    <p>
                        <Logo className="text-[clamp(4rem,13vw,10rem)] leading-none" />
                    </p>
                    <p className="pt-3 border-t-4 border-double border-ink italic">Just enough CRM</p>
                </header>

                <div className="flex flex-wrap items-start gap-x-16 gap-y-10">
                    <section className="flex-[3_1_24rem] min-w-0 flex flex-col gap-5">
                        <p className="font-display text-[clamp(2.25rem,5vw,4rem)] leading-tight tracking-tight text-balance">
                            Keep track of your clients, tasks and notes in one place.
                        </p>
                        <p>Clients can be a handful. Your CRM shouldn&apos;t be.</p>
                    </section>

                    <div className="flex-[2_1_20rem] min-w-0 pt-4 border-t border-ink">{children}</div>
                </div>
            </div>
        </div>
    )
}

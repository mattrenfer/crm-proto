import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy: Handful',
}

const CONTACT = 'matthewrussellrenfer@gmail.com'

const linkClass = 'underline underline-offset-4 hover:text-accent'

/**
 * A plain privacy note. Cloudflare requires one that links its Turnstile Privacy Addendum
 * when Turnstile runs in invisible mode. Readable signed in or out (see middleware).
 */
export default function PrivacyPage() {
    return (
        <article className="max-w-3xl mx-auto px-4 sm:px-8 py-10 text-lg flex flex-col gap-5">
            <header className="pb-4 border-b-4 border-double border-ink">
                <h1 className="font-display text-4xl">Privacy</h1>
                <p className="mt-2 italic">Last updated November 13, 2026</p>
            </header>

            <p>
                Handful is an early release, built and run by Matthew Renfer. This page says plainly what it keeps and
                who helps run it. Please don&apos;t store anything sensitive in it yet.
            </p>

            <h2 className="font-display text-2xl mt-5">What Handful keeps</h2>
            <ul className="list-disc pl-6 flex flex-col gap-2">
                <li>Your email address, and your password in scrambled (hashed) form, so you can sign in.</li>
                <li>
                    The clients, tasks and notes you add. Only your account can see them: the database checks that on
                    every request.
                </li>
            </ul>

            <h2 className="font-display text-2xl mt-5">The demo account</h2>
            <p>
                The demo is one account shared by every visitor, so anything typed into it can be seen by others. It
                resets every night. Please don&apos;t put anything real in it.
            </p>

            <h2 className="font-display text-2xl mt-5">Who helps run it</h2>
            <ul className="list-disc pl-6 flex flex-col gap-2">
                <li>
                    <strong>Supabase</strong> stores the data and handles sign-in.
                </li>
                <li>
                    <strong>Vercel</strong> hosts the site. Vercel Analytics counts page visits without cookies.
                </li>
                <li>
                    <strong>Resend</strong> sends Handful&apos;s emails, like sign-up confirmations and password resets.
                </li>
                <li>
                    <strong>Cloudflare Turnstile</strong> checks, in the background, that sign-ups and sign-ins come
                    from a person and not a bot. To do that it looks at information about your browser. See
                    Cloudflare&apos;s{' '}
                    <a href="https://www.cloudflare.com/turnstile-privacy-policy/" className={linkClass}>
                        Turnstile Privacy Addendum
                    </a>
                    .
                </li>
            </ul>

            <h2 className="font-display text-2xl mt-5">What Handful doesn&apos;t do</h2>
            <p>
                No ads, and your data isn&apos;t sold or shared beyond the services above. Handful&apos;s own cookies
                only keep you signed in.
            </p>

            <h2 className="font-display text-2xl mt-5">Deleting your account</h2>
            <p>
                <a href={`mailto:${CONTACT}?subject=Delete%20my%20Handful%20account`} className={linkClass}>
                    Email me
                </a>{' '}
                and I&apos;ll delete your account. Everything in it, every client, task and note, is deleted with it.
            </p>

            <h2 className="font-display text-2xl mt-5">Questions</h2>
            <p>
                <a href={`mailto:${CONTACT}`} className={linkClass}>
                    {CONTACT}
                </a>
            </p>
        </article>
    )
}

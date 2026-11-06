import Link from 'next/link'
import DueLabel from '@/components/DueLabel'
import Logo from '@/components/Logo'
import TodayDate from '@/components/TodayDate'
import { getDashboardData } from '@/lib/data-server'
import { buttonClass } from '@/lib/formStyles'

// Stats depend on who is logged in (cookies), so render per request instead of trying to pre-render at build time
export const dynamic = 'force-dynamic'

const gettingStartedSteps = [
    { title: 'Add a client', text: 'Start with someone you work with.' },
    { title: 'Create a task', text: 'Set a priority and due date so nothing slips.' },
    { title: 'Keep notes', text: 'Open a client to save notes from your conversations.' },
]

export default async function HomePage() {
    const { totalClients, inProgress, notStarted, urgentTasks } = await getDashboardData()
    const [lead, ...others] = urgentTasks

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 text-lg">
            {/* Masthead */}
            <header className="flex flex-col gap-3 text-center">
                <p>
                    <Logo className="text-[clamp(4rem,13vw,10rem)] leading-none" />
                </p>
                <div className="flex flex-wrap justify-between gap-x-8 pt-3 border-t-4 border-double border-ink italic">
                    <TodayDate />
                    <span>Just enough CRM</span>
                </div>
            </header>

            {totalClients === 0 ? (
                <section aria-labelledby="getting-started" className="mt-12">
                    <h1 id="getting-started" className="font-display text-[clamp(2.25rem,5vw,4rem)] leading-tight">
                        Get started in 3 steps
                    </h1>
                    <ol className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {gettingStartedSteps.map((step, index) => (
                            <li key={step.title} className="pt-4 border-t border-ink">
                                <p className="font-display text-3xl text-accent">{index + 1}</p>
                                <h2 className="mt-2 font-display text-2xl">{step.title}</h2>
                                <p className="mt-1">{step.text}</p>
                            </li>
                        ))}
                    </ol>
                    <Link href="/clients" className={`mt-8 ${buttonClass}`}>
                        Add your first client
                    </Link>
                </section>
            ) : (
                <>
                    <div className="mt-12 flex flex-wrap gap-x-16 gap-y-10">
                        <section className="flex-[2_1_26rem] min-w-0 flex flex-col gap-4">
                            {lead ? (
                                <>
                                    <DueLabel date={lead.due_date} />
                                    <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] leading-tight tracking-tight text-balance break-words">
                                        {lead.clientName}: {lead.title}
                                    </h1>
                                    {lead.description && <p className="max-w-xl">{lead.description}</p>}
                                    <p>
                                        <Link
                                            href={`/clients/${lead.client_id}`}
                                            className="font-semibold underline underline-offset-4 hover:text-accent"
                                        >
                                            Open {lead.clientName}&apos;s page
                                        </Link>
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] leading-tight tracking-tight">
                                        Nothing needs you right now.
                                    </h1>
                                    <p>
                                        <Link
                                            href="/tasks"
                                            className="font-semibold underline underline-offset-4 hover:text-accent"
                                        >
                                            Add a task
                                        </Link>
                                    </p>
                                </>
                            )}
                        </section>

                        {others.length > 0 && (
                            <section
                                aria-labelledby="also-heading"
                                className="flex-[1_1_18rem] min-w-0 pt-4 border-t border-ink"
                            >
                                <h2 id="also-heading" className="font-display text-2xl">
                                    Also next
                                </h2>
                                <ul className="mt-4 flex flex-col gap-4">
                                    {others.map((task) => (
                                        <li key={task.id}>
                                            <Link
                                                href={`/clients/${task.client_id}`}
                                                className="font-semibold hover:text-accent break-words"
                                            >
                                                {task.clientName}: {task.title}
                                            </Link>
                                            <DueLabel date={task.due_date} />
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>

                    <dl className="mt-12 pt-6 border-t-4 border-double border-ink grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <dt>Clients</dt>
                            <dd className="font-display text-5xl">{totalClients}</dd>
                        </div>
                        <div>
                            <dt>Tasks in progress</dt>
                            <dd className="font-display text-5xl">{inProgress}</dd>
                        </div>
                        <div>
                            <dt>Not started</dt>
                            <dd className="font-display text-5xl">{notStarted}</dd>
                        </div>
                    </dl>
                </>
            )}
        </div>
    )
}

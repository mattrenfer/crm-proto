import Link from 'next/link'
import { getDashboardStats } from '../lib/data-server'

// Stats depend on who is logged in (cookies), so render per request instead of trying to pre-render at build time
export const dynamic = 'force-dynamic'

const gettingStartedSteps = [
    { title: 'Add a client', text: 'Start with someone you work with.' },
    { title: 'Create a task', text: 'Set a priority and due date so nothing slips.' },
    { title: 'Keep notes', text: 'Open a client to save notes from your conversations.' },
]

export default async function HomePage() {
    const { totalClients, activeTasks, pendingTasks } = await getDashboardStats()

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" id="homepage-container">
            <div className="px-4 py-6 sm:px-0" id="main-content">
                {/* Header */}
                <div className="text-center mb-8" id="header-section">
                    <h1 className="text-4xl font-bold text-ink mb-4">Welcome to Handful</h1>
                    <p className="text-lg text-muted" id="subtitle">
                        Just enough CRM
                    </p>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" id="dashboard-section">
                    <div className="bg-sheet overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="text-2xl">👥</div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-muted truncate">Total Clients</dt>
                                        <dd className="text-3xl font-semibold text-ink">{totalClients}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-sheet overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="text-2xl">⚡</div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-muted truncate">Active Tasks</dt>
                                        <dd className="text-3xl font-semibold text-accent">{activeTasks}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-sheet overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="text-2xl">📋</div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-muted truncate">Pending Tasks</dt>
                                        <dd className="text-3xl font-semibold text-danger">{pendingTasks}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" id="quick-actions-section">
                    <Link href="/clients" className="group">
                        <div className="bg-sheet border border-rule rounded-lg p-6 hover:bg-paper transition-colors">
                            <div className="flex items-center">
                                <div className="text-3xl mr-4">👥</div>
                                <div>
                                    <h3 className="text-lg font-semibold text-accent group-hover:text-accent">
                                        Manage Clients
                                    </h3>
                                    <p className="text-accent">Add, view, and manage your client relationships</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href="/tasks" className="group">
                        <div className="bg-sheet border border-rule rounded-lg p-6 hover:bg-paper transition-colors">
                            <div className="flex items-center">
                                <div className="text-3xl mr-4">📋</div>
                                <div>
                                    <h3 className="text-lg font-semibold text-accent group-hover:text-accent">
                                        Manage Tasks
                                    </h3>
                                    <p className="text-accent">Track and update task progress for all clients</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Getting Started: only for new users who haven't added a client yet */}
                {totalClients === 0 && (
                    <div className="bg-sheet shadow rounded-lg p-6" id="getting-started-section">
                        <h2 className="text-xl font-semibold text-ink">Get started in 3 steps</h2>
                        <ol className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {gettingStartedSteps.map((step, index) => (
                                <li key={step.title} className="flex">
                                    <span
                                        aria-hidden="true"
                                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sheet text-sm font-semibold text-accent"
                                    >
                                        {index + 1}
                                    </span>
                                    <div className="ml-3">
                                        <h3 className="font-medium text-ink">{step.title}</h3>
                                        <p className="mt-1 text-sm text-muted">{step.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                        <Link
                            href="/clients"
                            className="mt-6 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-ink focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                        >
                            Add your first client
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

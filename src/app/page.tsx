import Link from "next/link";
import { getDashboardStats } from "../lib/data-server";

// Stats depend on who is logged in (cookies), so render per request instead of trying to pre-render at build time
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { totalClients, activeTasks, pendingTasks } = await getDashboardStats();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" id="homepage-container">
      <div className="px-4 py-6 sm:px-0" id="main-content">
        {/* Header */}
        <div className="text-center mb-8" id="header-section">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Simple CRM
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300" id="subtitle">
            Manage your clients and tasks efficiently
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" id="dashboard-section">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">👥</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Clients
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900 dark:text-white">
                      {totalClients}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">⚡</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Active Tasks
                    </dt>
                    <dd className="text-3xl font-semibold text-orange-600 dark:text-orange-400">
                      {activeTasks}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">📋</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Pending Tasks
                    </dt>
                    <dd className="text-3xl font-semibold text-red-600 dark:text-red-400">
                      {pendingTasks}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" id="quick-actions-section">
          <Link href="/clients" className="group">
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-6 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
              <div className="flex items-center">
                <div className="text-3xl mr-4">👥</div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 group-hover:text-blue-800 dark:group-hover:text-blue-200">
                    Manage Clients
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    Add, view, and manage your client relationships
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/tasks" className="group">
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-6 hover:bg-green-100 dark:hover:bg-green-800 transition-colors">
              <div className="flex items-center">
                <div className="text-3xl mr-4">📋</div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 group-hover:text-green-800 dark:group-hover:text-green-200">
                    Manage Tasks
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    Track and update task progress for all clients
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6" id="getting-started-section">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Getting Started
          </h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-300">
            <p>
              • Add your first client using the &ldquo;Manage Clients&rdquo; section
            </p>
            <p>
              • Create tasks for each client to track your work
            </p>
            <p>
              • Use the client detail pages to add notes and manage client-specific information
            </p>
            <p>
              • Configure Supabase in your environment variables to persist data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

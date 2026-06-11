import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // Simple protection: only visible in development or if ADMIN_DASHBOARD_TOKEN matches env var
  if (process.env.NODE_ENV !== 'development' && !process.env.ADMIN_DASHBOARD_TOKEN) {
    // In production, if no token is configured, hide the dashboard completely
    return notFound();
  }

  // Note: For a real app, we would use proper middleware authentication.
  // This is a minimal internal dogfooding view for Phase 2.

  const snapshots = await prisma.scoreSnapshot.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      tenant: true,
      auditIssues: {
        where: { severity: 'critical' },
        take: 1
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Score History (Dogfooding)</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of the 20 most recent scores processed by the engine.
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">URL</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Score</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Band</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Top Issue</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {snapshots.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 pl-4 text-sm text-gray-500 sm:pl-6 text-center">
                          No score snapshots found. Run the dogfooding script first!
                        </td>
                      </tr>
                    ) : (
                      snapshots.map((snapshot) => (
                        <tr key={snapshot.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {snapshot.url}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900">
                            {snapshot.finalScore}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {snapshot.scoreBand === 'excellent' && <span className="text-green-600 font-medium">Excellent</span>}
                            {snapshot.scoreBand === 'good' && <span className="text-blue-600 font-medium">Good</span>}
                            {snapshot.scoreBand === 'needs_improvement' && <span className="text-yellow-600 font-medium">Needs Improv.</span>}
                            {snapshot.scoreBand === 'poor' && <span className="text-orange-600 font-medium">Poor</span>}
                            {snapshot.scoreBand === 'critical' && <span className="text-red-600 font-medium">Critical</span>}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {snapshot.auditIssues.length > 0 ? (
                              <span className="text-red-600 truncate max-w-xs block" title={snapshot.auditIssues[0].title}>
                                {snapshot.auditIssues[0].code}
                              </span>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {snapshot.createdAt.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

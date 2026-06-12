import { getSites } from '../actions';
import Link from 'next/link';
import { Plus, Globe, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SitesPage() {
  const sites = await getSites();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sites</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your integrated websites and their SEO health.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Add Site
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site Name / Domain</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Audit</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sites.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Globe className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No sites</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new site.</p>
                  </td>
                </tr>
              ) : (
                sites.map((site) => {
                  const latestSnapshot = site.snapshots[0];
                  
                  return (
                    <tr key={site.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <Globe className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{site.name}</div>
                            <div className="text-sm text-gray-500">{site.domain}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {site.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {latestSnapshot ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">{latestSnapshot.finalScore}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize uppercase
                              ${latestSnapshot.scoreBand === 'excellent' ? 'bg-green-100 text-green-800' : 
                                latestSnapshot.scoreBand === 'good' ? 'bg-blue-100 text-blue-800' : 
                                latestSnapshot.scoreBand === 'needs_improvement' ? 'bg-yellow-100 text-yellow-800' : 
                                latestSnapshot.scoreBand === 'poor' ? 'bg-orange-100 text-orange-800' : 
                                'bg-red-100 text-red-800'}`}
                            >
                              {latestSnapshot.scoreBand.replace('_', ' ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No audits yet</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {latestSnapshot ? latestSnapshot.createdAt.toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          href={`/dashboard/sites/${site.id}`}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreatorApplication {
  id: string;
  name: string;
  email: string;
  tools: string;
  style: string;
  sample_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function AdminCreatorsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [creators, setCreators] = useState<CreatorApplication[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<CreatorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const ADMIN_PASSWORD = 'AgenticAdmin2026!';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
      loadCreators();
    } else {
      setPasswordError('Incorrect password');
      setPassword('');
    }
  };

  const loadCreators = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/creators', {
        headers: { 'x-admin-key': ADMIN_PASSWORD },
      });

      if (res.ok) {
        const data = await res.json();
        setCreators(data);
        filterCreators(data, 'all');
      }
    } catch (error) {
      console.error('Error loading creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCreators = (creatorsData: CreatorApplication[], filterType: string) => {
    if (filterType === 'all') {
      setFilteredCreators(creatorsData);
    } else {
      setFilteredCreators(creatorsData.filter((c) => c.status === filterType));
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'pending' | 'approved' | 'rejected') => {
    setFilter(newFilter);
    filterCreators(creators, newFilter);
  };

  const updateCreatorStatus = async (creatorId: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(creatorId);
    try {
      const res = await fetch(`/api/admin/creators/${creatorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_PASSWORD,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        const newCreators = creators.map((c) => (c.id === creatorId ? updated : c));
        setCreators(newCreators);
        filterCreators(newCreators, filter);
      }
    } catch (error) {
      console.error('Error updating creator:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-900 text-green-300';
      case 'rejected':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-yellow-900 text-yellow-300';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-white">Admin Dashboard</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-[#080c14] border border-[#1e2d45] rounded px-4 py-2 text-white mb-4 focus:outline-none focus:border-[#7c3aed]"
            />
            {passwordError && <p className="text-red-400 text-sm mb-4">{passwordError}</p>}
            <button
              type="submit"
              className="w-full bg-[#7c3aed] hover:bg-[#6d2fd9] text-white rounded py-2 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Creator Applications</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading creator applications...</div>
        ) : (
          <div>
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b border-[#1e2d45] pb-4">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleFilterChange(tab)}
                  className={`px-4 py-2 rounded font-semibold transition-colors capitalize ${
                    filter === tab
                      ? 'bg-[#7c3aed] text-white'
                      : 'bg-[#0f1623] text-gray-300 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
              <div className="ml-auto text-gray-400">
                {filteredCreators.length} {filteredCreators.length === 1 ? 'application' : 'applications'}
              </div>
            </div>

            {/* Creators Table */}
            {filteredCreators.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No creator applications found
              </div>
            ) : (
              <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#1e2d45] bg-[#080c14]">
                    <tr>
                      <th className="text-left py-4 px-4">Name</th>
                      <th className="text-left py-4 px-4">Email</th>
                      <th className="text-left py-4 px-4">Tools</th>
                      <th className="text-left py-4 px-4">Style</th>
                      <th className="text-left py-4 px-4">Sample</th>
                      <th className="text-left py-4 px-4">Status</th>
                      <th className="text-left py-4 px-4">Applied</th>
                      <th className="text-left py-4 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCreators.map((creator) => (
                      <tr key={creator.id} className="border-b border-[#1e2d45] hover:bg-[#0a0e16] transition-colors">
                        <td className="py-4 px-4 font-semibold">{creator.name}</td>
                        <td className="py-4 px-4 text-gray-300">{creator.email}</td>
                        <td className="py-4 px-4 text-gray-300 text-xs max-w-xs truncate">
                          {creator.tools}
                        </td>
                        <td className="py-4 px-4 text-gray-300 text-xs max-w-xs truncate">
                          {creator.style}
                        </td>
                        <td className="py-4 px-4">
                          {creator.sample_url ? (
                            <a
                              href={creator.sample_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#06b6d4] hover:underline"
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                              creator.status
                            )}`}
                          >
                            {creator.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-400 text-xs">
                          {new Date(creator.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          {creator.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateCreatorStatus(creator.id, 'approved')}
                                disabled={actionLoading === creator.id}
                                className="bg-green-700 hover:bg-green-600 disabled:opacity-50 px-3 py-1 rounded text-xs transition-colors font-semibold"
                              >
                                {actionLoading === creator.id ? 'Loading...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => updateCreatorStatus(creator.id, 'rejected')}
                                disabled={actionLoading === creator.id}
                                className="bg-red-700 hover:bg-red-600 disabled:opacity-50 px-3 py-1 rounded text-xs transition-colors font-semibold"
                              >
                                {actionLoading === creator.id ? 'Loading...' : 'Reject'}
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

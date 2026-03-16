'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Report {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  reporter_email: string | null;
  status: string;
  created_at: string;
}

interface Track {
  id: string;
  title: string;
  artist_handle: string;
  genre: string;
  status: string;
  created_at: string;
}

interface Channel {
  id: string;
  channel_name: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [reports, setReports] = useState<Report[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const ADMIN_PASSWORD = 'AgenticAdmin2026!';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
      loadData();
    } else {
      setPasswordError('Incorrect password');
      setPassword('');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch data from API
      const headers = { 'x-admin-key': ADMIN_PASSWORD };
      
      const [reportsRes, tracksRes, channelsRes, waitlistRes] = await Promise.all([
        fetch('/api/admin/reports', { headers }),
        fetch('/api/admin/tracks', { headers }),
        fetch('/api/admin/channels', { headers }),
        fetch('/api/admin/waitlist', { headers }),
      ]);

      if (reportsRes.ok) setReports(await reportsRes.json());
      if (tracksRes.ok) setTracks(await tracksRes.json());
      if (channelsRes.ok) setChannels(await channelsRes.json());
      if (waitlistRes.ok) {
        const data = await waitlistRes.json();
        setWaitlistCount(data.count);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_PASSWORD,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setReports(reports.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r)));
      }
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const updateTrackStatus = async (trackId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/tracks/${trackId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_PASSWORD,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setTracks(tracks.map((t) => (t.id === trackId ? { ...t, status: newStatus } : t)));
      }
    } catch (error) {
      console.error('Error updating track:', error);
    }
  };

  const toggleChannelActive = async (channelId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/channels/${channelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_PASSWORD,
        },
        body: JSON.stringify({ is_active: !currentActive }),
      });

      if (res.ok) {
        setChannels(channels.map((c) => (c.id === channelId ? { ...c, is_active: !currentActive } : c)));
      }
    } catch (error) {
      console.error('Error updating channel:', error);
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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading data...</div>
        ) : (
          <div className="grid gap-8">
            {/* Pending Reports Section */}
            <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Pending Reports</h2>
              {reports.filter((r) => r.status === 'pending').length === 0 ? (
                <p className="text-gray-400">No pending reports</p>
              ) : (
                <div className="space-y-4">
                  {reports
                    .filter((r) => r.status === 'pending')
                    .map((report) => (
                      <div
                        key={report.id}
                        className="bg-[#080c14] rounded p-4 border border-[#1e2d45]"
                      >
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-gray-400 text-sm">Type</p>
                            <p className="font-semibold">{report.content_type}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">ID</p>
                            <p className="font-semibold text-sm">{report.content_id}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Reported</p>
                            <p className="text-sm">{new Date(report.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <p className="text-gray-300 mb-3">{report.reason}</p>
                        {report.reporter_email && (
                          <p className="text-gray-400 text-sm mb-3">Reporter: {report.reporter_email}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateReportStatus(report.id, 'dismissed')}
                            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm transition-colors"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => updateReportStatus(report.id, 'actioned')}
                            className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-sm transition-colors"
                          >
                            Action
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Recent Tracks Section */}
            <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Recent Track Submissions</h2>
              {tracks.length === 0 ? (
                <p className="text-gray-400">No tracks submitted</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#1e2d45]">
                        <th className="text-left py-2 px-2">Title</th>
                        <th className="text-left py-2 px-2">Artist</th>
                        <th className="text-left py-2 px-2">Genre</th>
                        <th className="text-left py-2 px-2">Status</th>
                        <th className="text-left py-2 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tracks.slice(0, 20).map((track) => (
                        <tr key={track.id} className="border-b border-[#1e2d45]">
                          <td className="py-2 px-2">{track.title}</td>
                          <td className="py-2 px-2">{track.artist_handle}</td>
                          <td className="py-2 px-2">{track.genre}</td>
                          <td className="py-2 px-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                track.status === 'approved'
                                  ? 'bg-green-900 text-green-300'
                                  : track.status === 'rejected'
                                  ? 'bg-red-900 text-red-300'
                                  : 'bg-yellow-900 text-yellow-300'
                              }`}
                            >
                              {track.status}
                            </span>
                          </td>
                          <td className="py-2 px-2 space-x-2">
                            <button
                              onClick={() => updateTrackStatus(track.id, 'approved')}
                              className="bg-green-700 hover:bg-green-600 px-2 py-1 rounded text-xs transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateTrackStatus(track.id, 'rejected')}
                              className="bg-red-700 hover:bg-red-600 px-2 py-1 rounded text-xs transition-colors"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Channels Section */}
            <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Channels</h2>
              {channels.length === 0 ? (
                <p className="text-gray-400">No channels</p>
              ) : (
                <div className="grid gap-3">
                  {channels.map((channel) => (
                    <div
                      key={channel.id}
                      className="bg-[#080c14] border border-[#1e2d45] rounded p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{channel.channel_name}</p>
                        <p className="text-gray-400 text-sm">Created: {new Date(channel.created_at).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => toggleChannelActive(channel.id, channel.is_active)}
                        className={`px-4 py-2 rounded transition-colors ${
                          channel.is_active
                            ? 'bg-green-700 hover:bg-green-600'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        {channel.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Listener Signups Section */}
            <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Listener Waitlist</h2>
              <p className="text-gray-300 mb-2">Total signups:</p>
              <p className="text-3xl font-bold text-[#7c3aed]">{waitlistCount}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

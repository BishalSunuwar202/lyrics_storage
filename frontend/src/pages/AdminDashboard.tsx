import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPendingLyrics, approveLyric, deleteLyric, updateLyric, fetchLyrics } from '../api/lyrics';
import { useAuth } from '../contexts/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogOut, Check, Edit2, Trash2, Download, Upload } from 'lucide-react';
import EditModal from '../components/EditModal';
import ConfirmModal from '../components/ConfirmModal';
import type { Lyric } from '../api/lyrics';

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [editingLyric, setEditingLyric] = useState<Lyric | null>(null);
  const [deletingLyric, setDeletingLyric] = useState<Lyric | null>(null);

  const { data: pendingLyrics, isLoading: pendingLoading } = useQuery({
    queryKey: ['pendingLyrics'],
    queryFn: () => fetchPendingLyrics(token!),
    enabled: !!token
  });

  const { data: approvedData, isLoading: approvedLoading } = useQuery({
    queryKey: ['approvedLyrics'],
    queryFn: () => fetchLyrics(1, 100),
    enabled: activeTab === 'approved'
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveLyric(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingLyrics'] });
      queryClient.invalidateQueries({ queryKey: ['approvedLyrics'] });
      queryClient.invalidateQueries({ queryKey: ['lyrics'] });
      toast.success('Lyric approved successfully!');
    },
    onError: () => {
      toast.error('Failed to approve lyric');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLyric(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingLyrics'] });
      queryClient.invalidateQueries({ queryKey: ['approvedLyrics'] });
      queryClient.invalidateQueries({ queryKey: ['lyrics'] });
      toast.success('Lyric deleted successfully!');
      setDeletingLyric(null);
    },
    onError: () => {
      toast.error('Failed to delete lyric');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lyric> }) =>
      updateLyric(id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingLyrics'] });
      queryClient.invalidateQueries({ queryKey: ['approvedLyrics'] });
      queryClient.invalidateQueries({ queryKey: ['lyrics'] });
      toast.success('Lyric updated successfully!');
      setEditingLyric(null);
    },
    onError: () => {
      toast.error('Failed to update lyric');
    }
  });

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleExport = () => {
    const data = activeTab === 'pending' ? pendingLyrics : approvedData?.lyrics;
    if (!data) return;

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lyrics-${activeTab}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Lyrics exported successfully!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        console.log('Imported data:', data);
        toast.success('Lyrics imported successfully!');
      } catch (error) {
        console.log(error)
        toast.error('Failed to import lyrics. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  if (!user || user.role !== 'admin') {
    navigate('/admin/login');
    return null;
  }

  const lyrics = activeTab === 'pending' ? pendingLyrics : approvedData?.lyrics;
  const isLoading = activeTab === 'pending' ? pendingLoading : approvedLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-slate-600">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Pending ({pendingLyrics?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'approved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Approved
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {lyrics && lyrics.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-slate-600 text-lg">
              No {activeTab} lyrics found.
            </p>
          </div>
        )}

        <div className="grid gap-6">
          {lyrics?.map((lyric) => (
            <div key={lyric.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-slate-800 mb-1">
                    {lyric.title}
                  </h3>
                  <p className="text-slate-600">by {lyric.writer_name}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  {activeTab === 'pending' && (
                    <button
                      onClick={() => approveMutation.mutate(lyric.id)}
                      className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      title="Approve"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => setEditingLyric(lyric)}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setDeletingLyric(lyric)}
                    className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {lyric.category}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                  #{lyric.number}
                </span>
                {lyric.submitted_by && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    by {lyric.submitted_by}
                  </span>
                )}
              </div>

              <div className="bg-slate-50 rounded p-4">
                <pre className="whitespace-pre-wrap font-sans text-slate-700 text-sm line-clamp-4">
                  {lyric.content}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingLyric && (
        <EditModal
          lyric={editingLyric}
          onClose={() => setEditingLyric(null)}
          onSave={(data) => updateMutation.mutate({ id: editingLyric.id, data })}
          isLoading={updateMutation.isPending}
        />
      )}

      {deletingLyric && (
        <ConfirmModal
          title="Delete Lyric"
          message={`Are you sure you want to delete "${deletingLyric.title}"? This action cannot be undone.`}
          onConfirm={() => deleteMutation.mutate(deletingLyric.id)}
          onCancel={() => setDeletingLyric(null)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

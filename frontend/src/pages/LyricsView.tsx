import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchLyricById } from '../api/lyrics';
import { ArrowLeft, Maximize2, Heart } from 'lucide-react';
import { useFavorites } from '../contexts/useFavorites';
import ProjectorMode from '../components/ProjectorMode';

export default function LyricView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isProjectorMode, setIsProjectorMode] = useState(false);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const { data: lyric, isLoading, error } = useQuery({
    queryKey: ['lyric', id],
    queryFn: () => fetchLyricById(id!),
    enabled: !!id
  });

  const toggleFavorite = () => {
    if (lyric) {
      if (isFavorite(lyric.id)) {
        removeFavorite(lyric.id);
      } else {
        addFavorite(lyric.id);
      }
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isProjectorMode) {
        setIsProjectorMode(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isProjectorMode]);

  if (isProjectorMode && lyric) {
    return <ProjectorMode lyric={lyric} onClose={() => setIsProjectorMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-slate-600 hover:text-slate-800 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-red-600 mb-4">Error loading lyric</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go Home
            </button>
          </div>
        )}

        {lyric && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-800 mb-2">{lyric.title}</h1>
                <p className="text-lg text-slate-600">by {lyric.writer_name}</p>
              </div>
              <button
                onClick={toggleFavorite}
                className="ml-4 p-3 hover:bg-slate-100 rounded-full transition"
              >
                <Heart
                  className={`w-6 h-6 ${
                    isFavorite(lyric.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'
                  }`}
                />
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                {lyric.category}
              </span>
              <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full font-medium">
                #{lyric.number}
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 mb-6">
              <pre className="whitespace-pre-wrap font-sans text-slate-800 text-lg leading-relaxed">
                {lyric.content}
              </pre>
            </div>

            <button
              onClick={() => setIsProjectorMode(true)}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-lg flex items-center justify-center"
            >
              <Maximize2 className="w-6 h-6 mr-2" />
              Open Projector Mode
            </button>

            {lyric.submitted_by && (
              <p className="text-sm text-slate-500 text-center mt-4">
                Submitted by {lyric.submitted_by}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

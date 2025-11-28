import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLyrics } from '../api/lyrics';
import { Link } from 'react-router-dom';
import { Search, Heart, Music, X } from 'lucide-react';
import { useFavorites } from '../contexts/useFavorites';

export default function Home() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const { data, isLoading, error } = useQuery({
    queryKey: ['lyrics', page, category, search],
    queryFn: () => fetchLyrics(page, 10, category, search)
  });
  
  console.log(data?.lyrics[0])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCategory(category)
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPage(1);
  };

  const toggleFavorite = (id: string) => {
    if (isFavorite(id)) {
      removeFavorite(id);
    } else {
      addFavorite(id);
    }
  };

  const clearAllFilters = () => {
    setSearch('');
    setSearchInput('');
    setCategory('');
    setPage(1);
  };

  const clearSearch = () => {
    setSearch('');
    setSearchInput('');
    setPage(1);
  };

  const hasActiveFilters = search || category;

  // Sync searchInput with search when search changes externally
  // This ensures the input shows the current search term

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <Music className="w-10 h-10 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-slate-800">Lyrics Library</h1>
          </div>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title, writer, or content..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-4 py-3 pl-12 pr-20 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-24 top-3.5 p-1 hover:bg-slate-200 rounded-full transition"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 top-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="max-w-2xl mx-auto mb-4 flex flex-wrap items-center gap-2 justify-center">
              <span className="text-sm text-slate-600">Active filters:</span>
              {search && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Search: "{search}"
                  <button
                    onClick={clearSearch}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition"
                    aria-label="Remove search filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {category && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Category: {category}
                  <button
                    onClick={() => handleCategoryChange('')}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition"
                    aria-label="Remove category filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="ml-2 px-4 py-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition text-sm font-medium"
              >
                Clear All
              </button>
            </div>
          )}

          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                category === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleCategoryChange('Bhajan')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                category === 'Bhajan'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Bhajan
            </button>
            <button
              onClick={() => handleCategoryChange('Koras')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                category === 'Koras'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Koras
            </button>
          </div>

          <div className="flex justify-center">
            <Link
              to="/submit"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Submit New Lyric
            </Link>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-600">
            Error loading lyrics. Please try again.
          </div>
        )}

        {data && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {data.lyrics.map((lyric) => (
                <div
                  key={lyric.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-800 mb-1">
                        {lyric.title}
                      </h3>
                      <p className="text-sm text-slate-600">by {lyric.writer_name}</p>
                    </div>
                    <button
                      onClick={() => toggleFavorite(lyric.id)}
                      className="ml-2 p-2 hover:bg-slate-100 rounded-full transition"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isFavorite(lyric.id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {lyric.category}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                      #{lyric.number}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                    {lyric.content}
                  </p>

                  <Link
                    to={`/lyrics/${lyric.id}`}
                    className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-medium"
                  >
                    View & Project
                  </Link>
                </div>
              ))}
            </div>
            
            {data?.lyrics && data.lyrics.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-600 text-lg mb-4">No Lyrics Found</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Clear Filters & Show All
                  </button>
                )}
              </div>
            )}

            {data.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                >
                  Previous
                </button>

                <span className="px-4 py-2 bg-white rounded-lg border border-slate-300">
                  Page {page} of {data.totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="px-4 py-2 bg-white rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

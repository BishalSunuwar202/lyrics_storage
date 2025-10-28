import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { submitLyric } from '../api/lyrics';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

export default function Submit() {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('lyricDraft');
    return saved
      ? JSON.parse(saved)
      : {
          title: '',
          writer_name: '',
          category: 'Bhajan',
          number: '',
          content: '',
          submitted_by: ''
        };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('lyricDraft', JSON.stringify(formData));
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData]);

  const mutation = useMutation({
    mutationFn: submitLyric,
    onSuccess: () => {
      toast.success('Lyric submitted successfully! Awaiting admin approval.');
      localStorage.removeItem('lyricDraft');
      navigate('/');
    },
    onError: () => {
      toast.error('Failed to submit lyric. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.writer_name || !formData.number || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-slate-600 hover:text-slate-800 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">Submit New Lyric</h1>

          {!showPreview ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Song Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Writer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="writer_name"
                  value={formData.writer_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Bhajan">Bhajan</option>
                    <option value="Koras">Koras</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    placeholder="e.g., 123"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Lyrics Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={12}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  name="submitted_by"
                  value={formData.submitted_by}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="flex-1 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-medium"
                >
                  Preview
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {mutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Submit
                    </>
                  )}
                </button>
              </div>

              <p className="text-sm text-slate-500 text-center">
                Draft auto-saved to your browser
              </p>
            </form>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Preview</h2>
              <div className="bg-slate-50 p-6 rounded-lg mb-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{formData.title}</h3>
                <p className="text-slate-600 mb-3">by {formData.writer_name}</p>
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {formData.category}
                  </span>
                  <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm">
                    #{formData.number}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-slate-700">
                  {formData.content}
                </pre>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Back to Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


const API_URL = import.meta.env.VITE_API_URL;

export interface Lyric {
  id: string;
  title: string;
  writer_name: string;
  category: 'Bhajan' | 'Koras';
  number: string;
  content: string;
  status: 'pending' | 'approved';
  submitted_by?: string;
  created_at: string;
  updated_at: string;
}

export interface LyricsResponse {
  lyrics: Lyric[];
  total: number;
  page: number;
  totalPages: number;
}

export const  fetchLyrics = async (
  page: number = 1,
  limit: number = 10,
  category?: string,
  search?: string
): Promise<LyricsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  //console.log(search)
  if (category) params.append('category', category);
  if (search) params.append('search', search);

  const response = await fetch(`${API_URL}/lyrics?${params}`); 
  // const data = await response.json(); 
  // console.log(data)
  if (!response.ok) throw new Error('Failed to fetch lyrics');
  // const data = await response.json()
  // console.log(data)
  return response.json();
};

export const fetchLyricById = async (id: string): Promise<Lyric> => {
  const response = await fetch(`${API_URL}/lyrics/${id}`);
  if (!response.ok) throw new Error('Failed to fetch lyric');
  return response.json();
};

export const submitLyric = async (lyric: Omit<Lyric, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<Lyric> => {
  const response = await fetch(`${API_URL}/lyrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lyric)
  });
  if (!response.ok) throw new Error('Failed to submit lyric');
  return response.json();
};

export const fetchPendingLyrics = async (token: string): Promise<Lyric[]> => {
  const response = await fetch(`${API_URL}/lyrics/pending`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch pending lyrics');
  return response.json();
};

export const updateLyric = async (
  id: string,
  lyric: Partial<Lyric>,
  token: string
): Promise<Lyric> => {
  const response = await fetch(`${API_URL}/lyrics/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(lyric)
  });
  if (!response.ok) throw new Error('Failed to update lyric');
  return response.json();
};

export const approveLyric = async (id: string, token: string): Promise<Lyric> => {
  const response = await fetch(`${API_URL}/lyrics/${id}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to approve lyric');
  return response.json();
};

export const deleteLyric = async (id: string, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/lyrics/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to delete lyric');
};

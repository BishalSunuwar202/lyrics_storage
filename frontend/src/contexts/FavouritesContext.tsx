import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { FavoritesContext } from './favorites-context';

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (id: string) => {
    setFavorites(prev => [...prev, id]);
  };

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(fav => fav !== id));
  };

  const isFavorite = (id: string) => {
    return favorites.includes(id);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// useFavorites moved to `useFavorites.ts` to satisfy Fast Refresh

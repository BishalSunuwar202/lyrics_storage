import { createContext } from 'react';

export interface FavoritesContextType {
  favorites: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);



import { Injectable } from '@angular/core';
import { Favorite } from '../../core/domain/models/favorite.model';
import { FavoritesRepositoryPort } from '../../core/domain/ports/favorites.repository.port';

const STORAGE_KEY = 'mindfeed_favorites';

@Injectable({ providedIn: 'root' })
export class LocalStorageFavoritesRepository extends FavoritesRepositoryPort {
  private load(): Favorite[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Favorite[]) : [];
    } catch {
      return [];
    }
  }

  private save(favorites: Favorite[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }

  getAll(): Favorite[] {
    return this.load();
  }

  add(favorite: Favorite): void {
    const list = this.load();
    if (!this.isFavorite(favorite.articleId)) {
      this.save([...list, { ...favorite, savedAt: new Date().toISOString() }]);
    }
  }

  remove(articleId: string): void {
    this.save(this.load().filter((f) => f.articleId !== articleId));
  }

  isFavorite(articleId: string): boolean {
    return this.load().some((f) => f.articleId === articleId);
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

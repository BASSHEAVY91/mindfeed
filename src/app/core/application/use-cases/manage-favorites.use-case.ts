import { inject, Injectable } from '@angular/core';
import { Favorite } from '../../domain/models/favorite.model';
import { FavoritesRepositoryPort } from '../../domain/ports/favorites.repository.port';

@Injectable({ providedIn: 'root' })
export class ManageFavoritesUseCase {
  private readonly repo = inject(FavoritesRepositoryPort);

  getAll(): Favorite[] {
    return this.repo.getAll();
  }

  add(favorite: Favorite): void {
    this.repo.add(favorite);
  }

  remove(articleId: string): void {
    this.repo.remove(articleId);
  }

  isFavorite(articleId: string): boolean {
    return this.repo.isFavorite(articleId);
  }

  toggle(favorite: Favorite): void {
    if (this.repo.isFavorite(favorite.articleId)) {
      this.repo.remove(favorite.articleId);
    } else {
      this.repo.add(favorite);
    }
  }
}

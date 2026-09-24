import { Favorite } from '../models/favorite.model';

export abstract class FavoritesRepositoryPort {
  abstract getAll(): Favorite[];
  abstract add(favorite: Favorite): void;
  abstract remove(articleId: string): void;
  abstract isFavorite(articleId: string): boolean;
  abstract clear(): void;
}

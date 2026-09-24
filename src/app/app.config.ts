import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { ArticleRepositoryPort } from './core/domain/ports/article.repository.port';
import { FavoritesRepositoryPort } from './core/domain/ports/favorites.repository.port';
import { InMemoryArticleRepository } from './infrastructure/repositories/in-memory-article.repository';
import { LocalStorageFavoritesRepository } from './infrastructure/repositories/local-storage-favorites.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    {
      provide: ArticleRepositoryPort,
      useClass: InMemoryArticleRepository,
    },
    {
      provide: FavoritesRepositoryPort,
      useClass: LocalStorageFavoritesRepository,
    },
  ],
};

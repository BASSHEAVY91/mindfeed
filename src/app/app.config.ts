import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { ArticleRepositoryPort } from './core/domain/ports/article.repository.port';
import { FavoritesRepositoryPort } from './core/domain/ports/favorites.repository.port';
import { DynamicArticleRepository } from './infrastructure/repositories/dynamic-article.repository';
import { LocalStorageFavoritesRepository } from './infrastructure/repositories/local-storage-favorites.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),
    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    {
      provide: ArticleRepositoryPort,
      useClass: DynamicArticleRepository,
    },
    {
      provide: FavoritesRepositoryPort,
      useClass: LocalStorageFavoritesRepository,
    },
  ],
};

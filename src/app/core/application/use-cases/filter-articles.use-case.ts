import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Article, ArticleCategory, ArticleLevel } from '../../domain/models/article.model';
import { ArticleRepositoryPort } from '../../domain/ports/article.repository.port';

export interface ArticleFilters {
  category?: ArticleCategory;
  level?: ArticleLevel;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class FilterArticlesUseCase {
  constructor(private readonly repo: ArticleRepositoryPort) {}

  execute(filters: ArticleFilters): Observable<Article[]> {
    return this.repo.getAll().pipe(
      map((articles) => {
        let result = articles;

        if (filters.category) {
          result = result.filter((a) => a.category === filters.category);
        }

        if (filters.level) {
          result = result.filter((a) => a.level === filters.level);
        }

        if (filters.search && filters.search.trim()) {
          const q = filters.search.toLowerCase();
          result = result.filter(
            (a) =>
              a.title.toLowerCase().includes(q) ||
              a.summary.toLowerCase().includes(q),
          );
        }

        // Always return newest-first regardless of filter combination
        return result.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
        );
      }),
    );
  }
}

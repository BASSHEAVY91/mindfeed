import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Article } from '../../domain/models/article.model';
import { ArticleRepositoryPort } from '../../domain/ports/article.repository.port';

@Injectable({ providedIn: 'root' })
export class GetArticleBySlugUseCase {
  constructor(private readonly repo: ArticleRepositoryPort) {}

  execute(slug: string): Observable<Article | undefined> {
    return this.repo.getBySlug(slug);
  }

  getRelated(articleId: string, limit = 3): Observable<Article[]> {
    return this.repo.getRelated(articleId, limit);
  }
}

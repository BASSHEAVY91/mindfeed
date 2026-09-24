import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Article } from '../../domain/models/article.model';
import { ArticleRepositoryPort } from '../../domain/ports/article.repository.port';

@Injectable({ providedIn: 'root' })
export class GetArticlesUseCase {
  constructor(private readonly repo: ArticleRepositoryPort) {}

  execute(): Observable<Article[]> {
    return this.repo.getAll();
  }

  getFeatured(): Observable<Article | undefined> {
    return this.repo.getFeatured();
  }

  getRecent(limit = 6): Observable<Article[]> {
    return this.repo.getRecent(limit);
  }
}

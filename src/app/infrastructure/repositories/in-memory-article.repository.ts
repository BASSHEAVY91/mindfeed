import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Article, ArticleCategory, ArticleLevel } from '../../core/domain/models/article.model';
import { ArticleRepositoryPort } from '../../core/domain/ports/article.repository.port';
import { ARTICLES_DATA } from '../data/articles.data';

@Injectable({ providedIn: 'root' })
export class InMemoryArticleRepository implements ArticleRepositoryPort {
  private readonly articles: Article[] = ARTICLES_DATA;

  getAll(): Observable<Article[]> {
    return of([...this.articles]);
  }

  getById(id: string): Observable<Article | undefined> {
    return of(this.articles.find((a) => a.id === id));
  }

  getBySlug(slug: string): Observable<Article | undefined> {
    return of(this.articles.find((a) => a.slug === slug));
  }

  getByCategory(category: ArticleCategory): Observable<Article[]> {
    return of(this.articles.filter((a) => a.category === category));
  }

  getByLevel(level: ArticleLevel): Observable<Article[]> {
    return of(this.articles.filter((a) => a.level === level));
  }

  getRelated(articleId: string): Observable<Article[]> {
    const article = this.articles.find((a) => a.id === articleId);
    if (!article) return of([]);
    const related = article.relatedIds
      .map((id) => this.articles.find((a) => a.id === id))
      .filter((a): a is Article => a !== undefined);
    return of(related);
  }

  getFeatured(): Observable<Article> {
    // Return the most recently published article as featured
    const sorted = [...this.articles].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
    return of(sorted[0]);
  }

  getRecent(limit: number): Observable<Article[]> {
    const sorted = [...this.articles]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
    return of(sorted);
  }
}

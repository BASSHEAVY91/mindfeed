/**
 * DynamicArticleRepository
 * ──────────────────────────────────────────────────────────────────────────────
 * Hexagonal Infrastructure adapter: implements ArticleRepositoryPort using
 * the NewsAggregatorService as its data source (live API + static fallback).
 */
import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Article, ArticleCategory, ArticleLevel } from '../../core/domain/models/article.model';
import { ArticleRepositoryPort } from '../../core/domain/ports/article.repository.port';
import { NewsAggregatorService } from '../services/news-aggregator.service';

@Injectable({ providedIn: 'root' })
export class DynamicArticleRepository extends ArticleRepositoryPort {
  private readonly aggregator = inject(NewsAggregatorService);
  private _initialized = false;

  private ensureLoaded(): void {
    if (!this._initialized) {
      this._initialized = true;
      this.aggregator.refresh();
    }
  }

  private get all(): Article[] {
    this.ensureLoaded();
    return this.aggregator.articles();
  }

  getAll(): Observable<Article[]> {
    return from([this.all]);
  }

  getById(id: string): Observable<Article | undefined> {
    return from([this.all.find((a) => a.id === id)]);
  }

  getBySlug(slug: string): Observable<Article | undefined> {
    return from([this.all.find((a) => a.slug === slug)]);
  }

  getByCategory(category: ArticleCategory): Observable<Article[]> {
    return from([this.all.filter((a) => a.category === category)]);
  }

  getByLevel(level: ArticleLevel): Observable<Article[]> {
    return from([this.all.filter((a) => a.level === level)]);
  }

  getFeatured(): Observable<Article | undefined> {
    return from([this.all[0]]);
  }

  getRecent(limit: number): Observable<Article[]> {
    return from([this.all.slice(0, limit)]);
  }

  getRelated(articleId: string, limit = 3): Observable<Article[]> {
    const article = this.all.find((a) => a.id === articleId);
    if (!article) return from([[]]);

    const related = article.relatedIds
      .map((id) => this.all.find((a) => a.id === id))
      .filter((a): a is Article => a !== undefined)
      .slice(0, limit);

    return from([related]);
  }
}

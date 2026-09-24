/**
 * DynamicArticleRepository
 * ──────────────────────────────────────────────────────────────────────────────
 * Hexagonal Infrastructure adapter: implements ArticleRepositoryPort using
 * the NewsAggregatorService as its data source (live API + static fallback).
 *
 * Uses `toObservable` to bridge the aggregator's Signal into a long-lived
 * Observable. This means every subscriber (e.g. `toSignal` in components)
 * receives the STATIC articles immediately, then automatically gets a new
 * emission when the API response arrives and the signal updates.
 */
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { Article, ArticleCategory, ArticleLevel } from '../../core/domain/models/article.model';
import { ArticleRepositoryPort } from '../../core/domain/ports/article.repository.port';
import { NewsAggregatorService } from '../services/news-aggregator.service';

@Injectable({ providedIn: 'root' })
export class DynamicArticleRepository extends ArticleRepositoryPort {
  private readonly aggregator = inject(NewsAggregatorService);
  private _initialized = false;

  /**
   * Long-lived Observable derived from the aggregator's articles Signal.
   * Emits the current articles array immediately on subscription, then
   * re-emits every time the signal value changes (e.g. after an API fetch).
   */
  private readonly articles$ = toObservable(this.aggregator.articles);

  private ensureLoaded(): void {
    if (!this._initialized) {
      this._initialized = true;
      this.aggregator.refresh();
    }
  }

  getAll(): Observable<Article[]> {
    this.ensureLoaded();
    return this.articles$;
  }

  getById(id: string): Observable<Article | undefined> {
    this.ensureLoaded();
    return this.articles$.pipe(map((articles) => articles.find((a) => a.id === id)));
  }

  getBySlug(slug: string): Observable<Article | undefined> {
    this.ensureLoaded();
    return this.articles$.pipe(map((articles) => articles.find((a) => a.slug === slug)));
  }

  getByCategory(category: ArticleCategory): Observable<Article[]> {
    this.ensureLoaded();
    return this.articles$.pipe(map((articles) => articles.filter((a) => a.category === category)));
  }

  getByLevel(level: ArticleLevel): Observable<Article[]> {
    this.ensureLoaded();
    return this.articles$.pipe(map((articles) => articles.filter((a) => a.level === level)));
  }

  getFeatured(): Observable<Article | undefined> {
    this.ensureLoaded();
    return this.articles$.pipe(map((articles) => articles[0]));
  }

  getRecent(limit: number): Observable<Article[]> {
    this.ensureLoaded();
    return this.articles$.pipe(map((articles) => articles.slice(0, limit)));
  }

  getRelated(articleId: string, limit = 3): Observable<Article[]> {
    this.ensureLoaded();
    return this.articles$.pipe(
      map((articles) => {
        const article = articles.find((a) => a.id === articleId);
        if (!article) return [];
        return article.relatedIds
          .map((id) => articles.find((a) => a.id === id))
          .filter((a): a is Article => a !== undefined)
          .slice(0, limit);
      }),
    );
  }
}

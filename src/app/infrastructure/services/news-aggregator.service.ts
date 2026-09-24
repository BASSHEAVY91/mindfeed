/**
 * NewsAggregatorService
 * ──────────────────────────────────────────────────────────────────────────────
 * Hexagonal Infrastructure layer: orchestrates all external news sources and
 * merges them with the static seed data. Results are cached in a Signal so
 * every component gets reactive updates without re-fetching.
 *
 * Sources priority:
 *   1. The Guardian Open API  (live, free tier)
 *   2. Static articles.data   (always available fallback)
 *
 * The service deduplicates by slug and sorts by publishedAt DESC.
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Article } from '../../core/domain/models/article.model';
import { GuardianNewsService } from './guardian-news.service';
import { STATIC_ARTICLES } from '../data/articles.data';
import { environment } from '../../../environments/environment';

export type FetchState = 'idle' | 'loading' | 'success' | 'error';

export interface AggregatorState {
  articles: Article[];
  state: FetchState;
  error: string | null;
  lastUpdated: Date | null;
}

@Injectable({ providedIn: 'root' })
export class NewsAggregatorService {
  private readonly guardian = inject(GuardianNewsService);

  // ─── State signal (single source of truth) ────────────────────────────────
  private readonly _state = signal<AggregatorState>({
    articles: STATIC_ARTICLES,
    state: 'idle',
    error: null,
    lastUpdated: null,
  });

  readonly state = this._state.asReadonly();

  // ─── Derived signals ──────────────────────────────────────────────────────
  readonly articles = computed(() => this._state().articles);
  readonly isLoading = computed(() => this._state().state === 'loading');
  readonly hasError = computed(() => this._state().state === 'error');

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Trigger a full refresh from all external sources.
   * Safe to call multiple times – ignores concurrent calls while loading.
   */
  refresh(): void {
    if (this._state().state === 'loading') return;

    if (!environment.useDynamicNews) {
      this._state.set({
        articles: STATIC_ARTICLES,
        state: 'success',
        error: null,
        lastUpdated: new Date(),
      });
      return;
    }

    this._state.update((s) => ({ ...s, state: 'loading', error: null }));

    // forkJoin waits for ALL guardian queries to complete (or fail individually)
    const queries$ = this.guardian.fetchAll(5);

    forkJoin(queries$).subscribe({
      next: (results) => {
        const live: Article[] = results.flat().map((a) => ({
          ...a,
          sourceLabel: a.sourceLabel ?? 'The Guardian',
        }));

        const merged = this.mergeAndDeduplicate(live, STATIC_ARTICLES);

        this._state.set({
          articles: merged,
          state: 'success',
          error: null,
          lastUpdated: new Date(),
        });
      },
      error: (err) => {
        console.error('[NewsAggregator] Fatal fetch error – falling back to static data', err);
        this._state.set({
          articles: STATIC_ARTICLES,
          state: 'error',
          error: err?.message ?? 'Unknown error',
          lastUpdated: new Date(),
        });
      },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Merge live articles (priority) with static fallback.
   * Deduplication: live articles take precedence; static ones fill gaps.
   * Sorted by publishedAt DESC (newest first).
   */
  private mergeAndDeduplicate(live: Article[], fallback: Article[]): Article[] {
    const seen = new Set<string>();
    const result: Article[] = [];

    for (const a of live) {
      const key = a.slug || a.id;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(a);
      }
    }

    for (const a of fallback) {
      const key = a.slug || a.id;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ ...a, sourceLabel: a.sourceLabel ?? 'MindFeed' });
      }
    }

    return result.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  }
}

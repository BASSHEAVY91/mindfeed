import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface MyMemoryResponse {
  responseData: { translatedText: string };
  responseStatus: number;
}

export interface TranslatedArticle {
  title: string;
  summary: string;
  body: string;
  funFact?: string;
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private http = inject(HttpClient);
  private readonly API = 'https://api.mymemory.translated.net/get';
  private cache = new Map<string, TranslatedArticle>();

  /** Translate a single string via MyMemory (max ~500 chars) */
  private translateChunk(text: string, from: string, to: string): Observable<string> {
    if (!text?.trim()) return of(text);
    const params = new HttpParams()
      .set('q', text.slice(0, 500))
      .set('langpair', `${from}|${to}`);
    return this.http.get<MyMemoryResponse>(this.API, { params }).pipe(
      map(r => r.responseData?.translatedText ?? text),
      catchError(() => of(text)),
    );
  }

  /** Split long text into ≤500-char chunks and translate each, then join */
  private translateLong(text: string, from: string, to: string): Observable<string> {
    if (!text?.trim()) return of(text);
    const CHUNK = 480;
    const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [text];
    const chunks: string[] = [];
    let current = '';
    for (const s of sentences) {
      if ((current + s).length > CHUNK) {
        if (current) chunks.push(current.trim());
        current = s;
      } else {
        current += s;
      }
    }
    if (current.trim()) chunks.push(current.trim());

    if (chunks.length === 0) return of(text);

    return forkJoin(chunks.map(c => this.translateChunk(c, from, to))).pipe(
      map(parts => parts.join(' ')),
    );
  }

  /**
   * Translate title, summary, body (and optional funFact) of an article.
   * Results are cached by cacheKey to avoid repeated API calls.
   */
  translateArticle(
    cacheKey: string,
    title: string,
    summary: string,
    body: string,
    funFact: string | undefined,
    from = 'en',
    to = 'es',
  ): Observable<TranslatedArticle> {
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!);
    }

    const obs: Observable<string>[] = [
      this.translateChunk(title, from, to),
      this.translateLong(summary, from, to),
      this.translateLong(body, from, to),
      funFact ? this.translateLong(funFact, from, to) : of(''),
    ];

    return forkJoin(obs).pipe(
      map(([t, s, b, f]) => {
        const result: TranslatedArticle = { title: t, summary: s, body: b, funFact: f || undefined };
        this.cache.set(cacheKey, result);
        return result;
      }),
      catchError(() => of({ title, summary, body, funFact })),
    );
  }
}

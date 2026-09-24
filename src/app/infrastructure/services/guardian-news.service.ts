/**
 * The Guardian Open Platform API Adapter
 * Free API – register at: https://open-platform.theguardian.com/access/
 * 'test' key works for demo (500 calls/day with full production key)
 *
 * Docs: https://open-platform.theguardian.com/documentation/
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { Article } from '../../core/domain/models/article.model';
import { environment } from '../../../environments/environment';

// ─── Raw response types ────────────────────────────────────────────────────────

interface GuardianFields {
  trailText?: string;
  bodyText?: string;
  thumbnail?: string;
  byline?: string;
  wordcount?: string;
  shortUrl?: string;
}

interface GuardianResult {
  id: string;
  type: string;
  sectionId: string;
  sectionName: string;
  webPublicationDate: string;
  webTitle: string;
  webUrl: string;
  fields?: GuardianFields;
  tags?: Array<{ id: string; webTitle: string }>;
}

interface GuardianResponse {
  response: {
    status: string;
    total: number;
    results: GuardianResult[];
  };
}

// ─── Category/topic queries ────────────────────────────────────────────────────

const QUERIES: Array<{
  q: string;
  section: string;
  category: Article['category'];
  level: Article['level'];
}> = [
  {
    q: 'neuroscience brain neuroplasticity',
    section: 'science',
    category: 'neurociencia',
    level: 'avanzado',
  },
  {
    q: 'sleep memory cognitive neuroscience',
    section: 'science',
    category: 'neurociencia',
    level: 'intermedio',
  },
  {
    q: 'psychology mental health therapy',
    section: 'society',
    category: 'psicologia',
    level: 'intermedio',
  },
  {
    q: 'mindfulness meditation stress wellbeing',
    section: 'lifeandstyle',
    category: 'bienestar',
    level: 'basico',
  },
  {
    q: 'gut microbiome brain serotonin',
    section: 'science',
    category: 'ciencia',
    level: 'intermedio',
  },
  {
    q: 'cognitive science learning behavior',
    section: 'science',
    category: 'ciencia',
    level: 'avanzado',
  },
];

// ─── Unsplash fallback images by category ─────────────────────────────────────

const FALLBACK_IMAGES: Record<Article['category'], string[]> = {
  neurociencia: [
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=800&h=400&fit=crop',
  ],
  psicologia: [
    'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800&h=400&fit=crop',
  ],
  bienestar: [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
  ],
  ciencia: [
    'https://images.unsplash.com/photo-1532094349884-543559c0e8e0?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1607827448452-6fda561309b4?w=800&h=400&fit=crop',
  ],
};

function pickFallbackImage(category: Article['category'], seed: number): string {
  const imgs = FALLBACK_IMAGES[category];
  return imgs[seed % imgs.length];
}

function estimateReadingMinutes(text: string): number {
  const words = text ? text.split(/\s+/).length : 200;
  return Math.max(2, Math.round(words / 200));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

@Injectable({ providedIn: 'root' })
export class GuardianNewsService {
  private readonly http = inject(HttpClient);
  private readonly BASE = 'https://content.guardianapis.com/search';

  /**
   * Fetch articles from The Guardian for a single query config.
   * Returns empty array on error (network, CORS, quota exceeded).
   */
  fetchByQuery(
    q: string,
    section: string,
    category: Article['category'],
    level: Article['level'],
    pageSize = 5,
  ): Observable<Article[]> {
    const params = new HttpParams({
      fromObject: {
        q,
        section,
        'show-fields': 'trailText,bodyText,thumbnail,byline,wordcount,shortUrl',
        'show-tags': 'keyword',
        'page-size': String(pageSize),
        'order-by': 'newest',
        'api-key': environment.guardianApiKey,
      },
    });


    if (!environment.guardianApiKey) {
      console.info('[GuardianNewsService] No API key configured – skipping fetch. Register at https://open-platform.theguardian.com/access/');
      return of([]);
    }

    return this.http.get<GuardianResponse>(this.BASE, { params }).pipe(
      map((res) =>
        (res.response.results ?? []).map((item, idx) =>
          this.mapToArticle(item, category, level, idx),
        ),
      ),
      catchError((err) => {
        console.warn('[GuardianNewsService] fetch error:', err.message ?? err);
        return of([]);
      }),
    );
  }

  /** Run all predefined queries and flatten results */
  fetchAll(pageSize = 4): Observable<Article[]>[] {
    return QUERIES.map((cfg) =>
      this.fetchByQuery(cfg.q, cfg.section, cfg.category, cfg.level, pageSize),
    );
  }

  // ─── Mapper ──────────────────────────────────────────────────────────────────

  private mapToArticle(
    item: GuardianResult,
    category: Article['category'],
    level: Article['level'],
    idx: number,
  ): Article {
    const fields = item.fields ?? {};
    const body = fields.bodyText ?? fields.trailText ?? '';
    const summary = fields.trailText
      ? fields.trailText.replace(/<[^>]+>/g, '').slice(0, 200)
      : item.webTitle;

    const tags = (item.tags ?? [])
      .map((t) => t.webTitle.toLowerCase())
      .slice(0, 5);

    // Keep Guardian article id as stable identifier
    const id = `guardian-${item.id.replace(/\//g, '-')}`;
    const slug = slugify(item.webTitle) || id;

    const imageUrl =
      fields.thumbnail && fields.thumbnail.startsWith('http')
        ? fields.thumbnail
        : pickFallbackImage(category, idx);

    return {
      id,
      slug,
      title: item.webTitle,
      summary,
      body: body.replace(/<[^>]+>/g, '').slice(0, 2000) || summary,
      funFact: '',
      category,
      level,
      author: fields.byline ?? 'The Guardian',
      institution: 'The Guardian',
      publishedAt: item.webPublicationDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      readingMinutes: estimateReadingMinutes(body),
      imageUrl,
      tags,
      relatedIds: [],
      sourceUrl: item.webUrl,
      language: 'en',
    } satisfies Article & { sourceUrl?: string };
  }
}

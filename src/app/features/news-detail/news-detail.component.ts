import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { Article } from '../../core/domain/models/article.model';
import { Favorite } from '../../core/domain/models/favorite.model';
import { GetArticleBySlugUseCase } from '../../core/application/use-cases/get-article-by-slug.use-case';
import { GetArticlesUseCase } from '../../core/application/use-cases/get-articles.use-case';
import { ManageFavoritesUseCase } from '../../core/application/use-cases/manage-favorites.use-case';
import { TranslationService, TranslatedArticle } from '../../infrastructure/services/translation.service';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, TitleCasePipe],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      @if (article()) {
        <!-- BREADCRUMB -->
        <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <a routerLink="/" class="hover:text-brand-600">Inicio</a>
          <span>/</span>
          <a routerLink="/noticias" class="hover:text-brand-600">Noticias</a>
          <span>/</span>
          <span class="text-gray-700 truncate max-w-xs">{{ displayTitle() }}</span>
        </nav>

        <!-- META BADGES -->
        <div class="flex flex-wrap gap-2 mb-4">
          <span [class]="'px-3 py-1 rounded-full text-xs font-bold text-white ' + catColor(article()!.category)">
            {{ catIcon(article()!.category) }} {{ article()!.category | titlecase }}
          </span>
          <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            {{ lvlIcon(article()!.level) }} {{ article()!.level | titlecase }}
          </span>
          <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            ⏱ {{ article()!.readingMinutes }} min lectura
          </span>
          <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 inline-flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
            </svg>
            {{ article()!.publishedAt | date:'mediumDate' }}
          </span>

          <!-- TRANSLATE BADGE/BUTTON — solo visible si el artículo es en inglés -->
          @if (!isSpanish()) {
            <button (click)="toggleTranslation()"
              [disabled]="translating()"
              [class]="'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all ' +
                (translated() ? 'bg-brand-600 border-brand-600 text-white' : 'border-brand-400 text-brand-700 hover:bg-brand-50')">
              @if (translating()) {
                <svg class="w-3.5 h-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Traduciendo...
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
                </svg>
                {{ translated() ? 'Ver en inglés' : 'Traducir al español' }}
              }
            </button>
          }
        </div>

        <!-- TRANSLATION ERROR NOTICE -->
        @if (translationError()) {
          <div class="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            No se pudo conectar con el servicio de traducción. Verifica tu conexión e inténtalo de nuevo.
          </div>
        }

        <!-- LANGUAGE INDICATOR -->
        @if (translated()) {
          <div class="inline-flex items-center gap-1.5 text-xs text-brand-600 font-semibold bg-brand-50 border border-brand-200 rounded-lg px-3 py-1.5 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
            </svg>
            Traducido al español · Traducción automática vía MyMemory
          </div>
        }

        <!-- TITLE -->
        <h1 class="text-3xl font-black text-brand-900 leading-tight mb-3">{{ displayTitle() }}</h1>
        <p class="text-gray-500 text-sm mb-6">Por <strong>{{ article()!.author }}</strong></p>

        <!-- HERO IMAGE -->
        <div class="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden mb-8">
          <img [src]="article()!.imageUrl" [alt]="article()!.title"
            class="w-full h-full object-cover" loading="eager" />
          <div class="absolute inset-0 bg-gradient-to-t from-brand-900/60 to-transparent"></div>
        </div>

        <!-- BODY -->
        <div class="prose prose-lg max-w-none text-gray-800 leading-relaxed mb-8">
          <p class="text-lg font-semibold text-brand-800 mb-4">{{ displaySummary() }}</p>
          <p class="mb-4">{{ displayBody() }}</p>
        </div>

        <!-- DID YOU KNOW -->
        @if (displayFunFact()) {
          <div class="bg-brand-50 border-l-4 border-brand-500 rounded-xl p-5 mb-8">
            <p class="text-sm font-bold text-brand-700 mb-1">💡 ¿Sabías que...?</p>
            <p class="text-gray-700 text-sm leading-relaxed">{{ displayFunFact() }}</p>
          </div>
        }

        <!-- SOURCE REFERENCE -->
        @if (article()!.sourceUrl) {
          <div class="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
            <span>Fuente:</span>
            <a [href]="article()!.sourceUrl" target="_blank" rel="noopener noreferrer"
              class="font-semibold text-brand-600 hover:text-brand-800 hover:underline truncate max-w-xs sm:max-w-none transition-colors">
              {{ article()!.sourceLabel ?? 'The Guardian' }} ↗
            </a>
          </div>
        }

        <!-- ACTIONS -->
        <div class="flex flex-wrap gap-3 mb-10">
          <button (click)="toggleFav()"
            [class]="'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all ' +
              (isFav() ? 'bg-yellow-400 border-yellow-400 text-white' : 'border-brand-500 text-brand-700 hover:bg-brand-50')">
            {{ isFav() ? '⭐ Guardado en Favoritos' : '☆ Guardar en Favoritos' }}
          </button>
          <a routerLink="/contacto"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all">
            ✉️ Contactar editorial
          </a>
          <a routerLink="/noticias"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-brand-600 text-white hover:bg-brand-700 transition-all">
            ← Volver al listado
          </a>
        </div>

        <!-- RELATED ARTICLES -->
        @if (related().length > 0) {
          <div class="border-t border-gray-100 pt-8">
            <h3 class="text-lg font-bold text-brand-800 mb-4">📌 Noticias relacionadas</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              @for (rel of related(); track rel.id) {
                <a [routerLink]="['/noticias', rel.slug]"
                  class="group flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all">
                  <div class="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <img [src]="rel.imageUrl" [alt]="rel.title"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <p class="text-xs font-semibold text-gray-700 leading-snug line-clamp-3">{{ rel.title }}</p>
                </a>
              }
            </div>
          </div>
        }

      } @else if (loading()) {
        <div class="flex justify-center items-center py-24">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent"></div>
        </div>
      } @else {
        <div class="text-center py-20">
          <div class="text-6xl mb-4">🔍</div>
          <h2 class="text-xl font-bold text-gray-700 mb-2">Artículo no encontrado</h2>
          <a routerLink="/noticias" class="text-brand-600 underline font-semibold">← Volver al listado</a>
        </div>
      }
    </div>
  `,
})
export class NewsDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private getBySlug = inject(GetArticleBySlugUseCase);
  private getArticles = inject(GetArticlesUseCase);
  private favUseCase = inject(ManageFavoritesUseCase);
  private translationSvc = inject(TranslationService);

  article = signal<Article | null | undefined>(undefined);
  loading = signal(true);

  // ── Translation state ──────────────────────────────────────────
  translated = signal(false);
  translating = signal(false);
  translationError = signal(false);
  private translatedData = signal<TranslatedArticle | null>(null);

  // ── Language detection — oculta el botón Traducir en artículos ya en español
  isSpanish = computed(() => (this.article()?.language ?? 'es') !== 'en');

  // ── Displayed content (original or translated) ─────────────────
  displayTitle   = computed(() => this.translated() && this.translatedData() ? this.translatedData()!.title   : (this.article()?.title   ?? ''));
  displaySummary = computed(() => this.translated() && this.translatedData() ? this.translatedData()!.summary : (this.article()?.summary ?? ''));
  displayBody    = computed(() => this.translated() && this.translatedData() ? this.translatedData()!.body    : (this.article()?.body    ?? ''));
  displayFunFact = computed(() => this.translated() && this.translatedData() ? this.translatedData()!.funFact : (this.article()?.funFact));

  private _favTick = signal(0);
  isFav = computed(() => {
    this._favTick();
    const a = this.article();
    if (!a) return false;
    return this.favUseCase.isFavorite(a.id);
  });

  private allArticles = toSignal(this.getArticles.execute(), { initialValue: [] as Article[] });

  related = computed<Article[]>(() => {
    const a = this.article();
    if (!a) return [];
    return this.allArticles()
      .filter(x => x.id !== a.id && x.category === a.category)
      .slice(0, 3);
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(map(p => p.get('slug') ?? '')).subscribe(slug => {
      this.loading.set(true);
      // Reset translation state when navigating to a new article
      this.translated.set(false);
      this.translatedData.set(null);
      this.translationError.set(false);
      this.getBySlug.execute(slug).subscribe({
        next: art => { this.article.set(art ?? null); this.loading.set(false); },
        error: () => { this.article.set(null); this.loading.set(false); },
      });
    });
  }

  // ── Translation toggle ─────────────────────────────────────────
  toggleTranslation(): void {
    // If already translated → switch back to original
    if (this.translated()) {
      this.translated.set(false);
      return;
    }
    const a = this.article();
    if (!a) return;

    this.translating.set(true);
    this.translationError.set(false);

    this.translationSvc
      .translateArticle(a.slug, a.title, a.summary, a.body ?? '', a.funFact, 'en', 'es')
      .subscribe({
        next: result => {
          this.translatedData.set(result);
          this.translated.set(true);
          this.translating.set(false);
        },
        error: () => {
          this.translating.set(false);
          this.translationError.set(true);
        },
      });
  }

  // ── Favorites ──────────────────────────────────────────────────
  toggleFav(): void {
    const a = this.article();
    if (!a) return;
    const fav: Favorite = {
      articleId: a.id,
      title: a.title,
      category: a.category,
      level: a.level,
      readingMinutes: a.readingMinutes,
      imageUrl: a.imageUrl,
      slug: a.slug,
      savedAt: new Date().toISOString(),
    };
    this.favUseCase.toggle(fav);
    this._favTick.update(v => v + 1);
  }

  // ── Category helpers ───────────────────────────────────────────
  catColor(cat: string): string {
    const m: Record<string, string> = {
      neurociencia: 'bg-brand-600',
      psicologia: 'bg-brand-500',
      bienestar: 'bg-brand-400',
      ciencia: 'bg-orange-400',
    };
    return m[cat] ?? 'bg-gray-500';
  }

  catIcon(cat: string): string {
    const m: Record<string, string> = {
      neurociencia: '🧠',
      psicologia: '💭',
      bienestar: '🌿',
      ciencia: '🔬',
    };
    return m[cat] ?? '📰';
  }

  lvlIcon(level: string): string {
    const m: Record<string, string> = { basico: '⚡', intermedio: '📘', avanzado: '🎓' };
    return m[level] ?? '📖';
  }
}

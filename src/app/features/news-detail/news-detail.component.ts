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
          <span class="text-gray-700 truncate max-w-xs">{{ article()!.title }}</span>
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
          <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            📅 {{ article()!.publishedAt | date:'mediumDate' }}
          </span>
        </div>

        <!-- TITLE -->
        <h1 class="text-3xl font-black text-brand-900 leading-tight mb-3">{{ article()!.title }}</h1>
        <p class="text-gray-500 text-sm mb-6">Por <strong>{{ article()!.author }}</strong></p>

        <!-- HERO IMAGE -->
        <div class="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden mb-8">
          <img [src]="article()!.imageUrl" [alt]="article()!.title"
            class="w-full h-full object-cover" loading="eager" />
          <div class="absolute inset-0 bg-gradient-to-t from-brand-900/60 to-transparent"></div>
        </div>

        <!-- BODY -->
        <div class="prose prose-lg max-w-none text-gray-800 leading-relaxed mb-8">
          <p class="text-lg font-semibold text-brand-800 mb-4">{{ article()!.summary }}</p>
          <p class="mb-4">{{ article()!.body }}</p>
        </div>

        <!-- DID YOU KNOW -->
        @if (article()!.funFact) {
          <div class="bg-brand-50 border-l-4 border-brand-500 rounded-xl p-5 mb-8">
            <p class="text-sm font-bold text-brand-700 mb-1">💡 ¿Sabías que...?</p>
            <p class="text-gray-700 text-sm leading-relaxed">{{ article()!.funFact }}</p>
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

  article = signal<Article | null | undefined>(undefined);
  loading = signal(true);

  private _favTick = signal(0);
  isFav = computed(() => {
    this._favTick();
    const a = this.article();
    if (!a) return false;
    return this.favUseCase.getAll().some(f => f.articleId === a.id);
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
      this.getBySlug.execute(slug).subscribe({
        next: art => { this.article.set(art ?? null); this.loading.set(false); },
        error: () => { this.article.set(null); this.loading.set(false); },
      });
    });
  }

  toggleFav(): void {
    const a = this.article();
    if (!a) return;
    const fav: Favorite = {
      articleId: a.id, title: a.title, category: a.category,
      level: a.level, readingMinutes: a.readingMinutes,
      imageUrl: a.imageUrl, slug: a.slug, savedAt: new Date().toISOString(),
    };
    this.favUseCase.toggle(fav);
    this._favTick.update(n => n + 1);
  }

  catColor(cat: string): string {
    const map: Record<string, string> = {
      neurociencia: 'bg-brand-700', psicologia: 'bg-brand-500',
      bienestar: 'bg-brand-400', ciencia: 'bg-orange-400',
    };
    return map[cat] ?? 'bg-gray-400';
  }

  catIcon(cat: string): string {
    const map: Record<string, string> = {
      neurociencia: '🧠', psicologia: '💭', bienestar: '💚', ciencia: '🔬',
    };
    return map[cat] ?? '📰';
  }

  lvlIcon(lvl: string): string {
    const map: Record<string, string> = { basico: '⚡', intermedio: '📘', avanzado: '🎓' };
    return map[lvl] ?? '';
  }
}

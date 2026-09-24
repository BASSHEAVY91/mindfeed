import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Article } from '../../core/domain/models/article.model';
import { Favorite } from '../../core/domain/models/favorite.model';
import { GetArticlesUseCase } from '../../core/application/use-cases/get-articles.use-case';
import { ManageFavoritesUseCase } from '../../core/application/use-cases/manage-favorites.use-case';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';

const CATEGORY_LABELS: Record<string, string> = {
  neurociencia: 'Neurociencia', psicologia: 'Psicología',
  bienestar: 'Bienestar', ciencia: 'Ciencia',
};
const LEVEL_LABELS: Record<string, string> = {
  basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado',
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ArticleCardComponent],
  template: `
    <!-- HERO -->
    <section class="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-400 text-white py-20 px-4">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute w-72 h-72 rounded-full border border-white/10 -top-16 -right-16"></div>
        <div class="absolute w-40 h-40 rounded-full border border-white/8 top-10 right-32"></div>
        <div class="absolute w-52 h-52 rounded-full bg-white/5 -bottom-20 -left-10"></div>
      </div>
      <div class="relative max-w-4xl mx-auto text-center">
        <span class="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6 tracking-wide">
          ⭐ DIVULGACIÓN CIENTÍFICA DE CALIDAD
        </span>
        <h1 class="text-4xl md:text-5xl font-black leading-tight mb-4">
          Alimenta tu mente<br/>con ciencia real
        </h1>
        <p class="text-lg text-white/85 max-w-xl mx-auto mb-8">
          Neurociencia, psicología y bienestar mental con rigor académico y lenguaje accesible para todos.
        </p>
        <div class="flex flex-wrap gap-3 justify-center">
          <a routerLink="/noticias"
            class="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors shadow-lg">
            Explorar noticias →
          </a>
          <a routerLink="/noticias"
            class="inline-flex items-center gap-2 border border-white/50 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
            Ver categorías
          </a>
        </div>
      </div>
    </section>

    <!-- STATS BAR -->
    <section class="bg-brand-800 text-white py-4">
      <div class="max-w-4xl mx-auto grid grid-cols-4 divide-x divide-white/20 text-center">
        @for (stat of stats; track stat.label) {
          <div class="px-4 py-2">
            <div class="text-xl font-black text-brand-300">{{ stat.value }}</div>
            <div class="text-xs text-white/70">{{ stat.label }}</div>
          </div>
        }
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="bg-brand-50 py-6 px-4">
      <div class="max-w-4xl mx-auto flex flex-wrap gap-2 justify-center">
        @for (cat of categories; track cat.key) {
          <a [routerLink]="['/noticias']" [queryParams]="{ categoria: cat.key }"
            [class]="'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ' + cat.style">
            {{ cat.emoji }} {{ cat.label }}
          </a>
        }
      </div>
    </section>

    <!-- FEATURED ARTICLE -->
    @if (featured()) {
      <section class="max-w-5xl mx-auto px-4 py-8">
        <h2 class="text-lg font-bold text-brand-800 mb-4 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
          </svg>
          Noticia Destacada
        </h2>
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden grid md:grid-cols-2">
          <div class="relative h-56 md:h-auto overflow-hidden">
            <img [src]="featured()!.imageUrl" [alt]="featured()!.title"
              class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <span class="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">🔥 TENDENCIA</span>
          </div>
          <div class="p-6 flex flex-col justify-center">
            <div class="flex gap-2 mb-3 text-xs text-gray-500">
              <span class="bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">
                {{ CATEGORY_LABELS[featured()!.category] }}
              </span>
              <span>{{ LEVEL_LABELS[featured()!.level] }}</span>
              <span>⏱ {{ featured()!.readingMinutes }} min</span>
            </div>
            <h3 class="text-xl font-black text-gray-800 leading-snug mb-3">{{ featured()!.title }}</h3>
            <p class="text-sm text-gray-500 mb-5">{{ featured()!.summary }}</p>
            <div class="flex items-center gap-3">
              <a [routerLink]="['/noticias', featured()!.slug]"
                class="inline-flex items-center gap-1 bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-brand-700 transition-colors">
                Leer artículo →
              </a>
              <button (click)="toggleFav(featured()!)"
                class="p-2 rounded-full border border-gray-200 hover:bg-amber-50 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24"
                  [attr.fill]="isFav(featured()!.id) ? '#f59e0b' : 'none'"
                  stroke="#f59e0b" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    }

    <!-- RECENT NEWS GRID -->
    <section class="max-w-5xl mx-auto px-4 pb-12">
      <h2 class="text-lg font-bold text-brand-800 mb-4 flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
        </svg>
        Noticias Recientes
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (article of recent(); track article.id) {
          <app-article-card
            [article]="article"
            [showFavorite]="true"
            [isFav]="isFav(article.id)"
            (toggleFav)="toggleFav($event)"
          />
        }
      </div>
      <div class="text-center mt-8">
        <a routerLink="/noticias"
          class="inline-flex items-center gap-2 border-2 border-brand-600 text-brand-700 font-semibold px-6 py-3 rounded-xl hover:bg-brand-600 hover:text-white transition-colors">
          Ver todas las noticias →
        </a>
      </div>
    </section>
  `,
})
export class HomeComponent {
  readonly CATEGORY_LABELS = CATEGORY_LABELS;
  readonly LEVEL_LABELS = LEVEL_LABELS;

  private getArticlesUseCase = inject(GetArticlesUseCase);
  private favUseCase = inject(ManageFavoritesUseCase);

  featured = toSignal(this.getArticlesUseCase.getFeatured());
  recent = toSignal(this.getArticlesUseCase.getRecent(6), { initialValue: [] as Article[] });

  private _favTick = signal(0);
  favIds = computed<Set<string>>(() => {
    this._favTick();
    return new Set(this.favUseCase.getAll().map(f => f.articleId));
  });

  readonly stats = [
    { value: '2.4K', label: 'Artículos' },
    { value: '4', label: 'Categorías' },
    { value: '8 min', label: 'Promedio lectura' },
    { value: '12K', label: 'Lectores' },
  ];

  readonly categories = [
    { key: 'neurociencia', label: 'Neurociencia', emoji: '🧠', style: 'bg-brand-100 text-brand-700 border-brand-200 hover:bg-brand-200' },
    { key: 'psicologia',   label: 'Psicología',   emoji: '💭', style: 'bg-brand-100 text-brand-600 border-brand-200 hover:bg-brand-200' },
    { key: 'bienestar',    label: 'Bienestar',    emoji: '💚', style: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' },
    { key: 'ciencia',      label: 'Ciencia',      emoji: '🔬', style: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200' },
  ];

  isFav(id: string): boolean {
    return this.favIds().has(id);
  }

  toggleFav(article: Article) {
    const fav: Favorite = {
      articleId: article.id,
      title: article.title,
      category: article.category,
      level: article.level,
      readingMinutes: article.readingMinutes,
      imageUrl: article.imageUrl,
      slug: article.slug,
      savedAt: new Date().toISOString(),
    };
    this.favUseCase.toggle(fav);
    this._favTick.update(n => n + 1);
  }
}

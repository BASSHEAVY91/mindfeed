import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Article, ArticleCategory, ArticleLevel } from '../../core/domain/models/article.model';
import { Favorite } from '../../core/domain/models/favorite.model';
import { GetArticlesUseCase } from '../../core/application/use-cases/get-articles.use-case';
import { ManageFavoritesUseCase } from '../../core/application/use-cases/manage-favorites.use-case';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';

type CatFilter = ArticleCategory | 'all';
type LvlFilter = ArticleLevel | 'all';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [ArticleCardComponent],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-black text-brand-800 mb-2">Noticias</h1>
      <p class="text-gray-500 mb-6">Explora artículos de neurociencia, psicología, bienestar y ciencia.</p>

      <!-- FILTERS -->
      <div class="flex flex-wrap gap-2 mb-8">
        <span class="text-sm text-gray-500 self-center mr-1">Categoría:</span>
        @for (f of catFilters; track f.value) {
          <button (click)="setCategory(f.value)"
            [class]="'px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ' +
              (selectedCat() === f.value ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400')">
            {{ f.label }}
          </button>
        }
        <span class="text-sm text-gray-400 self-center mx-2">|</span>
        <span class="text-sm text-gray-500 self-center mr-1">Nivel:</span>
        @for (f of lvlFilters; track f.value) {
          <button (click)="setLevel(f.value)"
            [class]="'px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ' +
              (selectedLvl() === f.value ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400')">
            {{ f.label }}
          </button>
        }
      </div>

      <!-- RESULTS COUNT -->
      <p class="text-sm text-gray-500 mb-4">
        📰 <strong>{{ filtered().length }}</strong> noticias encontradas
      </p>

      <!-- GRID -->
      @if (filtered().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (article of filtered(); track article.id) {
            <app-article-card
              [article]="article"
              [showFavorite]="true"
              [isFav]="isFav(article.id)"
              (toggleFav)="toggleFav($event)"
            />
          }
        </div>
      } @else {
        <div class="text-center py-16">
          <div class="text-5xl mb-4">🔍</div>
          <p class="text-gray-500">No se encontraron noticias con los filtros seleccionados.</p>
          <button (click)="resetFilters()" class="mt-4 text-brand-600 underline font-semibold">
            Limpiar filtros
          </button>
        </div>
      }
    </div>
  `,
})
export class NewsListComponent {
  private getArticlesUseCase = inject(GetArticlesUseCase);
  private favUseCase = inject(ManageFavoritesUseCase);

  private allArticles = toSignal(this.getArticlesUseCase.execute(), { initialValue: [] as Article[] });

  selectedCat = signal<CatFilter>('all');
  selectedLvl = signal<LvlFilter>('all');

  filtered = computed<Article[]>(() => {
    const cat = this.selectedCat();
    const lvl = this.selectedLvl();
    let result = this.allArticles();
    if (cat !== 'all') result = result.filter(a => a.category === cat);
    if (lvl !== 'all') result = result.filter(a => a.level === lvl);
    return result;
  });

  private _favTick = signal(0);
  favIds = computed<Set<string>>(() => {
    this._favTick();
    return new Set(this.favUseCase.getAll().map(f => f.articleId));
  });

  readonly catFilters: { value: CatFilter; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'neurociencia', label: '🧠 Neurociencia' },
    { value: 'psicologia', label: '💭 Psicología' },
    { value: 'bienestar', label: '💚 Bienestar' },
    { value: 'ciencia', label: '🔬 Ciencia' },
  ];

  readonly lvlFilters: { value: LvlFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'basico', label: '⚡ Básico' },
    { value: 'intermedio', label: '📘 Intermedio' },
    { value: 'avanzado', label: '🎓 Avanzado' },
  ];

  setCategory(cat: CatFilter): void { this.selectedCat.set(cat); }
  setLevel(lvl: LvlFilter): void { this.selectedLvl.set(lvl); }
  resetFilters(): void { this.selectedCat.set('all'); this.selectedLvl.set('all'); }

  isFav(id: string): boolean { return this.favIds().has(id); }

  toggleFav(article: Article): void {
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

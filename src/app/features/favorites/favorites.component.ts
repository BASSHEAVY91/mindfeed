import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Favorite } from '../../core/domain/models/favorite.model';
import { ManageFavoritesUseCase } from '../../core/application/use-cases/manage-favorites.use-case';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-black text-brand-800 mb-1">⭐ Mi Diario de Lectura</h1>
      <p class="text-gray-500 mb-8">Tus artículos guardados, siempre a mano.</p>

      <!-- STATS -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="bg-brand-50 rounded-2xl p-4 text-center">
          <p class="text-3xl font-black text-brand-700">{{ favs().length }}</p>
          <p class="text-xs text-gray-500 mt-1">Guardadas</p>
        </div>
        <div class="bg-brand-50 rounded-2xl p-4 text-center">
          <p class="text-3xl font-black text-brand-700">{{ uniqueCategories() }}</p>
          <p class="text-xs text-gray-500 mt-1">Categorías</p>
        </div>
        <div class="bg-brand-50 rounded-2xl p-4 text-center">
          <p class="text-3xl font-black text-brand-700">{{ totalMinutes() }}</p>
          <p class="text-xs text-gray-500 mt-1">Min leídos</p>
        </div>
      </div>

      <!-- LIST -->
      @if (favs().length > 0) {
        <div class="flex flex-col gap-4">
          @for (fav of favs(); track fav.articleId) {
            <div class="flex gap-4 p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white">
              <!-- IMAGE -->
              <div class="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <img [src]="fav.imageUrl" [alt]="fav.title"
                  class="w-full h-full object-cover" loading="lazy" />
              </div>
              <!-- INFO -->
              <div class="flex-1 min-w-0">
                <div class="flex gap-2 mb-1 flex-wrap">
                  <span [class]="'text-xs font-bold px-2 py-0.5 rounded-full text-white ' + catColor(fav.category)">
                    {{ catIcon(fav.category) }} {{ fav.category }}
                  </span>
                  <span class="text-xs text-gray-400">{{ lvlIcon(fav.level) }} {{ fav.level }} · ⏱ {{ fav.readingMinutes }} min</span>
                </div>
                <h3 class="font-bold text-gray-800 text-sm leading-snug line-clamp-2">{{ fav.title }}</h3>
              </div>
              <!-- ACTIONS -->
              <div class="flex flex-col gap-2 flex-shrink-0">
                <a [routerLink]="['/noticias', fav.slug]"
                  class="px-3 py-1.5 text-xs font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-center">
                  Ver →
                </a>
                <button (click)="remove(fav)"
                  class="px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                  🗑 Eliminar
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-20">
          <div class="text-6xl mb-4">📭</div>
          <h2 class="text-xl font-bold text-gray-600 mb-2">No tienes noticias guardadas aún</h2>
          <p class="text-gray-400 mb-6">Explora el catálogo y guarda los artículos que más te interesen.</p>
          <a routerLink="/noticias"
            class="inline-block px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors">
            Explorar noticias
          </a>
        </div>
      }
    </div>
  `,
})
export class FavoritesComponent {
  private favUseCase = inject(ManageFavoritesUseCase);
  private _tick = signal(0);

  favs = computed<Favorite[]>(() => { this._tick(); return this.favUseCase.getAll(); });
  uniqueCategories = computed(() => new Set(this.favs().map(f => f.category)).size);
  totalMinutes = computed(() => this.favs().reduce((sum, f) => sum + f.readingMinutes, 0));

  remove(fav: Favorite): void {
    this.favUseCase.remove(fav.articleId);
    this._tick.update(n => n + 1);
  }

  catColor(cat: string): string {
    const m: Record<string, string> = { neurociencia: 'bg-brand-700', psicologia: 'bg-brand-500', bienestar: 'bg-brand-400', ciencia: 'bg-orange-400' };
    return m[cat] ?? 'bg-gray-400';
  }
  catIcon(cat: string): string {
    const m: Record<string, string> = { neurociencia: '🧠', psicologia: '💭', bienestar: '💚', ciencia: '🔬' };
    return m[cat] ?? '📰';
  }
  lvlIcon(lvl: string): string {
    const m: Record<string, string> = { basico: '⚡', intermedio: '📘', avanzado: '🎓' };
    return m[lvl] ?? '';
  }
}

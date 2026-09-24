import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../../../core/domain/models/article.model';

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  neurociencia: { bg: 'bg-brand-600', text: 'text-white' },
  psicologia:   { bg: 'bg-brand-500', text: 'text-white' },
  bienestar:    { bg: 'bg-brand-400', text: 'text-white' },
  ciencia:      { bg: 'bg-orange-400', text: 'text-white' },
};

const CATEGORY_LABELS: Record<string, string> = {
  neurociencia: 'Neurociencia',
  psicologia:   'Psicología',
  bienestar:    'Bienestar',
  ciencia:      'Ciencia',
};

const LEVEL_LABELS: Record<string, string> = {
  basico: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl
      transition-all duration-300 hover:-translate-y-1 flex flex-col h-full group">
      <!-- Image -->
      <div class="relative h-44 overflow-hidden">
        <img [src]="article.imageUrl" [alt]="article.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <span [class]="'absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-full ' + catStyle.bg + ' ' + catStyle.text">
          {{ catLabel }}
        </span>
      </div>
      <!-- Body -->
      <div class="p-4 flex flex-col flex-1">
        <h3 class="font-bold text-gray-800 leading-snug mb-2 line-clamp-2 group-hover:text-brand-700 transition-colors">
          {{ article.title }}
        </h3>
        <p class="text-sm text-gray-500 line-clamp-3 flex-1">{{ article.summary }}</p>
        <!-- Footer -->
        <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div class="flex items-center gap-2 text-xs text-gray-400">
            <span>{{ levelEmoji }} {{ levelLabel }}</span>
            <span>·</span>
            <span>⏱ {{ article.readingMinutes }} min</span>
          </div>
          <div class="flex items-center gap-2">
            @if (showFavorite) {
              <button (click)="toggleFav.emit(article); $event.stopPropagation()"
                class="p-1.5 rounded-full hover:bg-brand-50 transition-colors"
                [title]="isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'">
                <svg width="16" height="16" viewBox="0 0 24 24"
                  [attr.fill]="isFav ? '#f59e0b' : 'none'"
                  stroke="#f59e0b" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
                </svg>
              </button>
            }
            <a [routerLink]="['/noticias', article.slug]"
              class="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors font-medium">
              Leer →
            </a>
          </div>
        </div>
      </div>
    </article>
  `,
})
export class ArticleCardComponent {
  @Input({ required: true }) article!: Article;
  @Input() showFavorite = true;
  @Input() isFav = false;
  @Output() toggleFav = new EventEmitter<Article>();

  get catStyle() {
    return CATEGORY_STYLES[this.article.category] ?? { bg: 'bg-gray-500', text: 'text-white' };
  }
  get catLabel() {
    return CATEGORY_LABELS[this.article.category] ?? this.article.category;
  }
  get levelLabel() {
    return LEVEL_LABELS[this.article.level] ?? this.article.level;
  }
  get levelEmoji() {
    const m: Record<string, string> = { basico: '⚡', intermedio: '📘', avanzado: '🎓' };
    return m[this.article.level] ?? '📖';
  }
}

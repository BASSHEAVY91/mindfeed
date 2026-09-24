import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Favorite } from '../../core/domain/models/favorite.model';
import { ManageFavoritesUseCase } from '../../core/application/use-cases/manage-favorites.use-case';

interface HeatDay { date: string; count: number; level: 0 | 1 | 2 | 3 | 4; }
interface CatStat { cat: string; label: string; icon: string; color: string; count: number; pct: number; }
interface Achievement { emoji: string; title: string; desc: string; unlocked: boolean; }

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const CAT_LABELS: Record<string,string> = { neurociencia:'Neurociencia', psicologia:'Psicología', bienestar:'Bienestar', ciencia:'Ciencia' };
const CAT_ICONS: Record<string,string>  = { neurociencia:'🧠', psicologia:'💭', bienestar:'💚', ciencia:'🔬' };
const CAT_DOT: Record<string,string>    = { neurociencia:'#2d7a4f', psicologia:'#4caf82', bienestar:'#80c9a0', ciencia:'#f97316' };
const CAT_BG: Record<string,string>     = { neurociencia:'bg-brand-700', psicologia:'bg-brand-500', bienestar:'bg-brand-400', ciencia:'bg-orange-400' };
const LVL_ICON: Record<string,string>   = { basico:'⚡', intermedio:'📘', avanzado:'🎓' };
const HEAT_COLORS = ['bg-gray-100','bg-brand-100','bg-brand-300','bg-brand-500','bg-brand-700'];

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">

      <!-- ── HEADER ── -->
      <h1 class="text-3xl font-black text-brand-800 mb-1">📅 Mi Diario de Lectura</h1>
      <p class="text-gray-500 mb-8">Tu historial de lectura y artículos guardados.</p>

      <!-- ── STATS BAR ── -->
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

      <!-- ── HEATMAP ── -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div class="flex items-start justify-between mb-4 gap-2 flex-wrap">
          <h2 class="font-bold text-gray-800">🗓 Hábito de lectura — Últimas 8 semanas</h2>
          <span class="text-xs text-gray-400">Verde = día activo · Más oscuro = más artículos</span>
        </div>

        <!-- Month labels -->
        <div class="flex gap-1 mb-1 pl-0">
          @for (col of heatmapWeeks(); track $index) {
            <div class="w-7 flex-shrink-0 text-center">
              @if (monthLabelAt($index)) {
                <span class="text-[10px] text-gray-400 font-semibold uppercase">{{ monthLabelAt($index) }}</span>
              } @else {
                <span class="text-[10px]">&nbsp;</span>
              }
            </div>
          }
        </div>

        <!-- Grid -->
        <div class="flex gap-1">
          @for (week of heatmapWeeks(); track $index) {
            <div class="flex flex-col gap-1">
              @for (day of week; track day.date) {
                <div [class]="'w-7 h-7 rounded-md ' + heatColor(day.level)"
                  [title]="day.date + ': ' + day.count + ' artículo(s)'">
                </div>
              }
            </div>
          }
        </div>

        <!-- Legend -->
        <div class="flex items-center justify-end gap-1 mt-2">
          <span class="text-xs text-gray-400">Menos</span>
          @for (lvl of [0,1,2,3,4]; track lvl) {
            <div [class]="'w-4 h-4 rounded-sm ' + heatColor(lvl)"></div>
          }
          <span class="text-xs text-gray-400">Más</span>
        </div>

        <!-- Streak stats -->
        <div class="grid grid-cols-4 gap-3 mt-5">
          <div class="rounded-xl border border-gray-100 p-3 text-center">
            <p class="text-2xl font-black text-brand-700">{{ activeDays() }}</p>
            <p class="text-[11px] text-gray-400 uppercase tracking-wide mt-0.5">Días activos</p>
          </div>
          <div class="rounded-xl border border-gray-100 p-3 text-center">
            <p class="text-2xl font-black text-brand-700">{{ currentStreak() }}</p>
            <p class="text-[11px] text-gray-400 uppercase tracking-wide mt-0.5">Racha actual</p>
          </div>
          <div class="rounded-xl border border-gray-100 p-3 text-center">
            <p class="text-2xl font-black text-brand-700">{{ bestStreak() }}</p>
            <p class="text-[11px] text-gray-400 uppercase tracking-wide mt-0.5">Mejor racha</p>
          </div>
          <div class="rounded-xl border border-gray-100 p-3 text-center">
            <p class="text-2xl font-black text-brand-700">{{ constancy() }}%</p>
            <p class="text-[11px] text-gray-400 uppercase tracking-wide mt-0.5">Constancia</p>
          </div>
        </div>
      </div>

      <!-- ── MIS ESTADÍSTICAS ── -->
      <h2 class="font-bold text-gray-800 text-lg mb-3">📊 Mis Estadísticas de Lectura</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        <!-- Por categoría -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Por categoría</p>
          @if (categoryBreakdown().length > 0) {
            <div class="flex flex-col items-center mb-4">
              <span class="text-3xl font-black text-brand-700">{{ favs().length }}</span>
              <span class="text-xs text-gray-400">artic.</span>
            </div>
            <div class="flex flex-col gap-2">
              @for (cs of categoryBreakdown(); track cs.cat) {
                <div class="flex items-center gap-2 text-sm">
                  <span class="w-3 h-3 rounded-full flex-shrink-0" [style.background]="cs.color"></span>
                  <span class="text-gray-600 flex-1">{{ cs.label }}</span>
                  <span class="font-semibold text-gray-700">{{ cs.pct }}%</span>
                </div>
              }
            </div>
          } @else {
            <p class="text-xs text-gray-400 text-center py-4">Sin datos aún</p>
          }
        </div>

        <!-- Tiempo total / donut -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 self-start">Tiempo total</p>
          <!-- SVG donut -->
          <svg width="120" height="120" viewBox="0 0 100 100" class="mb-3">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="12"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#2d7a4f" stroke-width="12"
              stroke-linecap="round"
              [attr.stroke-dasharray]="donutDash()"
              stroke-dashoffset="62.8"
              transform="rotate(-90 50 50)"/>
            <text x="50" y="46" text-anchor="middle" font-size="16" font-weight="bold" fill="#2d7a4f">{{ totalMinutes() }}</text>
            <text x="50" y="60" text-anchor="middle" font-size="8" fill="#9ca3af">min</text>
            <text x="50" y="71" text-anchor="middle" font-size="7" fill="#9ca3af">leídos</text>
          </svg>
          <p class="text-xs text-gray-500">Meta: <strong>5h / semana</strong></p>
          <div class="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div class="bg-brand-600 h-1.5 rounded-full transition-all duration-500"
              [style.width]="weeklyPct() + '%'"></div>
          </div>
          <p class="text-xs text-gray-400 mt-1">{{ weeklyPct() }}%</p>
        </div>

        <!-- Logros -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">🏆 Logros</p>
          <div class="grid grid-cols-3 gap-2">
            @for (ach of achievements(); track ach.title) {
              <div [class]="'rounded-xl p-2 text-center ' + (ach.unlocked ? 'bg-brand-50 border border-brand-200' : 'bg-gray-50 border border-gray-100 opacity-40')">
                <div class="text-2xl mb-1">{{ ach.emoji }}</div>
                <p class="text-[11px] font-bold text-gray-700 leading-tight">{{ ach.title }}</p>
                <p class="text-[10px] text-gray-400 leading-tight">{{ ach.desc }}</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- ── MI DIARIO DE LECTURA ── -->
      <h2 class="font-bold text-gray-800 text-lg mb-3">⭐ Mi Diario de Lectura</h2>

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
                  <span [class]="'text-xs font-bold px-2 py-0.5 rounded-full text-white ' + catBg(fav.category)">
                    {{ catIcon(fav.category) }} {{ catLabel(fav.category) }}
                  </span>
                  <span class="text-xs text-gray-400">{{ lvlIcon(fav.level) }} {{ fav.level }} · ⏱ {{ fav.readingMinutes }} min</span>
                </div>
                <h3 class="font-bold text-gray-800 text-sm leading-snug line-clamp-2">{{ fav.title }}</h3>
                @if (fav.savedAt) {
                  <p class="text-xs text-gray-400 mt-1">Guardado: {{ formatSavedAt(fav.savedAt) }}</p>
                }
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

  readonly WEEKLY_GOAL = 300;
  readonly DONUT_R = 40;
  readonly DONUT_CIRC = 2 * Math.PI * 40;

  favs = computed<Favorite[]>(() => { this._tick(); return this.favUseCase.getAll(); });

  uniqueCategories = computed(() => new Set(this.favs().map(f => f.category)).size);
  totalMinutes = computed(() => this.favs().reduce((s, f) => s + f.readingMinutes, 0));

  private dateCountMap = computed(() => {
    const map = new Map<string, number>();
    for (const fav of this.favs()) {
      if (fav.savedAt) {
        const d = fav.savedAt.slice(0, 10);
        map.set(d, (map.get(d) ?? 0) + 1);
      }
    }
    return map;
  });

  heatmapWeeks = computed<HeatDay[][]>(() => {
    const map = this.dateCountMap();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dow = today.getDay();
    const daysFromMon = dow === 0 ? 6 : dow - 1;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysFromMon - 49);
    const weeks: HeatDay[][] = [];
    for (let w = 0; w < 8; w++) {
      const week: HeatDay[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + w * 7 + d);
        const ds = date.toISOString().slice(0, 10);
        const count = map.get(ds) ?? 0;
        const level = (count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count <= 4 ? 3 : 4) as 0|1|2|3|4;
        week.push({ date: ds, count, level });
      }
      weeks.push(week);
    }
    return weeks;
  });

  private monthLabelsMap = computed(() => {
    const weeks = this.heatmapWeeks();
    const result = new Map<number, string>();
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const m = new Date(week[0].date).getMonth();
      if (m !== lastMonth) { result.set(i, MONTHS[m]); lastMonth = m; }
    });
    return result;
  });

  monthLabelAt(i: number): string { return this.monthLabelsMap().get(i) ?? ''; }

  activeDays = computed(() => this.heatmapWeeks().flat().filter(d => d.count > 0).length);

  currentStreak = computed(() => {
    const map = this.dateCountMap();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    const d = new Date(today);
    while (true) {
      const s = d.toISOString().slice(0, 10);
      if ((map.get(s) ?? 0) > 0) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  });

  bestStreak = computed(() => {
    let best = 0, cur = 0;
    for (const day of this.heatmapWeeks().flat()) {
      if (day.count > 0) { cur++; if (cur > best) best = cur; } else cur = 0;
    }
    return best;
  });

  constancy = computed(() => {
    const total = this.heatmapWeeks().flat().length;
    return total > 0 ? Math.round((this.activeDays() / total) * 100) : 0;
  });

  categoryBreakdown = computed<CatStat[]>(() => {
    const list = this.favs();
    const total = list.length;
    if (!total) return [];
    const counts = new Map<string, number>();
    for (const f of list) counts.set(f.category, (counts.get(f.category) ?? 0) + 1);
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => ({
        cat,
        label: CAT_LABELS[cat] ?? cat,
        icon: CAT_ICONS[cat] ?? '📰',
        color: CAT_DOT[cat] ?? '#94a3b8',
        count,
        pct: Math.round((count / total) * 100),
      }));
  });

  weeklyMinutes = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dow = today.getDay();
    const daysFromMon = dow === 0 ? 6 : dow - 1;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - daysFromMon);
    const ws = weekStart.toISOString().slice(0, 10);
    const ts = today.toISOString().slice(0, 10);
    return this.favs()
      .filter(f => f.savedAt >= ws && f.savedAt <= ts)
      .reduce((s, f) => s + f.readingMinutes, 0);
  });

  weeklyPct = computed(() => Math.min(100, Math.round((this.weeklyMinutes() / this.WEEKLY_GOAL) * 100)));

  donutDash = computed(() => {
    const arc = (this.weeklyPct() / 100) * this.DONUT_CIRC;
    return `${arc} ${this.DONUT_CIRC}`;
  });

  achievements = computed<Achievement[]>(() => {
    const list = this.favs();
    const streak = this.currentStreak();
    const cats = new Set(list.map(f => f.category)).size;
    return [
      { emoji: '🌱', title: 'Semilla', desc: '1er artículo', unlocked: list.length >= 1 },
      { emoji: '🔥', title: `Racha ${streak}d`, desc: `${streak} días seguidos`, unlocked: streak >= 2 },
      { emoji: '🧠', title: 'Curioso', desc: '3 categorías', unlocked: cats >= 3 },
    ];
  });

  remove(fav: Favorite): void {
    this.favUseCase.remove(fav.articleId);
    this._tick.update(n => n + 1);
  }

  heatColor(level: number): string { return HEAT_COLORS[level] ?? 'bg-gray-100'; }
  catBg(cat: string): string { return CAT_BG[cat] ?? 'bg-gray-500'; }
  catIcon(cat: string): string { return CAT_ICONS[cat] ?? '📰'; }
  catLabel(cat: string): string { return CAT_LABELS[cat] ?? cat; }
  lvlIcon(level: string): string { return LVL_ICON[level] ?? '📖'; }

  formatSavedAt(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}

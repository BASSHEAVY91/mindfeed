import { Component, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-brand-800 text-white sticky top-0 z-50 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Brand -->
          <a routerLink="/" class="flex items-center gap-2 font-bold text-xl tracking-tight">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#7FCC9E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46
                2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58
                2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14Z"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46
                2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58
                2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14Z"/>
            </svg>
            Mind<em class="text-brand-300 not-italic">Feed</em>
          </a>

          <!-- Desktop links -->
          <div class="hidden md:flex items-center gap-6 text-sm font-medium">
            <a routerLink="/" routerLinkActive="text-brand-300 border-b-2 border-brand-300"
               [routerLinkActiveOptions]="{exact:true}"
               class="hover:text-brand-300 transition-colors pb-1">Inicio</a>
            <a routerLink="/noticias" routerLinkActive="text-brand-300 border-b-2 border-brand-300"
               class="hover:text-brand-300 transition-colors pb-1">Noticias</a>
            <a routerLink="/favoritos" routerLinkActive="text-brand-300 border-b-2 border-brand-300"
               class="hover:text-brand-300 transition-colors pb-1">Favoritos</a>
            <a routerLink="/contacto" routerLinkActive="text-brand-300 border-b-2 border-brand-300"
               class="hover:text-brand-300 transition-colors pb-1">Contacto</a>
          </div>

          <!-- Mobile menu button -->
          <button (click)="menuOpen.set(!menuOpen())"
            class="md:hidden p-2 rounded-md hover:bg-brand-700 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round">
              @if (menuOpen()) {
                <path d="M18 6 6 18M6 6l12 12"/>
              } @else {
                <path d="M4 6h16M4 12h16M4 18h16"/>
              }
            </svg>
          </button>
        </div>

        <!-- Mobile menu -->
        @if (menuOpen()) {
          <div class="md:hidden pb-4 flex flex-col gap-2 text-sm font-medium border-t border-brand-700 pt-3">
            <a routerLink="/" (click)="menuOpen.set(false)"
               routerLinkActive="text-brand-300" [routerLinkActiveOptions]="{exact:true}"
               class="hover:text-brand-300 transition-colors py-1">Inicio</a>
            <a routerLink="/noticias" (click)="menuOpen.set(false)"
               routerLinkActive="text-brand-300"
               class="hover:text-brand-300 transition-colors py-1">Noticias</a>
            <a routerLink="/favoritos" (click)="menuOpen.set(false)"
               routerLinkActive="text-brand-300"
               class="hover:text-brand-300 transition-colors py-1">Favoritos</a>
            <a routerLink="/contacto" (click)="menuOpen.set(false)"
               routerLinkActive="text-brand-300"
               class="hover:text-brand-300 transition-colors py-1">Contacto</a>
          </div>
        }
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  menuOpen = signal(false);

  @HostListener('document:keydown.escape')
  onEscape() {
    this.menuOpen.set(false);
  }
}

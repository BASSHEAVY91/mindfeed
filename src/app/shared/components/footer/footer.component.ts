import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-brand-900 text-white mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h5 class="font-bold text-lg mb-2 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#7FCC9E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46
                  2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58
                  2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14Z"/>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46
                  2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58
                  2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14Z"/>
              </svg>
              Mind<em class="text-brand-300 not-italic">Feed</em>
            </h5>
            <p class="text-sm text-gray-400">Divulgación científica de calidad sobre psicología, neurociencia y bienestar mental.</p>
            <p class="text-xs text-gray-500 mt-3">© 2026 MindFeed. Todos los derechos reservados.</p>
          </div>
          <div>
            <h5 class="font-semibold mb-3 text-brand-300">Navegación</h5>
            <ul class="space-y-1 text-sm text-gray-400">
              <li><a routerLink="/" class="hover:text-white transition-colors">Inicio</a></li>
              <li><a routerLink="/noticias" class="hover:text-white transition-colors">Noticias</a></li>
              <li><a routerLink="/favoritos" class="hover:text-white transition-colors">Favoritos</a></li>
              <li><a routerLink="/contacto" class="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h5 class="font-semibold mb-3 text-brand-300">Contacto</h5>
            <ul class="space-y-2 text-sm text-gray-400">
              <li class="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                info&#64;mindfeed.app
              </li>
              <li class="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +57 300 000 0000
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}

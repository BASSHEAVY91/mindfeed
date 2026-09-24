import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'noticias',
    loadComponent: () =>
      import('./features/news-list/news-list.component').then(
        (m) => m.NewsListComponent,
      ),
  },
  {
    path: 'noticias/:slug',
    loadComponent: () =>
      import('./features/news-detail/news-detail.component').then(
        (m) => m.NewsDetailComponent,
      ),
  },
  {
    path: 'favoritos',
    loadComponent: () =>
      import('./features/favorites/favorites.component').then(
        (m) => m.FavoritesComponent,
      ),
  },
  {
    path: 'contacto',
    loadComponent: () =>
      import('./features/contact/contact.component').then(
        (m) => m.ContactComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];

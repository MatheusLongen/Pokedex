import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then( m => m.HomePage)
  },
  {
    path: 'details',
    loadComponent: () => import('./pages/details/details.page').then( m => m.DetailsPage)
  },
  {
    path: 'details/:name',
    loadComponent: () => import('./pages/details/details.page').then(m => m.DetailsPage)
  },
  {
    path: 'favorites',
    loadComponent: () => import('./pages/favorites/favorites.page').then( m => m.FavoritesPage)
  },
];

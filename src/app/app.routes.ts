import { Routes } from '@angular/router';

import { MainLayoutComponent } from './layout/main-layout.component';
import { albumDetailResolver } from './features/albums/pages/album-detail.resolver';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage)
      },
      {
        path: 'artists',
        loadComponent: () => import('./features/artists/pages/artists.page').then((m) => m.ArtistsPage)
      },
      {
        path: 'albums',
        loadComponent: () => import('./features/albums/pages/albums.page').then((m) => m.AlbumsPage)
      },
      {
        path: 'mood',
        loadComponent: () => import('./features/mood/pages/mood.page').then((m) => m.MoodPage)
      },
      {
        path: 'artists/new',
        loadComponent: () =>
          import('./features/artists/pages/artist-create.page').then((m) => m.ArtistCreatePage)
      },
      {
        path: 'albums/new',
        loadComponent: () =>
          import('./features/albums/pages/album-create.page').then((m) => m.AlbumCreatePage)
      },
      {
        path: 'albums/:id',
        resolve: { album: albumDetailResolver },
        loadComponent: () =>
          import('./features/albums/pages/album-detail.page').then((m) => m.AlbumDetailPage)
      },
      {
        path: 'search',
        redirectTo: 'artists'
      },
      {
        path: 'favorites',
        redirectTo: 'albums'
      },
      {
        path: 'cadastros',
        redirectTo: 'artists'
      }
    ]
  },
  { path: '**', redirectTo: '' }
];

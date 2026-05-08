import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FavoritesStore } from '../../../core/state/favorites.store';
import { Album } from '../../../models/album.model';

@Component({
  selector: 'app-album-detail-page',
  imports: [RouterLink],
  template: `
    <a routerLink="/" class="mb-4 inline-block text-sm text-zinc-400 hover:text-zinc-200">← Voltar</a>
    <section class="grid gap-6 md:grid-cols-[280px_1fr]">
      <img
        [src]="album().coverUrl || 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=600'"
        [alt]="'Capa do álbum ' + album().name"
        class="aspect-square w-full rounded-2xl object-cover"
      />
      <div>
        <p class="text-xs uppercase tracking-widest text-zinc-500">Álbum</p>
        <h1 class="mt-1 text-4xl font-semibold">{{ album().name }}</h1>
        <p class="mt-2 text-zinc-300">{{ album().releaseYear }} • {{ renderStars(album().rating) }}</p>
        <p class="mt-2 text-sm text-zinc-400">Artista: {{ album().artist.name }}</p>
        @if (album().spotifyUrl) {
          <a
            [href]="album().spotifyUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-3 inline-flex items-center gap-2 rounded-md border border-emerald-400/40 px-3 py-2 text-sm text-emerald-300 hover:bg-emerald-500/10"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.53 17.29a.75.75 0 0 1-1.03.24c-2.83-1.73-6.39-2.12-10.58-1.15a.75.75 0 1 1-.34-1.46c4.58-1.05 8.5-.61 11.7 1.35.35.21.46.67.25 1.02zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.24-1.99-8.18-2.57-12.01-1.4a.94.94 0 1 1-.56-1.79c4.37-1.37 9.8-.73 13.55 1.58.45.28.6.86.31 1.3zm.13-3.4C15.26 8.35 8.89 8.14 5.2 9.27a1.13 1.13 0 1 1-.66-2.16c4.25-1.29 11.32-1.04 15.77 1.58a1.13 1.13 0 0 1-1.18 1.93z" />
            </svg>
            Abrir no Spotify
          </a>
        }
        <button
          class="mt-6 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400"
          (click)="favorites.toggle(album().id)"
        >
          {{ isFavorite() ? 'Remover dos favoritos' : 'Salvar nos favoritos' }}
        </button>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumDetailPage {
  private readonly route = inject(ActivatedRoute);
  readonly favorites = inject(FavoritesStore);
  readonly album = computed(() => this.route.snapshot.data['album'] as Album);
  readonly isFavorite = computed(() => this.favorites.isFavorite(this.album().id));

  renderStars(value: number): string {
    const rating = Math.max(0, Math.min(5, value));
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return `${'★'.repeat(fullStars)}${hasHalfStar ? '½' : ''}${'☆'.repeat(emptyStars)}`;
  }
}

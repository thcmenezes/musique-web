import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Album } from '../../models/album.model';

@Component({
  selector: 'app-album-card',
  imports: [RouterLink],
  template: `
    <article
      class="group rounded-2xl border border-white/10 bg-zinc-900/70 p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-400/60 hover:shadow-lg hover:shadow-emerald-950/30"
    >
      <div class="relative mb-3 aspect-square overflow-hidden rounded-xl bg-zinc-800 ring-1 ring-inset ring-white/5">
        <img
          [src]="album().coverUrl || 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=600'"
          [alt]="'Capa do álbum ' + album().name"
          class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <h3 class="line-clamp-1 text-sm font-semibold text-zinc-100">{{ album().name }}</h3>
      <p class="line-clamp-1 text-xs text-zinc-300">{{ album().artist.name }}</p>
      <p class="line-clamp-1 text-xs text-zinc-400">
        {{ album().releaseYear }} • {{ renderStars(album().rating) }}
      </p>
      @if (album().spotifyUrl) {
        <a
          [href]="album().spotifyUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-2 inline-flex items-center gap-1 text-xs text-emerald-300 hover:text-emerald-200"
        >
          <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 fill-current" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.53 17.29a.75.75 0 0 1-1.03.24c-2.83-1.73-6.39-2.12-10.58-1.15a.75.75 0 1 1-.34-1.46c4.58-1.05 8.5-.61 11.7 1.35.35.21.46.67.25 1.02zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.24-1.99-8.18-2.57-12.01-1.4a.94.94 0 1 1-.56-1.79c4.37-1.37 9.8-.73 13.55 1.58.45.28.6.86.31 1.3zm.13-3.4C15.26 8.35 8.89 8.14 5.2 9.27a1.13 1.13 0 1 1-.66-2.16c4.25-1.29 11.32-1.04 15.77 1.58a1.13 1.13 0 0 1-1.18 1.93z" />
          </svg>
          Ouvir no Spotify
        </a>
      }
      <div class="mt-3 flex items-center justify-between">
        <a
          [routerLink]="['/albums', album().id]"
          class="rounded px-2 py-1 text-xs text-emerald-300 transition hover:bg-white/10 hover:text-emerald-200"
        >
          Detalhes
        </a>
        <button
          type="button"
          class="rounded-md border border-white/15 px-2 py-1 text-xs text-zinc-200 transition hover:border-emerald-400/40 hover:bg-white/10"
          (click)="favoriteClicked.emit(album().id)"
        >
          {{ isFavorite() ? 'Remover' : 'Favoritar' }}
        </button>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumCardComponent {
  album = input.required<Album>();
  isFavorite = input(false);
  favoriteClicked = output<number>();

  renderStars(value: number): string {
    const rating = Math.max(0, Math.min(5, value));
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return `${'★'.repeat(fullStars)}${hasHalfStar ? '½' : ''}${'☆'.repeat(emptyStars)}`;
  }
}

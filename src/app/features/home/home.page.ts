import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, finalize, of } from 'rxjs';
import { MusiqueApiService } from '../../core/api/musique-api.service';
import { FavoritesStore } from '../../core/state/favorites.store';
import { AlbumCardComponent } from '../../shared/ui/album-card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { SkeletonGridComponent } from '../../shared/ui/skeleton-grid.component';
import { sortAlbumsByReleaseYearDesc } from '../../shared/utils/catalog-sort.utils';

@Component({
  selector: 'app-home-page',
  imports: [AlbumCardComponent, SkeletonGridComponent, EmptyStateComponent],
  template: `
    <section class="mb-6">
      <p class="text-sm text-zinc-400">Sua vitrine musical</p>
      <h1 class="text-3xl font-semibold">Descubra álbuns memoráveis</h1>
    </section>

    @if (loading()) {
      <app-skeleton-grid [count]="10" />
    } @else if (albums().length === 0) {
      <app-empty-state
        [title]="'Seu catálogo ainda está vazio'"
        [message]="'Ainda não há álbuns cadastrados para exibir aqui.'"
        [actionLabel]="'Ir para Álbuns'"
        [actionLink]="'/albums'"
      />
    } @else {
      <section class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        @for (album of albums(); track album.id) {
          <app-album-card
            [album]="album"
            [isFavorite]="favoritesStore.isFavorite(album.id)"
            (favoriteClicked)="favoritesStore.toggle($event)"
          />
        }
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage {
  private readonly api = inject(MusiqueApiService);
  readonly favoritesStore = inject(FavoritesStore);
  readonly loading = signal(true);

  private readonly albumsResponse = toSignal(
    this.api.getAlbums().pipe(
      finalize(() => this.loading.set(false)),
      catchError(() => of([]))
    ),
    { initialValue: [] }
  );

  readonly albums = computed(() => sortAlbumsByReleaseYearDesc(this.albumsResponse()));
}

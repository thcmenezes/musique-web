import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MusiqueApiService } from '../../../core/api/musique-api.service';
import { FavoritesStore } from '../../../core/state/favorites.store';
import { AlbumCardComponent } from '../../../shared/ui/album-card.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { sortAlbumsByReleaseYearDesc } from '../../../shared/utils/catalog-sort.utils';

@Component({
  selector: 'app-favorites-page',
  imports: [AlbumCardComponent, EmptyStateComponent],
  template: `
    <section class="mb-6">
      <h1 class="text-2xl font-semibold">Sua coleção pessoal</h1>
      <p class="text-sm text-zinc-400">Álbuns que marcaram sua jornada musical.</p>
    </section>
    @if (albums().length === 0) {
      <app-empty-state [message]="'Você ainda não favoritou nenhum álbum.'" />
    } @else {
      <section class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        @for (album of albums(); track album.id) {
          <app-album-card
            [album]="album"
            [isFavorite]="true"
            (favoriteClicked)="favoritesStore.toggle($event)"
          />
        }
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FavoritesPage {
  readonly favoritesStore = inject(FavoritesStore);
  private readonly api = inject(MusiqueApiService);

  private readonly allAlbums = toSignal(this.api.getAlbums(), { initialValue: [] });

  readonly albums = computed(() =>
    sortAlbumsByReleaseYearDesc(
      this.allAlbums().filter((album) => this.favoritesStore.favorites().includes(album.id))
    )
  );
}

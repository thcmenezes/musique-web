import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';
import { MusiqueApiService } from '../../../core/api/musique-api.service';
import { FavoritesStore } from '../../../core/state/favorites.store';
import { AlbumCardComponent } from '../../../shared/ui/album-card.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { sortAlbumsByReleaseYearDesc, sortArtistsAlphabetically } from '../../../shared/utils/catalog-sort.utils';

@Component({
  selector: 'app-search-page',
  imports: [ReactiveFormsModule, AlbumCardComponent, EmptyStateComponent],
  template: `
    <section class="mb-4">
      <h1 class="text-2xl font-semibold">Buscar por artista ou álbum</h1>
      <input
        [formControl]="searchControl"
        type="search"
        placeholder="Digite um nome..."
        class="mt-3 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none ring-emerald-500 focus:ring"
      />
    </section>

    @if (!hasCatalogData()) {
      <app-empty-state
        [title]="'Nenhum álbum ou artista cadastrado'"
        [message]="'Cadastre artistas e álbuns para começar a usar a busca.'"
        [actionLabel]="'Ir para Artistas'"
        [actionLink]="'/artists'"
      />
    } @else if (results().length === 0) {
      <app-empty-state [message]="'Sem resultados para a busca atual.'" />
    } @else {
      <section class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        @for (album of results(); track album.id) {
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
export class SearchPage {
  private readonly api = inject(MusiqueApiService);
  readonly favoritesStore = inject(FavoritesStore);
  readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly query$ = this.searchControl.valueChanges.pipe(
    startWith(''),
    debounceTime(250),
    distinctUntilChanged()
  );

  private readonly albums$ = this.api.getAlbums();
  private readonly artists$ = this.api.getArtists();
  private readonly catalogData = toSignal(combineLatest([this.albums$, this.artists$]), {
    initialValue: [[], []] as const
  });
  private readonly combined = toSignal(
    combineLatest([this.albums$, this.query$, this.artists$]).pipe(
      map(([albums, query, artists]) => {
        const normalized = query.trim().toLowerCase();
        const sortedAlbums = sortAlbumsByReleaseYearDesc(albums);
        if (!normalized) return sortedAlbums;
        const matchingArtistIds = sortArtistsAlphabetically(artists)
          .filter((artist) => artist.name.toLowerCase().includes(normalized))
          .map((artist) => artist.id);
        return sortedAlbums.filter(
          (album) =>
            album.name.toLowerCase().includes(normalized) ||
            album.artist.name.toLowerCase().includes(normalized) ||
            matchingArtistIds.includes(album.artist.id) ||
            String(album.artist.id).includes(normalized) ||
            album.idExternal?.toLowerCase().includes(normalized)
        );
      })
    ),
    { initialValue: [] }
  );

  readonly hasCatalogData = computed(() => {
    const [albums, artists] = this.catalogData();
    return albums.length > 0 || artists.length > 0;
  });
  readonly results = computed(() => this.combined());
}

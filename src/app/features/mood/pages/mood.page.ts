import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MusiqueApiService } from '../../../core/api/musique-api.service';
import { Album } from '../../../models/album.model';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { sortAlbumsByReleaseYearDesc } from '../../../shared/utils/catalog-sort.utils';

@Component({
  selector: 'app-mood-page',
  imports: [ReactiveFormsModule, EmptyStateComponent],
  template: `
    <section class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Mood</h1>
        <p class="text-sm text-zinc-400">Álbuns que você está curtindo no momento.</p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400"
        (click)="openAddModal()"
      >
        Adicionar ao mood
      </button>
    </section>

    @if (moodAlbums().length === 0) {
      <app-empty-state [message]="'Seu mood está vazio. Adicione um álbum para começar.'" />
    } @else {
      <section class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        @for (album of moodAlbums(); track album.id) {
          <article class="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
            <div class="flex gap-4">
              <img
                [src]="album.coverUrl || fallbackCover"
                [alt]="'Capa do álbum ' + album.name"
                class="h-20 w-20 rounded-lg object-cover"
              />
              <div class="min-w-0 flex-1">
                <h2 class="truncate text-base font-semibold text-zinc-100">{{ album.name }}</h2>
                <p class="truncate text-sm text-zinc-300">{{ album.artist.name }}</p>
                <p class="text-xs text-zinc-400">{{ album.releaseYear }}</p>
              </div>
            </div>
            <div class="mt-4">
              <button
                type="button"
                class="rounded-md border border-white/15 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10"
                (click)="removeFromMood(album.id)"
              >
                Remover do mood
              </button>
            </div>
          </article>
        }
      </section>
    }

    @if (isModalOpen()) {
      <div class="fixed inset-0 z-40 bg-black/70 p-4">
        <div class="mx-auto mt-8 max-w-3xl rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl">
          <div class="mb-4 flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold">Adicionar álbum ao mood</h2>
            <button
              type="button"
              class="rounded-md border border-white/15 px-2 py-1 text-xs text-zinc-200 hover:bg-white/10"
              (click)="closeModal()"
            >
              Fechar
            </button>
          </div>

          <input
            type="search"
            [formControl]="searchControl"
            placeholder="Buscar álbum ou artista..."
            class="mb-4 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none ring-emerald-500 focus:ring"
          />

          @if (catalogLoading()) {
            <p class="text-sm text-zinc-400">Carregando catálogo...</p>
          } @else if (catalogAlbums().length === 0) {
            <app-empty-state
              [title]="'Nenhum álbum cadastrado ainda'"
              [message]="'Cadastre o primeiro álbum para começar a montar seu mood.'"
              [actionLabel]="'Cadastrar álbum'"
              [actionLink]="'/albums'"
            />
          } @else if (availableAlbums().length === 0) {
            <app-empty-state [message]="'Todos os álbuns cadastrados já estão no seu mood.'" />
          } @else {
            <section class="max-h-[60vh] space-y-2 overflow-auto pr-1">
              @for (album of availableAlbums(); track album.id) {
                <div
                  class="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-900/70 p-3"
                >
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-zinc-100">{{ album.name }}</p>
                    <p class="truncate text-xs text-zinc-400">
                      {{ album.artist.name }} • {{ album.releaseYear }}
                    </p>
                  </div>
                  <button
                    type="button"
                    class="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-emerald-400"
                    (click)="addToMood(album.id)"
                  >
                    Adicionar
                  </button>
                </div>
              }
            </section>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoodPage {
  private readonly api = inject(MusiqueApiService);
  readonly fallbackCover =
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=600';
  readonly moodAlbums = signal<Album[]>([]);
  readonly catalogAlbums = signal<Album[]>([]);
  readonly catalogLoaded = signal(false);
  readonly catalogLoading = signal(false);
  readonly isModalOpen = signal(false);
  readonly searchControl = new FormControl('', { nonNullable: true });

  readonly availableAlbums = computed(() => {
    const moodIds = new Set(this.moodAlbums().map((album) => album.id));
    const query = this.searchControl.value.trim().toLowerCase();
    return this.catalogAlbums().filter((album) => {
      if (moodIds.has(album.id)) return false;
      if (!query) return true;
      return (
        album.name.toLowerCase().includes(query) || album.artist.name.toLowerCase().includes(query)
      );
    });
  });

  constructor() {
    this.refreshMood();
  }

  refreshMood(): void {
    this.api.getMoodAlbums().subscribe((albums) => this.moodAlbums.set(sortAlbumsByReleaseYearDesc(albums)));
  }

  openAddModal(): void {
    this.isModalOpen.set(true);
    if (this.catalogLoaded()) return;
    this.catalogLoading.set(true);
    this.api
      .getAlbums()
      .pipe(finalize(() => this.catalogLoading.set(false)))
      .subscribe((albums) => {
        this.catalogAlbums.set(sortAlbumsByReleaseYearDesc(albums));
        this.catalogLoaded.set(true);
      });
  }

  closeModal(): void {
    this.searchControl.setValue('');
    this.isModalOpen.set(false);
  }

  addToMood(albumId: number): void {
    this.api.addAlbumToMood({ albumId }).subscribe(() => this.refreshMood());
  }

  removeFromMood(albumId: number): void {
    this.api.removeAlbumFromMood(albumId).subscribe(() => {
      this.moodAlbums.set(
        sortAlbumsByReleaseYearDesc(this.moodAlbums().filter((album) => album.id !== albumId))
      );
    });
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { MusiqueApiService } from '../../../core/api/musique-api.service';
import { Album } from '../../../models/album.model';
import { Artist } from '../../../models/artist.model';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { ModalShellComponent } from '../../../shared/ui/modal-shell.component';
import { SkeletonGridComponent } from '../../../shared/ui/skeleton-grid.component';
import { ToastMessageComponent } from '../../../shared/ui/toast-message.component';
import { sortAlbumsByReleaseYearDesc, sortArtistsAlphabetically } from '../../../shared/utils/catalog-sort.utils';

@Component({
  selector: 'app-albums-page',
  imports: [
    ReactiveFormsModule,
    EmptyStateComponent,
    ModalShellComponent,
    SkeletonGridComponent,
    ToastMessageComponent
  ],
  template: `
    <section class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm text-zinc-400">Gestão de catálogo</p>
        <h1 class="text-3xl font-semibold">Álbuns</h1>
      </div>
      <button
        type="button"
        class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400"
        (click)="openCreateModal()"
      >
        Novo álbum
      </button>
    </section>

    <section class="mb-5">
      <input
        type="search"
        [formControl]="searchControl"
        placeholder="Buscar álbuns ou artistas..."
        class="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none ring-emerald-500 transition focus:ring"
      />
    </section>

    <section class="mb-4">
      <app-toast-message [message]="feedbackMessage()" [tone]="feedbackTone()" />
    </section>

    @if (loading()) {
      <app-skeleton-grid [count]="8" />
    } @else if (filteredAlbums().length === 0 && albums().length === 0) {
      <app-empty-state
        [title]="'Nenhum álbum cadastrado'"
        [message]="'Cadastre seu primeiro álbum para aparecer no início e no mood.'"
        [actionLabel]="'Cadastrar álbum'"
        (actionClicked)="openCreateModal()"
      />
    } @else if (filteredAlbums().length === 0) {
      <app-empty-state [message]="'Nenhum álbum encontrado para o filtro informado.'" />
    } @else {
      <section class="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70">
        <div class="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-wide text-zinc-400">
          <span>Álbum</span>
          <span class="hidden md:block">Ano</span>
          <span class="text-right">Ações</span>
        </div>
        <div class="divide-y divide-white/5">
          @for (album of filteredAlbums(); track album.id) {
            <article class="grid grid-cols-[1fr_auto] items-center gap-2 px-4 py-3 transition hover:bg-white/5 md:grid-cols-[1fr_auto_auto]">
              <div class="min-w-0">
                <h2 class="truncate text-sm font-semibold text-zinc-100">{{ album.name }}</h2>
                <p class="truncate text-xs text-zinc-400">{{ album.artist.name }} • Nota {{ album.rating.toFixed(1) }}</p>
              </div>
              <p class="hidden text-sm text-zinc-400 md:block">{{ album.releaseYear }}</p>
              <div class="flex items-center justify-end gap-2">
                <button
                  type="button"
                  class="rounded-md border border-white/15 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/10"
                  (click)="openEditModal(album)"
                >
                  Editar
                </button>
                <button
                  type="button"
                  class="rounded-md border border-red-400/30 px-3 py-1.5 text-xs text-red-200 transition hover:bg-red-500/15"
                  (click)="openDeleteModal(album)"
                >
                  Excluir
                </button>
              </div>
            </article>
          }
        </div>
      </section>
    }

    <app-modal-shell
      [open]="formModalOpen()"
      [title]="editingAlbum() ? 'Editar álbum' : 'Novo álbum'"
      [description]="editingAlbum() ? 'Atualize as informações do álbum.' : 'Cadastre um novo álbum no catálogo.'"
      (close)="closeFormModal()"
    >
      <form class="grid gap-4 md:grid-cols-2" novalidate ngNoForm (submit)="onSubmitAlbum($event)">
        <div class="md:col-span-2">
          <label for="albumName" class="mb-2 block text-sm text-zinc-300">Nome do álbum</label>
          <input
            id="albumName"
            type="text"
            [formControl]="nameControl"
            class="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none ring-emerald-500 focus:ring"
            placeholder="Ex.: Acabou Chorare"
          />
        </div>
        <div>
          <label for="artistId" class="mb-2 block text-sm text-zinc-300">Artista</label>
          <select
            id="artistId"
            [formControl]="artistIdControl"
            class="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none ring-emerald-500 focus:ring"
          >
            <option [ngValue]="0">Selecione</option>
            @for (artist of artists(); track artist.id) {
              <option [ngValue]="artist.id">{{ artist.name }}</option>
            }
          </select>
        </div>
        <div>
          <label for="releaseYear" class="mb-2 block text-sm text-zinc-300">Ano de lançamento</label>
          <input
            id="releaseYear"
            type="number"
            [formControl]="releaseYearControl"
            class="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none ring-emerald-500 focus:ring"
          />
        </div>
        <div class="md:col-span-2">
          <label for="rating" class="mb-2 block text-sm text-zinc-300">Nota (0 a 5)</label>
          <input
            id="rating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            [formControl]="ratingControl"
            class="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none ring-emerald-500 focus:ring"
          />
        </div>
        @if (hasFormError()) {
          <p class="md:col-span-2 text-xs text-red-300">Preencha todos os campos obrigatórios corretamente.</p>
        }
        <div class="md:col-span-2 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-md border border-white/20 px-3 py-2 text-xs text-zinc-200 transition hover:bg-white/10"
            (click)="closeFormModal()"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="rounded-md bg-emerald-500 px-3 py-2 text-xs font-medium text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="saving()"
          >
            {{ saving() ? 'Salvando...' : editingAlbum() ? 'Salvar alterações' : 'Cadastrar álbum' }}
          </button>
        </div>
      </form>
    </app-modal-shell>

    <app-modal-shell
      [open]="deleteModalOpen()"
      [title]="'Excluir álbum'"
      [description]="'Essa ação remove o álbum do catálogo.'"
      (close)="closeDeleteModal()"
    >
      <p class="text-sm text-zinc-300">
        Deseja excluir o álbum <span class="font-medium text-zinc-100">{{ deletingAlbum()?.name }}</span>?
      </p>
      <div class="mt-4 flex justify-end gap-2">
        <button
          type="button"
          class="rounded-md border border-white/20 px-3 py-2 text-xs text-zinc-200 transition hover:bg-white/10"
          (click)="closeDeleteModal()"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="rounded-md bg-red-500 px-3 py-2 text-xs font-medium text-zinc-950 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          [disabled]="saving()"
          (click)="confirmDeleteAlbum()"
        >
          {{ saving() ? 'Excluindo...' : 'Confirmar exclusão' }}
        </button>
      </div>
    </app-modal-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumsPage {
  private readonly api = inject(MusiqueApiService);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly albums = signal<Album[]>([]);
  readonly artists = signal<Artist[]>([]);
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly searchValue = toSignal(this.searchControl.valueChanges, { initialValue: '' });
  readonly formModalOpen = signal(false);
  readonly deleteModalOpen = signal(false);
  readonly editingAlbum = signal<Album | null>(null);
  readonly deletingAlbum = signal<Album | null>(null);
  readonly feedbackMessage = signal('');
  readonly feedbackTone = signal<'success' | 'error'>('success');
  readonly nameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2)]
  });
  readonly artistIdControl = new FormControl(0, {
    nonNullable: true,
    validators: [Validators.min(1)]
  });
  readonly releaseYearControl = new FormControl(new Date().getFullYear(), {
    nonNullable: true,
    validators: [Validators.required, Validators.min(1900), Validators.max(2100)]
  });
  readonly ratingControl = new FormControl(4, {
    nonNullable: true,
    validators: [Validators.required, Validators.min(0), Validators.max(5)]
  });

  readonly filteredAlbums = computed(() => {
    const query = this.searchValue().trim().toLowerCase();
    if (!query) {
      return this.albums();
    }
    return this.albums().filter(
      (album) =>
        album.name.toLowerCase().includes(query) || album.artist.name.toLowerCase().includes(query)
    );
  });

  readonly hasFormError = computed(
    () =>
      this.nameControl.touched &&
      (this.nameControl.invalid ||
        this.artistIdControl.invalid ||
        this.releaseYearControl.invalid ||
        this.ratingControl.invalid)
  );

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.api
      .getAlbums()
      .pipe(
        finalize(() => this.loading.set(false)),
        catchError(() => {
          this.showFeedback('Não foi possível carregar a lista de álbuns.', 'error');
          return of([]);
        })
      )
      .subscribe((albums) => this.albums.set(sortAlbumsByReleaseYearDesc(albums)));

    this.api
      .getArtists()
      .pipe(catchError(() => of([])))
      .subscribe((artists) => this.artists.set(sortArtistsAlphabetically(artists)));
  }

  openCreateModal(): void {
    this.editingAlbum.set(null);
    this.resetForm();
    this.formModalOpen.set(true);
  }

  openEditModal(album: Album): void {
    this.editingAlbum.set(album);
    this.nameControl.setValue(album.name);
    this.artistIdControl.setValue(album.artist.id);
    this.releaseYearControl.setValue(album.releaseYear);
    this.ratingControl.setValue(album.rating);
    this.formModalOpen.set(true);
  }

  closeFormModal(): void {
    this.formModalOpen.set(false);
  }

  openDeleteModal(album: Album): void {
    this.deletingAlbum.set(album);
    this.deleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.deleteModalOpen.set(false);
    this.deletingAlbum.set(null);
  }

  onSubmitAlbum(event: SubmitEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.nameControl.markAsTouched();
    this.artistIdControl.markAsTouched();
    this.releaseYearControl.markAsTouched();
    this.ratingControl.markAsTouched();

    if (
      this.saving() ||
      this.nameControl.invalid ||
      this.artistIdControl.invalid ||
      this.releaseYearControl.invalid ||
      this.ratingControl.invalid
    ) {
      return;
    }

    const payload = {
      name: this.nameControl.value.trim(),
      artistId: this.artistIdControl.value,
      releaseYear: this.releaseYearControl.value,
      rating: this.ratingControl.value
    };
    const current = this.editingAlbum();
    this.saving.set(true);

    const request$ = current
      ? this.api.updateAlbum(current.id, payload)
      : this.api.createAlbum(payload);

    request$
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (album) => {
          if (current) {
            this.albums.set(
              sortAlbumsByReleaseYearDesc(
                this.albums().map((item) => (item.id === album.id ? album : item))
              )
            );
            this.showFeedback('Álbum atualizado com sucesso.', 'success');
          } else {
            this.albums.set(sortAlbumsByReleaseYearDesc([album, ...this.albums()]));
            this.showFeedback('Álbum cadastrado com sucesso.', 'success');
          }
          this.closeFormModal();
        },
        error: () => this.showFeedback('Não foi possível salvar o álbum.', 'error')
      });
  }

  confirmDeleteAlbum(): void {
    const album = this.deletingAlbum();
    if (!album || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.api
      .deleteAlbum(album.id)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.albums.set(
            sortAlbumsByReleaseYearDesc(this.albums().filter((item) => item.id !== album.id))
          );
          this.closeDeleteModal();
          this.showFeedback('Álbum excluído com sucesso.', 'success');
        },
        error: () => this.showFeedback('Não foi possível excluir o álbum.', 'error')
      });
  }

  private resetForm(): void {
    this.nameControl.setValue('');
    this.artistIdControl.setValue(0);
    this.releaseYearControl.setValue(new Date().getFullYear());
    this.ratingControl.setValue(4);
    this.nameControl.markAsUntouched();
    this.artistIdControl.markAsUntouched();
    this.releaseYearControl.markAsUntouched();
    this.ratingControl.markAsUntouched();
  }

  private showFeedback(message: string, tone: 'success' | 'error'): void {
    this.feedbackMessage.set(message);
    this.feedbackTone.set(tone);
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { MusiqueApiService } from '../../../core/api/musique-api.service';
import { Artist } from '../../../models/artist.model';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { ModalShellComponent } from '../../../shared/ui/modal-shell.component';
import { SkeletonGridComponent } from '../../../shared/ui/skeleton-grid.component';
import { ToastMessageComponent } from '../../../shared/ui/toast-message.component';
import { sortArtistsAlphabetically } from '../../../shared/utils/catalog-sort.utils';

@Component({
  selector: 'app-artists-page',
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
        <h1 class="text-3xl font-semibold">Artistas</h1>
      </div>
      <button
        type="button"
        class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400"
        (click)="openCreateModal()"
      >
        Novo artista
      </button>
    </section>

    <section class="mb-5">
      <input
        type="search"
        [formControl]="searchControl"
        placeholder="Buscar artistas..."
        class="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none ring-emerald-500 transition focus:ring"
      />
    </section>

    <section class="mb-4">
      <app-toast-message [message]="feedbackMessage()" [tone]="feedbackTone()" />
    </section>

    @if (loading()) {
      <app-skeleton-grid [count]="6" />
    } @else if (filteredArtists().length === 0 && artists().length === 0) {
      <app-empty-state
        [title]="'Nenhum artista cadastrado'"
        [message]="'Comece adicionando seu primeiro artista para montar o catálogo.'"
        [actionLabel]="'Cadastrar artista'"
        (actionClicked)="openCreateModal()"
      />
    } @else if (filteredArtists().length === 0) {
      <app-empty-state [message]="'Nenhum artista encontrado para o filtro informado.'" />
    } @else {
      <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        @for (artist of filteredArtists(); track artist.id) {
          <article
            class="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-zinc-900"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h2 class="truncate text-base font-semibold text-zinc-100">{{ artist.name }}</h2>
                <p class="mt-1 text-xs text-zinc-500">ID #{{ artist.id }}</p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="rounded-md border border-white/15 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/10"
                  (click)="openEditModal(artist)"
                >
                  Editar
                </button>
                <button
                  type="button"
                  class="rounded-md border border-red-400/30 px-3 py-1.5 text-xs text-red-200 transition hover:bg-red-500/15"
                  (click)="openDeleteModal(artist)"
                >
                  Excluir
                </button>
              </div>
            </div>
          </article>
        }
      </section>
    }

    <app-modal-shell
      [open]="formModalOpen()"
      [title]="editingArtist() ? 'Editar artista' : 'Novo artista'"
      [description]="editingArtist() ? 'Atualize os dados do artista.' : 'Cadastre um novo artista no catálogo.'"
      (close)="closeFormModal()"
    >
      <form class="space-y-4" novalidate ngNoForm (submit)="onSubmitArtist($event)">
        <div>
          <label for="artistName" class="mb-2 block text-sm text-zinc-300">Nome do artista</label>
          <input
            id="artistName"
            type="text"
            [formControl]="nameControl"
            class="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none ring-emerald-500 focus:ring"
            placeholder="Ex.: Elis Regina"
          />
          @if (nameControl.touched && nameControl.invalid) {
            <p class="mt-2 text-xs text-red-300">Informe um nome com pelo menos 2 caracteres.</p>
          }
        </div>
        <div class="flex justify-end gap-2">
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
            {{ saving() ? 'Salvando...' : editingArtist() ? 'Salvar alterações' : 'Cadastrar artista' }}
          </button>
        </div>
      </form>
    </app-modal-shell>

    <app-modal-shell
      [open]="deleteModalOpen()"
      [title]="'Excluir artista'"
      [description]="'Essa ação não pode ser desfeita.'"
      (close)="closeDeleteModal()"
    >
      <p class="text-sm text-zinc-300">
        Deseja excluir o artista <span class="font-medium text-zinc-100">{{ deletingArtist()?.name }}</span>?
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
          (click)="confirmDeleteArtist()"
        >
          {{ saving() ? 'Excluindo...' : 'Confirmar exclusão' }}
        </button>
      </div>
    </app-modal-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistsPage {
  private readonly api = inject(MusiqueApiService);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly artists = signal<Artist[]>([]);
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly searchValue = toSignal(this.searchControl.valueChanges, { initialValue: '' });
  readonly formModalOpen = signal(false);
  readonly deleteModalOpen = signal(false);
  readonly editingArtist = signal<Artist | null>(null);
  readonly deletingArtist = signal<Artist | null>(null);
  readonly feedbackMessage = signal('');
  readonly feedbackTone = signal<'success' | 'error'>('success');
  readonly nameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2)]
  });

  readonly filteredArtists = computed(() => {
    const query = this.searchValue().trim().toLowerCase();
    if (!query) {
      return this.artists();
    }
    return this.artists().filter((artist) => artist.name.toLowerCase().includes(query));
  });

  constructor() {
    this.loadArtists();
  }

  loadArtists(): void {
    this.loading.set(true);
    this.api
      .getArtists()
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
        catchError(() => {
          this.showFeedback('Não foi possível carregar a lista de artistas.', 'error');
          return of([]);
        })
      )
      .subscribe((artists) => this.artists.set(sortArtistsAlphabetically(artists)));
  }

  openCreateModal(): void {
    this.editingArtist.set(null);
    this.nameControl.setValue('');
    this.nameControl.markAsPristine();
    this.nameControl.markAsUntouched();
    this.formModalOpen.set(true);
  }

  openEditModal(artist: Artist): void {
    this.editingArtist.set(artist);
    this.nameControl.setValue(artist.name);
    this.nameControl.markAsPristine();
    this.nameControl.markAsUntouched();
    this.formModalOpen.set(true);
  }

  closeFormModal(): void {
    this.formModalOpen.set(false);
  }

  openDeleteModal(artist: Artist): void {
    this.deletingArtist.set(artist);
    this.deleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.deleteModalOpen.set(false);
    this.deletingArtist.set(null);
  }

  onSubmitArtist(event: SubmitEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.nameControl.markAsTouched();
    if (this.nameControl.invalid || this.saving()) {
      return;
    }

    const name = this.nameControl.value.trim();
    const current = this.editingArtist();
    this.saving.set(true);

    const request$ = current
      ? this.api.updateArtist(current.id, { name })
      : this.api.createArtist({ name });

    request$
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (artist) => {
          if (current) {
            this.artists.set(
              sortArtistsAlphabetically(
                this.artists().map((item) => (item.id === artist.id ? artist : item))
              )
            );
            this.showFeedback('Artista atualizado com sucesso.', 'success');
          } else {
            this.artists.set(sortArtistsAlphabetically([artist, ...this.artists()]));
            this.showFeedback('Artista cadastrado com sucesso.', 'success');
          }
          this.closeFormModal();
        },
        error: () => this.showFeedback('Não foi possível salvar o artista.', 'error')
      });
  }

  confirmDeleteArtist(): void {
    const artist = this.deletingArtist();
    if (!artist || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.api
      .deleteArtist(artist.id)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.artists.set(
            sortArtistsAlphabetically(this.artists().filter((item) => item.id !== artist.id))
          );
          this.closeDeleteModal();
          this.showFeedback('Artista excluido com sucesso.', 'success');
        },
        error: () => this.showFeedback('Não foi possível excluir o artista.', 'error')
      });
  }

  private showFeedback(message: string, tone: 'success' | 'error'): void {
    this.feedbackMessage.set(message);
    this.feedbackTone.set(tone);
  }
}

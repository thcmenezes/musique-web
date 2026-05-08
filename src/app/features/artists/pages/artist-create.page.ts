import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MusiqueApiService } from '../../../core/api/musique-api.service';
import { environment } from '../../../../environments/environment';
import { Artist } from '../../../models/artist.model';
import { sortArtistsAlphabetically } from '../../../shared/utils/catalog-sort.utils';

@Component({
  selector: 'app-artist-create-page',
  imports: [ReactiveFormsModule],
  template: `
    <section class="mb-6">
      <h1 class="text-2xl font-semibold">Cadastro de artista</h1>
      <p class="mt-1 text-sm text-zinc-400">Cadastre um novo artista para aparecer no catálogo.</p>
    </section>

    <form class="max-w-xl space-y-4" novalidate ngNoForm (submit)="onFormSubmit($event)">
      <div>
        <label for="artistName" class="mb-2 block text-sm text-zinc-300">Nome do artista</label>
        <input
          id="artistName"
          type="text"
          [formControl]="nameControl"
          class="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none ring-emerald-500 focus:ring"
          placeholder="Ex.: Milton Nascimento"
        />
        @if (nameControl.touched && nameControl.hasError('required')) {
          <p class="mt-2 text-xs text-red-300">Informe o nome do artista.</p>
        } @else if (nameControl.touched && nameControl.hasError('minlength')) {
          <p class="mt-2 text-xs text-red-300">Use pelo menos 2 caracteres.</p>
        }
      </div>

      <button
        type="submit"
        class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        [disabled]="loading()"
      >
        {{ loading() ? 'Salvando...' : 'Salvar artista' }}
      </button>

      @if (statusMessage()) {
        <p
          class="rounded-lg border px-3 py-2 text-sm"
          [class]="statusIsError() ? 'border-red-500/40 bg-red-950/30 text-red-200' : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'"
        >
          {{ statusMessage() }}
        </p>
      }
    </form>

    <section class="mt-8">
      <div class="mb-3 flex items-center justify-between gap-3">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-zinc-400">Artistas cadastrados</h2>
        <button
          type="button"
          class="rounded-md border border-white/20 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/10"
          (click)="artistsResource.reload()"
        >
          Atualizar lista
        </button>
      </div>
      @if (artistsResource.isLoading()) {
        <p class="rounded-xl border border-dashed border-white/15 px-4 py-3 text-sm text-zinc-500">
          Carregando artistas…
        </p>
      } @else if (artistsResource.error()) {
        <p class="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-200">
          Não foi possível carregar a lista (a API está no ar em {{ apiBaseUrl }}?).
        </p>
      } @else if (artistsResource.value().length === 0) {
        <p class="rounded-xl border border-dashed border-white/15 px-4 py-3 text-sm text-zinc-400">
          Nenhum artista cadastrado ainda.
        </p>
      } @else {
        <div class="space-y-2">
          @for (artist of sortedArtists(); track artist.id) {
            <div class="rounded-xl border border-white/10 bg-zinc-900/70 px-4 py-3 text-sm">
              <span class="text-zinc-100">{{ artist.name }}</span>
              <span class="ml-2 text-xs text-zinc-500">#{{ artist.id }}</span>
            </div>
          }
        </div>
      }
    </section>

    @if (resultDialogOpen()) {
      <div class="fixed inset-0 z-[100] bg-black/70 p-4" role="presentation" (click)="closeResultDialog()">
        <div
          class="mx-auto mt-20 max-w-md rounded-2xl border p-5 shadow-2xl"
          [class]="resultDialogIsError() ? 'border-red-500/40 bg-zinc-950' : 'border-emerald-500/40 bg-zinc-950'"
          (click)="$event.stopPropagation()"
        >
          <h2 class="text-lg font-semibold" [class]="resultDialogIsError() ? 'text-red-300' : 'text-emerald-300'">
            {{ resultDialogTitle() }}
          </h2>
          <p class="mt-2 text-sm text-zinc-200">{{ resultDialogMessage() }}</p>
          <div class="mt-4 flex justify-end">
            <button
              type="button"
              class="rounded-md border border-white/20 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/10"
              (click)="closeResultDialog()"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistCreatePage {
  private readonly api = inject(MusiqueApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly apiBaseUrl = environment.apiUrl;
  readonly artistsResource = httpResource<Artist[]>(() => `${environment.apiUrl}/artists`, {
    defaultValue: []
  });
  readonly loading = signal(false);
  readonly statusMessage = signal('');
  readonly statusIsError = signal(false);
  readonly resultDialogOpen = signal(false);
  readonly resultDialogTitle = signal('');
  readonly resultDialogMessage = signal('');
  readonly resultDialogIsError = signal(false);
  readonly sortedArtists = computed(() => sortArtistsAlphabetically(this.artistsResource.value()));
  readonly nameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2)]
  });

  constructor() {
    this.nameControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.cdr.markForCheck());
    this.nameControl.statusChanges.pipe(takeUntilDestroyed()).subscribe(() => this.cdr.markForCheck());
  }

  onFormSubmit(event: SubmitEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.onSubmit();
  }

  onSubmit(): void {
    if (this.loading()) {
      return;
    }

    this.nameControl.markAsTouched();
    this.cdr.markForCheck();

    if (this.nameControl.invalid) {
      this.statusIsError.set(true);
      this.statusMessage.set('Preencha corretamente o nome do artista para continuar.');
      this.openResultDialog('Não foi possível salvar', 'Preencha corretamente o nome do artista para continuar.', true);
      return;
    }

    this.saveArtist(this.nameControl.value.trim());
  }

  private saveArtist(artistName: string): void {
    this.loading.set(true);
    this.statusMessage.set('');

    this.api
      .createArtist({ name: artistName })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (artist) => {
          this.nameControl.reset('');
          this.artistsResource.reload();
          this.cdr.markForCheck();
          this.statusIsError.set(false);
          this.statusMessage.set(`Artista "${artist.name}" cadastrado com sucesso.`);
          this.openResultDialog('Artista cadastrado', `O artista "${artist.name}" foi salvo com sucesso.`, false);
        },
        error: (error: HttpErrorResponse) => {
          const errorMessage = this.getErrorMessage(error);
          this.statusIsError.set(true);
          this.statusMessage.set(errorMessage);
          this.openResultDialog('Não foi possível salvar', errorMessage, true);
          this.cdr.markForCheck();
        }
      });
  }

  closeResultDialog(): void {
    this.resultDialogOpen.set(false);
  }

  private openResultDialog(title: string, message: string, isError: boolean): void {
    this.resultDialogTitle.set(title);
    this.resultDialogMessage.set(message);
    this.resultDialogIsError.set(isError);
    this.resultDialogOpen.set(true);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const body = error.error as
      | { message?: string; details?: string[] }
      | string
      | undefined
      | null;

    if (body && typeof body === 'object' && typeof body.message === 'string') {
      const base = body.message.trim();
      if (!base) {
        return this.fallbackHttpMessage(error);
      }
      const details = body.details;
      if (Array.isArray(details) && details.length) {
        return `${base} ${details.join(' ')}`.trim();
      }
      return base;
    }

    return this.fallbackHttpMessage(error);
  }

  private fallbackHttpMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return `Não foi possível conectar à API em ${this.apiBaseUrl}. Confirme se o backend está rodando.`;
    }
    return 'Verifique os dados e tente novamente em instantes.';
  }
}

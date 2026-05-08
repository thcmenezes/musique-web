import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, finalize, map, of } from 'rxjs';
import { MusiqueApiService } from '../../../core/api/musique-api.service';
import { sortArtistsAlphabetically } from '../../../shared/utils/catalog-sort.utils';

@Component({
  selector: 'app-album-create-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="mb-6">
      <h1 class="text-2xl font-semibold">Cadastro de álbuns</h1>
      <p class="mt-1 text-sm text-zinc-400">Preencha os dados para adicionar um novo álbum.</p>
    </section>

    <form class="grid max-w-3xl gap-4 md:grid-cols-2" novalidate ngNoForm (submit)="onFormSubmit($event)">
      <div class="md:col-span-2">
        <label for="albumName" class="mb-2 block text-sm text-zinc-300">Nome do álbum</label>
        <input
          id="albumName"
          type="text"
          [formControl]="nameControl"
          class="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none ring-emerald-500 focus:ring"
          placeholder="Ex.: Clube da Esquina"
        />
      </div>

      <div>
        <label for="artistId" class="mb-2 block text-sm text-zinc-300">Artista</label>
        <select
          id="artistId"
          [formControl]="artistIdControl"
          class="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none ring-emerald-500 focus:ring"
        >
          <option [ngValue]="0">Selecione um artista</option>
          @for (artist of artists(); track artist.id) {
            <option [ngValue]="artist.id">{{ artist.name }}</option>
          }
        </select>
        @if (artists().length === 0) {
          <p class="mt-2 text-xs text-zinc-400">
            Nenhum artista cadastrado.
            <a routerLink="/artists" class="text-emerald-300 hover:text-emerald-200">
              Cadastre um artista primeiro
            </a>
            .
          </p>
        }
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

      <div>
        <label for="rating" class="mb-2 block text-sm text-zinc-300">Avaliação (estrelas)</label>
        <div class="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900 px-3 py-3">
          <div id="rating" class="relative select-none" (mouseleave)="hoverRating.set(null)">
            <div class="text-3xl tracking-[0.1em] text-zinc-600">★★★★★</div>
            <div
              class="pointer-events-none absolute inset-0 overflow-hidden whitespace-nowrap text-3xl tracking-[0.1em] text-amber-400"
              [style.width]="displayedRatingPercent()"
            >
              ★★★★★
            </div>
            <div class="absolute inset-0 grid grid-cols-10">
              @for (step of ratingSteps; track step) {
                <button
                  type="button"
                  class="h-full w-full cursor-pointer"
                  [attr.aria-label]="'Definir avaliação para ' + (step / 2).toFixed(1) + ' estrelas'"
                  (mouseenter)="hoverRating.set(step / 2)"
                  (click)="setRating(step / 2)"
                ></button>
              }
            </div>
          </div>
          <span class="text-sm text-zinc-300">{{ displayedRating().toFixed(1).replace('.', ',') }} / 5,0</span>
        </div>
      </div>

      <p class="md:col-span-2 text-xs text-zinc-400">
        A capa e o link do Spotify serão preenchidos automaticamente ao salvar.
      </p>

      @if (feedback()) {
        <p class="md:col-span-2 rounded-lg border border-emerald-400/40 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-200">
          {{ feedback() }}
        </p>
      }

      <div class="md:col-span-2">
        <button
          type="submit"
          class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          [disabled]="
            loading() ||
            nameControl.invalid ||
            artistIdControl.invalid ||
            releaseYearControl.invalid ||
            ratingControl.invalid
          "
        >
          {{ loading() ? 'Salvando...' : 'Salvar álbum' }}
        </button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumCreatePage {
  private readonly api = inject(MusiqueApiService);
  readonly loading = signal(false);

  onFormSubmit(event: SubmitEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.onSubmit();
  }

  readonly feedback = signal('');
  readonly hoverRating = signal<number | null>(null);
  readonly artists = toSignal(
    this.api.getArtists().pipe(
      map((artists) => sortArtistsAlphabetically(artists)),
      catchError(() => of([]))
    ),
    { initialValue: [] }
  );

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
  readonly ratingSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

  readonly ratingControl = new FormControl(4, {
    nonNullable: true,
    validators: [Validators.required, Validators.min(0), Validators.max(5)]
  });
  readonly displayedRating = computed(() => this.hoverRating() ?? this.ratingControl.value);
  readonly displayedRatingPercent = computed(() => `${(this.displayedRating() / 5) * 100}%`);

  onSubmit(): void {
    const invalid =
      this.nameControl.invalid ||
      this.artistIdControl.invalid ||
      this.releaseYearControl.invalid ||
      this.ratingControl.invalid;

    if (invalid || this.loading()) {
      this.nameControl.markAsTouched();
      this.artistIdControl.markAsTouched();
      this.releaseYearControl.markAsTouched();
      this.ratingControl.markAsTouched();
      return;
    }

    this.loading.set(true);
    this.feedback.set('');
    this.api
      .createAlbum({
        name: this.nameControl.value.trim(),
        artistId: this.artistIdControl.value,
        releaseYear: this.releaseYearControl.value,
        rating: this.ratingControl.value
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((album) => {
        this.feedback.set(`Álbum "${album.name}" cadastrado com sucesso.`);
        this.nameControl.reset('');
        this.artistIdControl.reset(0);
      });
  }

  setRating(value: number): void {
    this.ratingControl.setValue(value);
    this.ratingControl.markAsDirty();
    this.ratingControl.markAsTouched();
    this.hoverRating.set(null);
  }
}

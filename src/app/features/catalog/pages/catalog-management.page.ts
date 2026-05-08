import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-catalog-management-page',
  imports: [RouterLink],
  template: `
    <section class="mb-6">
      <h1 class="text-2xl font-semibold">Cadastros</h1>
      <p class="mt-1 text-sm text-zinc-400">
        Gerencie os dados do catálogo em um só lugar.
      </p>
    </section>

    <section class="grid gap-4 md:grid-cols-2">
      <a
        routerLink="/artists/new"
        class="group rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-400/60 hover:bg-zinc-900 hover:shadow-lg hover:shadow-emerald-950/20"
      >
        <p class="text-xs uppercase tracking-widest text-zinc-500 transition group-hover:text-zinc-400">Artistas</p>
        <h2 class="mt-2 text-lg font-semibold text-zinc-100">Cadastrar artista</h2>
        <p class="mt-1 text-sm text-zinc-400">Adicione novos artistas para vincular aos álbuns.</p>
      </a>

      <a
        routerLink="/albums/new"
        class="group rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-400/60 hover:bg-zinc-900 hover:shadow-lg hover:shadow-emerald-950/20"
      >
        <p class="text-xs uppercase tracking-widest text-zinc-500 transition group-hover:text-zinc-400">Álbuns</p>
        <h2 class="mt-2 text-lg font-semibold text-zinc-100">Cadastrar álbum</h2>
        <p class="mt-1 text-sm text-zinc-400">Crie lançamentos com capa, nota e dados de artista.</p>
      </a>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogManagementPage {}

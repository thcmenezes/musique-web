import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="hidden w-64 shrink-0 border-r border-white/10 p-4 lg:block">
      <div class="mb-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-400/10 p-4">
        <p class="text-xs uppercase text-zinc-400">Mood</p>
        <h2 class="mt-1 text-lg font-semibold text-zinc-100">Descoberta Diária</h2>
      </div>
      <nav class="space-y-1 text-sm">
        <a class="block rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/10" routerLink="/" routerLinkActive="bg-white/10 text-zinc-50">Início</a>
        <a class="block rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/10" routerLink="/search" routerLinkActive="bg-white/10 text-zinc-50">Busca</a>
        <a class="block rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/10" routerLink="/favorites" routerLinkActive="bg-white/10 text-zinc-50">Coleção</a>
        <a class="block rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/10" routerLink="/artists/new" routerLinkActive="bg-white/10 text-zinc-50">Cadastrar artista</a>
        <a class="block rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/10" routerLink="/albums/new" routerLinkActive="bg-white/10 text-zinc-50">Cadastrar álbum</a>
      </nav>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {}

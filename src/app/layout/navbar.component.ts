import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <header class="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/85 backdrop-blur-xl">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <a routerLink="/" class="group flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-white/5">
          <img src="assets/musique-logo.svg" alt="Musique" class="h-6 w-auto" />
        </a>
        <button
          class="rounded-md border border-white/15 p-2 text-zinc-200 transition hover:border-emerald-400/60 hover:bg-white/10 md:hidden"
          (click)="menuOpen.set(!menuOpen())"
          aria-label="Abrir menu"
        >
          <mat-icon>menu</mat-icon>
        </button>
        <nav class="hidden items-center gap-2 text-sm text-zinc-300 md:flex">
          <a routerLink="/" routerLinkActive="bg-white/10 text-emerald-300" class="rounded-md px-3 py-2 transition hover:bg-white/10 hover:text-zinc-100">Início</a>
          <a routerLink="/artists" routerLinkActive="bg-white/10 text-emerald-300" class="rounded-md px-3 py-2 transition hover:bg-white/10 hover:text-zinc-100">Artistas</a>
          <a routerLink="/albums" routerLinkActive="bg-white/10 text-emerald-300" class="rounded-md px-3 py-2 transition hover:bg-white/10 hover:text-zinc-100">Álbuns</a>
          <a routerLink="/mood" routerLinkActive="bg-white/10 text-emerald-300" class="rounded-md px-3 py-2 transition hover:bg-white/10 hover:text-zinc-100">Mood</a>
        </nav>
      </div>
      @if (menuOpen()) {
        <nav class="space-y-1 border-t border-white/10 px-4 py-3 text-sm md:hidden">
          <a routerLink="/" class="block rounded-md px-3 py-2 text-zinc-200 transition hover:bg-white/10" (click)="menuOpen.set(false)">Início</a>
          <a routerLink="/artists" class="block rounded-md px-3 py-2 text-zinc-200 transition hover:bg-white/10" (click)="menuOpen.set(false)">Artistas</a>
          <a routerLink="/albums" class="block rounded-md px-3 py-2 text-zinc-200 transition hover:bg-white/10" (click)="menuOpen.set(false)">Álbuns</a>
          <a routerLink="/mood" class="block rounded-md px-3 py-2 text-zinc-200 transition hover:bg-white/10" (click)="menuOpen.set(false)">Mood</a>
        </nav>
      }
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  protected readonly menuOpen = signal(false);
}

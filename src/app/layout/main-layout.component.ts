import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen bg-zinc-950 text-zinc-100">
      <div
        class="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_42%),radial-gradient(circle_at_80%_10%,_rgba(52,211,153,0.08),_transparent_40%)]"
      ></div>
      <app-navbar />
      <main class="mx-auto w-full max-w-7xl p-4 md:p-6">
        <router-outlet />
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {}

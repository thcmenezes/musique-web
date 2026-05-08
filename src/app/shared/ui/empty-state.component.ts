import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  imports: [RouterLink],
  template: `
    <section class="rounded-2xl border border-dashed border-white/20 p-8 text-center">
      @if (title()) {
        <h2 class="mb-2 text-base font-semibold text-zinc-100">{{ title() }}</h2>
      }
      <p class="text-sm text-zinc-400">{{ message() }}</p>
      @if (actionLink() && actionLabel()) {
        <a
          [routerLink]="actionLink()"
          class="mt-4 inline-flex rounded-md border border-white/15 px-3 py-2 text-xs text-zinc-200 hover:bg-white/10"
        >
          {{ actionLabel() }}
        </a>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  title = input('');
  message = input('Nenhum resultado encontrado.');
  actionLabel = input('');
  actionLink = input('');
}

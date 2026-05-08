import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-grid',
  template: `
    <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      @for (item of placeholders(); track item) {
        <div class="animate-pulse rounded-2xl border border-white/5 bg-zinc-900 p-3">
          <div class="mb-3 aspect-square rounded-xl bg-zinc-800"></div>
          <div class="mb-2 h-3 rounded bg-zinc-700"></div>
          <div class="h-3 w-2/3 rounded bg-zinc-800"></div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonGridComponent {
  count = input(8);
  placeholders = () => Array.from({ length: this.count() }, (_, idx) => idx);
}

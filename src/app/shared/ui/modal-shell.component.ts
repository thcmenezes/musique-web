import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-shell',
  template: `
    @if (open) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px] transition-opacity duration-200"
        (click)="close.emit()"
      >
        <section
          class="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl shadow-black/50 transition duration-200"
          (click)="$event.stopPropagation()"
          role="dialog"
          aria-modal="true"
        >
          <div class="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-zinc-100">{{ title }}</h2>
              @if (description) {
                <p class="mt-1 text-sm text-zinc-400">{{ description }}</p>
              }
            </div>
            <button
              type="button"
              class="rounded-md border border-white/15 px-2 py-1 text-xs text-zinc-200 transition hover:bg-white/10"
              (click)="close.emit()"
            >
              Fechar
            </button>
          </div>
          <ng-content />
        </section>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalShellComponent {
  @Input({ required: true }) open = false;
  @Input({ required: true }) title = '';
  @Input() description = '';
  @Output() readonly close = new EventEmitter<void>();
}

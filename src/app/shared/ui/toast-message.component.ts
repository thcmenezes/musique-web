import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-toast-message',
  template: `
    @if (message) {
      <div
        class="rounded-xl border px-4 py-3 text-sm shadow-lg transition duration-200"
        [class]="
          tone === 'success'
            ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
            : 'border-red-500/40 bg-red-950/30 text-red-200'
        "
      >
        {{ message }}
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastMessageComponent {
  @Input() message = '';
  @Input() tone: 'success' | 'error' = 'success';
}

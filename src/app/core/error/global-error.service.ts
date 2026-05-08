import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GlobalErrorService {
  readonly error = signal<string | null>(null);

  pushError(message: string): void {
    this.error.set(message);
  }

  clear(): void {
    this.error.set(null);
  }
}

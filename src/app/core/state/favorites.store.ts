import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'musique-favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesStore {
  private readonly ids = signal<number[]>(this.readInitial());
  readonly favorites = computed(() => this.ids());

  isFavorite = (id: number): boolean => this.ids().includes(id);

  toggle(id: number): void {
    const current = this.ids();
    const next = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
    this.ids.set(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  private readInitial(): number[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as number[];
    } catch {
      return [];
    }
  }
}

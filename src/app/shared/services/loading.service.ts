import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _loadingCount = signal(0);
  
  readonly isLoading = signal(false);

  show() {
    this._loadingCount.update(c => c + 1);
    this.isLoading.set(true);
  }

  hide() {
    this._loadingCount.update(c => Math.max(0, c - 1));
    if (this._loadingCount() === 0) {
      this.isLoading.set(false);
    }
  }
}

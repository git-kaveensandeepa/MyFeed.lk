import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {
  readonly isOpen = signal<boolean>(false);

  toggle() {
    this.isOpen.update(v => !v);
  }

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }
}

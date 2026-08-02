import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  readonly searchTerm = signal('');

  setSearchTerm(term: string) {
    this.searchTerm.set(term);
  }
}

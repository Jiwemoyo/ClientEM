import { Injectable } from '@angular/core';
import { BehaviorSubject, asapScheduler } from 'rxjs';
import { observeOn } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.pipe(observeOn(asapScheduler));

  show() {
    asapScheduler.schedule(() => this.loadingSubject.next(true));
  }

  hide() {
    asapScheduler.schedule(() => this.loadingSubject.next(false));
  }
}

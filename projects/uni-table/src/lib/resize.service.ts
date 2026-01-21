import { Injectable, signal, WritableSignal, NgZone } from '@angular/core';
import { ElementRef } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { debounceTime, filter, startWith, takeUntil } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface ResizeState {
  width: number;
  height: number;
  isMobile: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ResizeService {
  private resizeSubject = new Subject<ResizeState>();
  public resize$ = this.resizeSubject.asObservable();
  private destroy$ = new Subject<void>();

  private _width = signal(0);
  private _height = signal(0);
  private _isMobile = signal(false);

  public width: WritableSignal<number> = this._width;
  public height: WritableSignal<number> = this._height;
  public isMobile: WritableSignal<boolean> = this._isMobile;

  private observer: ResizeObserver | null = null;
  private currentElement: HTMLElement | null = null;
  private minWidthForMobile = 768; // Default breakpoint for mobile

  constructor(private ngZone: NgZone) {
    // Initial setup if needed
  }

  /**
   * Observes a given HTML element for resize events.
   * Emits ResizeState changes through resize$ observable and updates signals.
   * @param elementRef The ElementRef of the HTML element to observe.
   * @param minWidthForMobile Optional. The width below which the element is considered 'mobile'. Defaults to 768px.
   */
  observe(elementRef: ElementRef<HTMLElement>, minWidthForMobile?: number): void {
    if (this.observer) {
      this.disconnect();
    }

    this.currentElement = elementRef.nativeElement;
    if (minWidthForMobile !== undefined) {
      this.minWidthForMobile = minWidthForMobile;
    }

    if (!this.currentElement) {
      console.warn('ResizeService: ElementRef nativeElement is null.');
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.observer = new ResizeObserver(entries => {
        const entry = entries[0];
        const { width, height } = entry.contentRect;

        // Run updates inside Angular zone to ensure change detection
        this.ngZone.run(() => {
          const newIsMobile = width < this.minWidthForMobile;
          if (width !== this._width() || height !== this._height() || newIsMobile !== this._isMobile()) {
            this._width.set(width);
            this._height.set(height);
            this._isMobile.set(newIsMobile);
            this.resizeSubject.next({ width, height, isMobile: newIsMobile });
          }
        });
      });

      this.observer.observe(this.currentElement);
    });

    // Initial check
    this.ngZone.run(() => {
      const initialWidth = this.currentElement!.clientWidth;
      const initialHeight = this.currentElement!.clientHeight;
      const initialIsMobile = initialWidth < this.minWidthForMobile;
      this._width.set(initialWidth);
      this._height.set(initialHeight);
      this._isMobile.set(initialIsMobile);
      this.resizeSubject.next({ width: initialWidth, height: initialHeight, isMobile: initialIsMobile });
    });
  }

  /**
   * Disconnects the ResizeObserver.
   */
  disconnect(): void {
    if (this.observer && this.currentElement) {
      this.observer.unobserve(this.currentElement);
      this.observer.disconnect();
      this.observer = null;
      this.currentElement = null;
      this.destroy$.next(); // Notify any subscribers that observation has stopped
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.destroy$.complete();
  }
}

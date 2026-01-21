import { Component, input, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'uni-label',
  standalone: true,
  imports: [CommonModule],
  template: `{{ translatedLabel() }}`,
  styles: []
})
export class UniLabelComponent {
  key = input.required<string>();

  private translateService = inject(TranslateService, { optional: true });
  private _langChangeTrigger = signal(0); // Dummy signal to trigger re-evaluation

  translatedLabel = computed(() => {
    // Depend on _langChangeTrigger to re-evaluate when language changes
    this._langChangeTrigger(); 
    if (this.translateService && typeof this.translateService.instant === 'function') {
      return this.translateService.instant(this.key());
    } else {
      return this.key();
    }
  });

  constructor() {
    if (this.translateService && this.translateService.onLangChange) {
      // Subscribe to language changes and update the dummy signal
      this.translateService.onLangChange
        .pipe(takeUntilDestroyed())
        .subscribe(() => {
          this._langChangeTrigger.update(value => value + 1);
        });
    }
  }
}

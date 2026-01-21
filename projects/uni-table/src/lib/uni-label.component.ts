import { Component, input, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Added CommonModule import
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'uni-label',
  standalone: true,
  imports: [CommonModule],
  // The template is just the text. No wrappers needed.
  template: `{{ displayText() }}` 
})
export class UniLabelComponent {
  // 1. The Key passed from config (e.g., 'USER.NAME')
  key = input.required<string>();

  // 2. Soft Injection: Try to get the service, but don't crash if missing
  private translate = inject(TranslateService, { optional: true });

  // 3. Create a Signal for the Language Change Event
  // If service exists, we turn the Observable stream into a Signal
  // If service is missing, we create a dummy signal that never changes
  private langChange = this.translate 
    ? toSignal(this.translate.onLangChange) 
    : signal(null);

  // 4. The Reactive Logic
  displayText = computed(() => {
    const k = this.key();
    
    // Register dependency on the language signal so this re-runs when lang changes
    this.langChange(); 

    // If Service exists, return translated string (Instant/Synchronous)
    if (this.translate) {
      return this.translate.instant(k);
    }

    // Fallback: Just show the key
    return k;
  });
}
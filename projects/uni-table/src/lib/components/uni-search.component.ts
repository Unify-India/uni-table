import { Component, inject, input } from '@angular/core';
import { UniTableComponent } from '../uni-table.component'; // Ensure correct path
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel if needed, or remove if not.

@Component({
  selector: 'uni-search',
  standalone: true,
  imports: [FormsModule], // Add FormsModule here if needed
  template: `
    <div class="uni-search-wrapper">
      <span class="search-icon">🔍</span>
      <input 
        type="text" 
        [placeholder]="placeholder()" 
        (input)="onInput($event)"
        class="uni-search-input"
      />
    </div>
  `,
  styles: [`
    .uni-search-wrapper { display: flex; align-items: center; border: 1px solid #ccc; padding: 6px 10px; border-radius: 4px; background: #fff; }
    .uni-search-input { border: none; outline: none; margin-left: 8px; width: 100%; background: transparent; }
  `]
})
export class UniSearchComponent {
  // 1. Dependency Injection: Finds the parent Table automatically
  private table = inject(UniTableComponent);
  
  // 2. Configurable Placeholder
  placeholder = input('Search...'); 

  onInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    // 3. Update the Table's Signal State directly
    this.table.searchTerm.set(val); // Changed from updateSearchTerm to searchTerm.set
  }
}

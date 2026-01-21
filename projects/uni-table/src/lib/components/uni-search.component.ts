import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'uni-search',
  standalone: true,
  imports: [FormsModule], 
  template: `
    <div class="uni-search-wrapper">
      <i class="bi bi-search search-icon"></i>
      <input 
        type="text" 
        [placeholder]="placeholder()" 
        (input)="onInput($event)"
        class="uni-search-input"
      />
    </div>
  `,
  styleUrl: './uni-search.component.scss' // Moved styles to a file
})
export class UniSearchComponent {
  searchTermChange = output<string>();
  placeholder = input('Search...'); 

  onInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    this.searchTermChange.emit(val);
  }
}

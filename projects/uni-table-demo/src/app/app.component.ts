import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientSideTableComponent } from './components/client-side-table/client-side-table.component';
import { ServerSideTableComponent } from './components/server-side-table/server-side-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ClientSideTableComponent, ServerSideTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'uni-table-demo';
}
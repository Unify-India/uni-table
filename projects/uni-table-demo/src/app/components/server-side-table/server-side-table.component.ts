import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniTableComponent, UniTableConfig, UniDataConfig, UniColumn, UniTemplateDirective, UniTableState } from 'uni-table';
import { TableService } from '../../table.service';

@Component({
  selector: 'app-server-side-table',
  standalone: true,
  imports: [CommonModule, FormsModule, UniTableComponent, UniTemplateDirective],
  templateUrl: './server-side-table.component.html',
  styleUrl: './server-side-table.component.scss'
})
export class ServerSideTableComponent implements OnInit {

  tableConfig: UniTableConfig = {
    serverSide: true,
    paging: true,
    searching: true,
    colVis: true,
    pageLength: 5,
    pagingControls: {
      firstLast: true,
      prevNext: true,
      type: 'text',
      firstText: 'First',
      lastText: 'Last',
      prevText: 'Prev',
      nextText: 'Next'
    },
    overflow: 'responsive',
    storageKey: 'uni_table_server_state',
    autoSaveState: true,
    showSaveControls: true,
    showContextMenu: false,
  };

  dataConfig: UniDataConfig = {
    columns: [
      { key: 'id', title: 'ID', width: '50px', priority: 10 },
      { key: 'name', title: 'Name', priority: 5, },
      { key: 'position', title: 'Position', priority: 4, headerWrap: true },
      { key: 'office', title: 'Office', priority: 3 },
      { key: 'age', title: 'Age', width: '50px', priority: 2 },
      { key: 'startDate', title: 'Start Date', priority: 1 },
      { key: 'salary', title: 'Salary', templateId: 'salaryTpl', priority: 1, cellClass: 'text-end' },
      { key: 'actions', title: 'Actions', templateId: 'actionTpl', orderable: false, searchable: false, priority: 1000, width: '100px', cellClass: 'text-center' }
    ],
    data: [],
    totalRecords: 0,
  };

  constructor(private readonly tableService: TableService) { }

  ngOnInit(): void {
    // Initial data load can be triggered here if needed,
    // but the table will emit its initial state on load.
  }

  onStateChange(state: UniTableState) {
    this.tableService.getData(state).subscribe(response => {
      this.dataConfig = {
        ...this.dataConfig,
        data: response.data,
        totalRecords: response.total
      };
    });
  }

  edit(row: any) {
    alert(`Editing ${row.name}`);
  }

  delete(row: any) {
    alert(`Deleting ${row.name}`);
  }
}

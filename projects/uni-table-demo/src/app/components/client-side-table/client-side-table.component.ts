import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniTableComponent, UniTableConfig, UniDataConfig, UniColumn, UniTemplateDirective } from 'uni-table';

@Component({
  selector: 'app-client-side-table',
  standalone: true,
  imports: [CommonModule, FormsModule, UniTableComponent, UniTemplateDirective],
  templateUrl: './client-side-table.component.html',
  styleUrl: './client-side-table.component.scss'
})
export class ClientSideTableComponent {
  tableConfig: UniTableConfig = {
    paging: true,
    searching: true,
    colVis: true,
    pageLength: 5,
    overflow: 'responsive',
    storageKey: 'uni_table_client_state',
    autoSaveState: true,
    showSaveControls: true,
    showContextMenu: true,
  };

  dataConfig: UniDataConfig = {
    columns: [
      { key: 'id', title: 'ID', width: '50px', priority: 10 },
      { key: 'name', title: 'Name', priority: 5, },
      { key: 'position', title: 'Position', priority: 4, headerWrap: true },
      { key: 'office', title: 'Office', priority: 3 },
      { key: 'age', title: 'Age', width: '50px', priority: 2 },
      { key: 'startDate', title: 'Start Date', priority: 1 },
      { key: 'salary', title: 'Salary', templateId: 'salaryTpl', priority: 1, cellClass: 'text-end', cellStyle: this.salaryCellStyle },
      { key: 'actions', title: 'Actions', templateId: 'actionTpl', orderable: false, searchable: false, priority: 1000, width: '100px', cellClass: 'text-center' }
    ],
    data: [
      { id: 1, name: 'Tiger Nixon', position: 'System Architect', office: 'Edinburgh', age: 61, startDate: '2011/04/25', salary: 320800 },
      { id: 2, name: 'Garrett Winters', position: 'Accountant', office: 'Tokyo', age: 63, startDate: '2011/07/25', salary: 170750 },
      { id: 3, name: 'Ashton Cox', position: 'Junior Technical Author', office: 'San Francisco', age: 66, startDate: '2009/01/12', salary: 86000 },
      { id: 4, name: 'Cedric Kelly', position: 'Senior Javascript Developer', office: 'Edinburgh', age: 22, startDate: '2012/03/29', salary: 433060 },
      { id: 5, name: 'Airi Satou', position: 'Accountant', office: 'Tokyo', age: 33, startDate: '2008/11/28', salary: 162700 },
      { id: 6, name: 'Brielle Williamson', position: 'Integration Specialist', office: 'New York', age: 61, startDate: '2012/12/02', salary: 372000 },
      { id: 7, name: 'Herrod Chandler', position: 'Sales Assistant', office: 'San Francisco', age: 59, startDate: '2012/08/06', salary: 137500 },
      { id: 8, name: 'Rhona Davidson', position: 'Integration Specialist', office: 'Tokyo', age: 55, startDate: '2010/10/14', salary: 327900 },
      { id: 9, name: 'Colleen Hurst', position: 'Javascript Developer', office: 'San Francisco', age: 39, startDate: '2009/09/15', salary: 205500 },
      { id: 10, name: 'Sonya Frost', position: 'Software Engineer', office: 'Edinburgh', age: 23, startDate: '2008/12/13', salary: 103600 },
      { id: 11, name: 'Jena Gaines', position: 'Office Manager', office: 'London', age: 30, startDate: '2008/12/19', salary: 90560 },
      { id: 12, name: 'Quinn Flynn', position: 'Support Lead', office: 'Edinburgh', age: 22, startDate: '2013/03/03', salary: 342000 },
      { id: 13, name: 'Charde Marshall', position: 'Regional Director', office: 'San Francisco', age: 36, startDate: '2008/10/16', salary: 470600 },
      { id: 14, name: 'Haley Kennedy', position: 'Senior Marketing Designer', office: 'London', age: 43, startDate: '2012/12/18', salary: 313500 },
      { id: 15, name: 'Tatyana Fitzpatrick', position: 'Regional Director', office: 'London', age: 19, startDate: '2010/03/17', salary: 385750 },
      { id: 16, name: 'Michael Silva', position: 'Marketing Designer', office: 'London', age: 66, startDate: '2012/11/27', salary: 198500 },
      { id: 17, name: 'Paul Byrd', position: 'Chief Financial Officer (CFO)', office: 'New York', age: 64, startDate: '2010/06/09', salary: 725000 },
      { id: 18, name: 'Gloria Little', position: 'Systems Administrator', office: 'New York', age: 59, startDate: '2009/04/10', salary: 237500 },
      { id: 19, name: 'Bradley Greer', position: 'Software Engineer', office: 'London', age: 41, startDate: '2012/10/13', salary: 132000 },
      { id: 20, name: 'Dai Rios', position: 'Personnel Lead', office: 'Edinburgh', age: 35, startDate: '2012/09/26', salary: 217500 }
    ],
  };

  edit(row: any) {
    alert(`Editing ${row.name}`);
  }

  delete(row: any) {
    alert(`Deleting ${row.name}`);
  }

  get salaryCellStyle() {
    return (row: any, col: UniColumn) => {
      if (row.salary > 300000) {
        return { 'background-color': 'var(--uni-color-red)', 'color': 'white' };
      }
      return { 'background-color': '', 'color': '' };
    };
  }

  addEntry() {
    const newId = this.dataConfig.data.length + 1;
    const newEntry = {
      id: newId,
      name: `New User ${newId}`,
      position: 'New Position',
      office: 'New Office',
      age: Math.floor(Math.random() * 40) + 20,
      startDate: new Date().toISOString().slice(0, 10),
      salary: Math.floor(Math.random() * 100000) + 50000
    };
    this.dataConfig = {
      ...this.dataConfig,
      data: [...this.dataConfig.data, newEntry]
    };
  }
}

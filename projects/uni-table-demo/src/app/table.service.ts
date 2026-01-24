import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { UniTableState } from 'uni-table';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  private _data = [
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
  ];

  constructor() { }

  getData(state: UniTableState): Observable<{ data: any[], total: number }> {
    let data = [...this._data];

    // Filtering
    if (state.searchTerm) {
      const searchTerm = state.searchTerm.toLowerCase();
      data = data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm)
        )
      );
    }

    // Sorting
    if (state.sortColumn && state.sortDirection) {
      data.sort((a: Record<string, any>, b: Record<string, any>) => {
        // Ensure sortColumn is not null before using it as an index
        if (state.sortColumn === null) {
          return 0; // Should not happen given the outer if condition, but for type safety
        }
        const aValue = a[state.sortColumn];
        const bValue = b[state.sortColumn];
        const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        return state.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    const total = data.length;

    // Pagination
    if (state.currentPage && state.pageSize) {
      const start = (state.currentPage - 1) * state.pageSize;
      const end = start + state.pageSize;
      data = data.slice(start, end);
    }

    return of({ data, total }).pipe(delay(500));
  }
}

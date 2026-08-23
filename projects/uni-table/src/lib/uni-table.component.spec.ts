import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UniTableComponent } from './uni-table.component';
import { UniDataConfig, UniTableConfig, UniColumn } from './uni-table.interface';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

interface TestRow {
  id: number;
  name: string;
  age: number;
}

describe('UniTableComponent', () => {
  let component: UniTableComponent<TestRow>;
  let fixture: ComponentFixture<UniTableComponent<TestRow>>;

  const mockColumns: UniColumn<TestRow>[] = [
    { key: 'id', title: 'ID', priority: 10 },
    { key: 'name', title: 'Name', priority: 5 },
    { key: 'age', title: 'Age', priority: 1 }
  ];

  const mockData: TestRow[] = [
    { id: 1, name: 'John Doe', age: 30 },
    { id: 2, name: 'Jane Smith', age: 25 },
    { id: 3, name: 'Bob Johnson', age: 40 },
    { id: 4, name: 'Alice Brown', age: 35 },
    { id: 5, name: 'Charlie Davis', age: 28 },
    { id: 6, name: 'Eve Wilson', age: 45 }
  ];

  const mockDataConfig: UniDataConfig<TestRow> = {
    columns: mockColumns,
    data: mockData
  };

  beforeEach(async () => {
    // Mock ResizeObserver
    (window as unknown as { ResizeObserver: unknown }).ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    await TestBed.configureTestingModule({
      imports: [UniTableComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(UniTableComponent<TestRow>);
    component = fixture.componentInstance;
    
    // Set inputs using signal-compatible way
    fixture.componentRef.setInput('dataConfig', mockDataConfig);
    fixture.componentRef.setInput('config', { paging: true, searching: true });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the correct number of rows', () => {
    const rows = fixture.debugElement.queryAll(By.css('tbody tr.uni-table__tr'));
    // By default pageSize is 10, so all 6 rows should be visible
    expect(rows.length).toBe(6);
  });

  it('should render the correct columns', () => {
    const headers = fixture.debugElement.queryAll(By.css('th.uni-table__th'));
    expect(headers.length).toBe(3);
    expect(headers[0].nativeElement.textContent).toContain('ID');
    expect(headers[1].nativeElement.textContent).toContain('Name');
    expect(headers[2].nativeElement.textContent).toContain('Age');
  });

  it('should filter data when searching', fakeAsync(() => {
    component.onSearch('John');
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tbody tr.uni-table__tr'));
    expect(rows.length).toBe(2); // John Doe and Bob Johnson
    expect(rows[0].nativeElement.textContent).toContain('John Doe');
    expect(rows[1].nativeElement.textContent).toContain('Bob Johnson');
  }));

  it('should sort data when clicking on header', () => {
    const ageHeader = fixture.debugElement.queryAll(By.css('th.uni-table__th'))[2];
    ageHeader.nativeElement.click();
    fixture.detectChanges();

    // Default sort is ASC. Ages: 25, 28, 30, 35, 40, 45
    let firstRow = fixture.debugElement.query(By.css('tbody tr.uni-table__tr'));
    expect(firstRow.nativeElement.textContent).toContain('Jane Smith'); // Age 25

    ageHeader.nativeElement.click();
    fixture.detectChanges();
    // Now DESC. Ages: 45, 40, 35, 30, 28, 25
    firstRow = fixture.debugElement.query(By.css('tbody tr.uni-table__tr'));
    expect(firstRow.nativeElement.textContent).toContain('Eve Wilson'); // Age 45
  });

  it('should paginate data correctly', () => {
    component.pageSize.set(2);
    fixture.detectChanges();

    expect(component.totalPages()).toBe(3);
    
    let rows = fixture.debugElement.queryAll(By.css('tbody tr.uni-table__tr'));
    expect(rows.length).toBe(2);
    expect(rows[0].nativeElement.textContent).toContain('John Doe');

    component.onPageChange(2);
    fixture.detectChanges();

    rows = fixture.debugElement.queryAll(By.css('tbody tr.uni-table__tr'));
    expect(rows.length).toBe(2);
    expect(rows[0].nativeElement.textContent).toContain('Bob Johnson');
  });

  it('should toggle column visibility', () => {
    component.toggleColumnVisibility('age');
    fixture.detectChanges();

    const headers = fixture.debugElement.queryAll(By.css('th.uni-table__th'));
    expect(headers.length).toBe(2);
    expect(headers[0].nativeElement.textContent).toContain('ID');
    expect(headers[1].nativeElement.textContent).toContain('Name');
    
    const ageHeader = headers.find(h => h.nativeElement.textContent.includes('Age'));
    expect(ageHeader).toBeUndefined();
  });

  it('should save and restore state from localStorage', () => {
    const storageKey = 'test-table-state';
    fixture.componentRef.setInput('config', { storageKey: storageKey });
    fixture.detectChanges();
    
    component.onSearch('Alice');
    component.manualSave();

    const saved = JSON.parse(localStorage.getItem(storageKey)!);
    expect(saved.searchTerm).toBe('Alice');

    // Reset component and simulate reload
    component.searchTerm.set('');
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.searchTerm()).toBe('Alice');
    localStorage.removeItem(storageKey);
  });

  it('should emit stateChange in server-side mode', () => {
    const emitSpy = spyOn(component.stateChange, 'emit');
    fixture.componentRef.setInput('config', { serverSide: true });
    fixture.detectChanges();
    
    component.onSearch('test');
    fixture.detectChanges();

    expect(emitSpy).toHaveBeenCalled();
    const emittedState = emitSpy.calls.mostRecent().args[0];
    expect(emittedState.searchTerm).toBe('test');
  });

  it('should toggle row expansion', () => {
    component.toggleRowExpansion(0);
    expect(component.expandedRows().has(0)).toBeTrue();

    component.toggleRowExpansion(0);
    expect(component.expandedRows().has(0)).toBeFalse();
  });

  describe('Detailed scenarios', () => {
    it('should handle sorting with null, undefined, and mixed values safely', () => {
      const dataWithNulls: TestRow[] = [
        { id: 3, name: 'Charlie Davis', age: 30 },
        { id: 1, name: 'Alice Brown', age: (null as unknown as number) },
        { id: 2, name: 'Bob Johnson', age: 25 }
      ];
      fixture.componentRef.setInput('dataConfig', {
        columns: mockColumns,
        data: dataWithNulls
      });
      fixture.detectChanges();

      // Sort by Age ascending
      component.onSort(mockColumns[2]); // age
      fixture.detectChanges();

      const sortedData = component.processedData();
      // Nulls should sort to the end of the ascending order
      expect(sortedData[0].name).toBe('Bob Johnson'); // age 25
      expect(sortedData[1].name).toBe('Charlie Davis'); // age 30
      expect(sortedData[2].name).toBe('Alice Brown'); // age null
    });

    it('should recover gracefully if storageKey is set but localStorage contains invalid JSON', () => {
      const storageKey = 'corrupt-table-state';
      localStorage.setItem(storageKey, 'invalid-json-{');
      
      fixture.componentRef.setInput('config', { storageKey });
      
      // Should not throw an exception on init
      expect(() => {
        component.ngOnInit();
        fixture.detectChanges();
      }).not.toThrow();

      localStorage.removeItem(storageKey);
    });

    it('should reject invalid page numbers on page change', () => {
      component.pageSize.set(2);
      fixture.detectChanges();
      
      // Initial page is 1
      expect(component.currentPage()).toBe(1);

      // Attempt to navigate to page 0 (invalid)
      component.onPageChange(0);
      expect(component.currentPage()).toBe(1);

      // Attempt to navigate to page 10 (invalid, max page is 3)
      component.onPageChange(10);
      expect(component.currentPage()).toBe(1);

      // Valid navigation
      component.onPageChange(2);
      expect(component.currentPage()).toBe(2);
    });

    it('should compute combined styles dynamically for headers and cells', () => {
      const colWithStyles: UniColumn<TestRow> = {
        key: 'name',
        title: 'Name',
        width: '200px',
        cellStyle: (row, column) => ({ color: row.age > 30 ? 'red' : 'blue' })
      };

      const cellStyle = component.getCombinedStyle(colWithStyles.cellStyle, { id: 1, name: 'John', age: 40 }, colWithStyles);
      expect(cellStyle['width']).toBe('200px');
      expect(cellStyle['color']).toBe('red');

      const cellStyleYoung = component.getCombinedStyle(colWithStyles.cellStyle, { id: 1, name: 'John', age: 20 }, colWithStyles);
      expect(cellStyleYoung['color']).toBe('blue');
    });
  });
});

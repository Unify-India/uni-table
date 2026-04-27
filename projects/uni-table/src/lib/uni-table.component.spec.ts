import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UniTableComponent } from './uni-table.component';
import { UniDataConfig, UniTableConfig } from './uni-table.interface';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

describe('UniTableComponent', () => {
  let component: UniTableComponent;
  let fixture: ComponentFixture<UniTableComponent>;

  const mockColumns = [
    { key: 'id', title: 'ID', priority: 10 },
    { key: 'name', title: 'Name', priority: 5 },
    { key: 'age', title: 'Age', priority: 1 }
  ];

  const mockData = [
    { id: 1, name: 'John Doe', age: 30 },
    { id: 2, name: 'Jane Smith', age: 25 },
    { id: 3, name: 'Bob Johnson', age: 40 },
    { id: 4, name: 'Alice Brown', age: 35 },
    { id: 5, name: 'Charlie Davis', age: 28 },
    { id: 6, name: 'Eve Wilson', age: 45 }
  ];

  const mockDataConfig: UniDataConfig = {
    columns: mockColumns,
    data: mockData
  };

  beforeEach(async () => {
    // Mock ResizeObserver
    (window as any).ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    await TestBed.configureTestingModule({
      imports: [UniTableComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(UniTableComponent);
    component = fixture.componentInstance;
    
    // Set inputs and trigger ngOnChanges manually
    component.dataConfig = mockDataConfig;
    component.config = { paging: true, searching: true };
    component.ngOnChanges({
      dataConfig: {
        currentValue: mockDataConfig,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      },
      config: {
        currentValue: component.config,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      }
    } as any);

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
    component.config = { storageKey: storageKey };
    component.ngOnChanges({
        config: {
            currentValue: { storageKey: storageKey },
            previousValue: undefined,
            firstChange: true,
            isFirstChange: () => true
        }
    } as any);
    
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
    spyOn(component.stateChange, 'emit');
    component.config = { serverSide: true };
    component.ngOnChanges({
        config: {
            currentValue: { serverSide: true },
            previousValue: undefined,
            firstChange: true,
            isFirstChange: () => true
        }
    } as any);

    fixture.detectChanges();
    
    component.onSearch('test');
    fixture.detectChanges();

    expect(component.stateChange.emit).toHaveBeenCalled();
    const emittedState = (component.stateChange.emit as jasmine.Spy).calls.mostRecent().args[0];
    expect(emittedState.searchTerm).toBe('test');
  });

  it('should toggle row expansion', () => {
    component.toggleRowExpansion(0);
    expect(component.expandedRows().has(0)).toBeTrue();

    component.toggleRowExpansion(0);
    expect(component.expandedRows().has(0)).toBeFalse();
  });
});

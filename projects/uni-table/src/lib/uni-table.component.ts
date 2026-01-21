import { Component, Input, OnInit, Output, EventEmitter, ElementRef, ChangeDetectorRef, AfterViewInit, OnDestroy, ViewChild, signal, computed, WritableSignal, effect, SimpleChanges, OnChanges, ContentChildren, QueryList, AfterContentInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniDtOptions, UniDataConfig, UniTableState, UniColumn } from './uni-table.interface';
import { UniLabelComponent } from './uni-label.component';
import { UniTemplateDirective } from './uni-template.directive';

@Component({
  selector: 'uni-table',
  standalone: true,
  imports: [CommonModule, FormsModule, UniTemplateDirective, UniLabelComponent],
  templateUrl: './uni-table.component.html',
  styleUrl: './uni-table.component.scss'
})
export class UniTableComponent implements OnInit, OnChanges, AfterContentInit, AfterViewInit, OnDestroy {
  @Input() dtOptions: UniDtOptions = {};
  @Input() dataConfig: UniDataConfig = { columns: [], data: [] };
  @Output() stateChange = new EventEmitter<UniTableState>();

  @ViewChild('tableContainer') tableContainer!: ElementRef;
  @ViewChild('dataTable') dataTable!: ElementRef;
  @ContentChildren(UniTemplateDirective) templates!: QueryList<UniTemplateDirective>;

  private templateMap = new Map<string, TemplateRef<any>>();

  // Internal signals to react to input changes
  protected dtOptionsS = signal<UniDtOptions>({});
  protected dataConfigS = signal<UniDataConfig>({ columns: [], data: [] });

  // State
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  sortColumn = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Visibility & Expansion
  hiddenColumns = signal<Set<string>>(new Set());
  responsiveHiddenColumns = signal<Set<string>>(new Set());
  expandedRows = signal<Set<number>>(new Set());
  showColVisMenu = signal(false);

  // Reordering
  draggedColumnIndex = signal<number | null>(null);

  // Computed/Processed Data
  processedData = computed(() => {
    const options = this.dtOptionsS();
    const config = this.dataConfigS();
    if (options.serverSide) {
      return config.data;
    }

    let data = [...config.data];
    const term = this.searchTerm();

    // 1. Filtering
    if (options.searching && term) {
      const lowerTerm = term.toLowerCase();
      const searchableCols = config.columns.filter(c => c.searchable !== false).map(c => c.key);
      data = data.filter(row =>
        searchableCols.some(colKey =>
          String(row[colKey] || '').toLowerCase().includes(lowerTerm)
        )
      );
    }

    // 2. Sorting
    const sortCol = this.sortColumn();
    if (sortCol) {
      const sortDir = this.sortDirection();
      data.sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  });

  totalPages = computed(() => {
    const options = this.dtOptionsS();
    const total = options.serverSide ? (this.dataConfigS().totalRecords || 0) : this.processedData().length;
    return Math.ceil(total / this.pageSize());
  });

  paginatedData = computed(() => {
    const options = this.dtOptionsS();
    if (options.paging === false) {
      return this.processedData();
    }
    // ensure current page is valid
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(Math.max(1, this.totalPages()));
    }
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return this.processedData().slice(startIndex, startIndex + this.pageSize());
  });

  pages = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  protected Math = Math;
  private resizeObserver: ResizeObserver | null = null;

  constructor(private cdr: ChangeDetectorRef) {
    // This effect handles side-effects that should occur when state changes
    effect(() => {
      // By reading these signals, we make them dependencies of the effect
      const state: UniTableState = {
        searchTerm: this.searchTerm(),
        pageSize: this.pageSize(),
        sortColumn: this.sortColumn(),
        sortDirection: this.sortDirection(),
        currentPage: this.currentPage(),
        hiddenColumns: Array.from(this.hiddenColumns())
      };

      // Now, perform the side-effects without writing to any signals
      if (this.dtOptionsS().serverSide) {
        this.stateChange.emit(state);
      }
      if (this.dtOptionsS().onStateChange) {
        this.dtOptionsS().onStateChange!(state);
      }
      if (this.dtOptionsS().saveState) {
        localStorage.setItem(this.stateKey, JSON.stringify(state));
      }
    });
  }

  ngOnInit(): void {
    // Set initial values from dtOptions
    this.pageSize.set(this.dtOptions.pageLength || 10);
    if (this.dtOptions.defaultSort) {
      this.sortColumn.set(this.dtOptions.defaultSort.column);
      this.sortDirection.set(this.dtOptions.defaultSort.direction);
    }

    // Initialize hidden columns from config
    const initialHidden = new Set<string>();
    this.dataConfig.columns.forEach(col => {
      if (col.visible === false) {
        initialHidden.add(col.key);
      }
    });
    this.hiddenColumns.set(initialHidden);

    if (this.dtOptions.responsive && !this.dtOptions.overflow) {
      this.dtOptions.overflow = 'responsive';
    }
    if (!this.dtOptions.overflow) {
      this.dtOptions.overflow = 'visible';
    }

    // Load State if enabled
    if (this.dtOptions.saveState) {
      this.loadState();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dtOptions']) {
      this.dtOptionsS.set(this.dtOptions);
    }
    if (changes['dataConfig']) {
      this.dataConfigS.set(this.dataConfig);
    }
  }
  
  ngAfterContentInit(): void {
    this.templates.forEach(item => {
      this.templateMap.set(item.name, item.template);
    });
  }

  ngAfterViewInit() {
    if (this.dtOptionsS().overflow === 'responsive') {
      this.setupResizeObserver();
    }
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  getTemplate(col: UniColumn): TemplateRef<any> | null {
    if (col.templateId) {
      return this.templateMap.get(col.templateId) || null;
    }
    return col.cellTemplate || null;
  }
  
  // --- Responsive Logic ---

  setupResizeObserver() {
    if (typeof ResizeObserver === 'undefined') return;
    this.resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => this.calculateResponsiveColumns());
    });
    if (this.tableContainer) {
      this.resizeObserver.observe(this.tableContainer.nativeElement);
    }
  }

  calculateResponsiveColumns() {
    if (this.dtOptionsS().overflow !== 'responsive' || !this.tableContainer || !this.dataTable) return;
    
    const containerWidth = this.tableContainer.nativeElement.clientWidth;
    const visibleCols = this.dataConfigS().columns.filter(c => !this.hiddenColumns().has(c.key));
    const sortedCols = [...visibleCols].sort((a, b) => (a.priority || 0) - (b.priority || 0));

    if (this.dataTable.nativeElement.offsetWidth > containerWidth) {
      for (const col of sortedCols) {
        if (!this.responsiveHiddenColumns().has(col.key)) {
          this.responsiveHiddenColumns.update(s => {
            s.add(col.key);
            return new Set(s);
          });
          this.cdr.detectChanges(); // Manual trigger needed for ResizeObserver
          if (this.dataTable.nativeElement.offsetWidth <= containerWidth) break;
        }
      }
    } else {
      const hiddenArr = Array.from(this.responsiveHiddenColumns());
      const hiddenCols = hiddenArr.map(key => this.dataConfigS().columns.find(c => c.key === key)!).filter(Boolean);
      hiddenCols.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      
      if (hiddenCols.length > 0) {
        const colToRestore = hiddenCols[0];
        this.responsiveHiddenColumns.update(s => {
          s.delete(colToRestore.key);
          return new Set(s);
        });
        this.cdr.detectChanges(); // Manual trigger
        if (this.dataTable.nativeElement.offsetWidth > containerWidth) {
          this.responsiveHiddenColumns.update(s => {
            s.add(colToRestore.key);
            return new Set(s);
          });
          this.cdr.detectChanges(); // Manual trigger
        }
      }
    }
  }

  // --- Actions ---

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  onSort(column: UniColumn) {
    if (column.orderable === false) return;
    if (this.sortColumn() === column.key) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column.key);
      this.sortDirection.set('asc');
    }
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }
  
  onPageSizeChange(event: any) {
    this.pageSize.set(+event.target.value);
    this.currentPage.set(1);
  }

  toggleColumnVisibility(columnKey: string) {
    this.hiddenColumns.update(s => {
      s.has(columnKey) ? s.delete(columnKey) : s.add(columnKey);
      return new Set(s);
    });
  }

  toggleColVisMenu() {
    this.showColVisMenu.update(v => !v);
  }

  toggleRowExpansion(index: number) {
    this.expandedRows.update(s => {
      s.has(index) ? s.delete(index) : s.add(index);
      return new Set(s);
    });
  }
  
  isColumnHidden(columnKey: string): boolean {
    return this.hiddenColumns().has(columnKey) || this.responsiveHiddenColumns().has(columnKey);
  }

  getResponsiveHiddenColumns(): UniColumn[] {
    return this.dataConfigS().columns.filter(col => this.responsiveHiddenColumns().has(col.key));
  }
  
  // --- Reordering ---

  onDragStart(event: DragEvent, index: number) {
    this.draggedColumnIndex.set(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, dropIndex: number) {
    event.preventDefault();
    const fromIndex = this.draggedColumnIndex();
    if (fromIndex !== null && fromIndex !== dropIndex) {
      this.reorderColumns(fromIndex, dropIndex);
    }
    this.draggedColumnIndex.set(null);
  }

  reorderColumns(fromIndex: number, toIndex: number) {
    this.dataConfigS.update(config => {
        const reordered = [...config.columns];
        const col = reordered.splice(fromIndex, 1)[0];
        reordered.splice(toIndex, 0, col);
        return { ...config, columns: reordered };
    });
  }

  getColumnStyle(col: UniColumn): any {
      const style: any = {};
      if (col.width) style.width = col.width;
      if (col.minWidth) style.minWidth = col.minWidth;
      return style;
  }
  
  // --- State Management ---
  
  private get stateKey(): string {
    return this.dtOptionsS().stateSaveKey || 'uni-datatable-state';
  }
  
  loadState() {
    const saved = localStorage.getItem(this.stateKey);
    if (saved) {
      const state = JSON.parse(saved);
      this.searchTerm.set(state.searchTerm || '');
      this.pageSize.set(state.pageSize || 10);
      this.sortColumn.set(state.sortColumn || null);
      this.sortDirection.set(state.sortDirection || 'asc');
      if (state.hiddenColumns) {
        this.hiddenColumns.set(new Set(state.hiddenColumns));
      }
      this.currentPage.set(state.currentPage || 1);
    }
  }
}

import { Component, Input, OnInit, Output, EventEmitter, ElementRef, ChangeDetectorRef, AfterViewInit, OnDestroy, ViewChild, signal, computed, WritableSignal, effect, SimpleChanges, OnChanges, ContentChildren, QueryList, AfterContentInit, TemplateRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniTableConfig, UniDataConfig, UniTableState, UniColumn, SortState } from './uni-table.interface';
import { UniLabelComponent } from './components/uni-label.component';
import { UniTemplateDirective } from './components/uni-template.directive';
import { UniSearchComponent } from './components/uni-search.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'uni-table',
  standalone: true,
  imports: [CommonModule, FormsModule, UniTemplateDirective, UniLabelComponent, UniSearchComponent],
  templateUrl: './uni-table.component.html',
  styleUrl: './uni-table.component.scss'
})
export class UniTableComponent implements OnInit, OnChanges, AfterContentInit, AfterViewInit, OnDestroy {
  @Input() config: UniTableConfig = {};
  @Input() dataConfig: UniDataConfig = { columns: [], data: [] };
  @Input() externalState: any = null;
  @Output() stateChange = new EventEmitter<UniTableState>();
  @Output() stateRestored = new EventEmitter<any>();

  @ViewChild('tableContainer') tableContainer!: ElementRef;
  @ViewChild('dataTable') dataTable!: ElementRef;
  @ContentChildren(UniTemplateDirective) templates!: QueryList<UniTemplateDirective>;
  @ContentChild(UniSearchComponent) manualSearchComponent?: UniSearchComponent;
  
  private templateMap = new Map<string, TemplateRef<any>>();
  private manualSearchSubscription?: Subscription;

  protected configS = signal<UniTableConfig>({});
  protected dataConfigS = signal<UniDataConfig>({ columns: [], data: [] });

  public effectivePageLengthOptions = computed(() => {
    return this.configS().pageLengthOptions || [5, 10, 25, 50, 100];
  });

  public searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  sortColumn = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  hiddenColumns = signal<Set<string>>(new Set());
  responsiveHiddenColumns = signal<Set<string>>(new Set());
  expandedRows = signal<Set<number>>(new Set());
  showColVisMenu = signal(false);
  menuOpen = signal(false);

  draggedColumnIndex = signal<number | null>(null);

  processedData = computed(() => {
    const options = this.configS();
    const config = this.dataConfigS();
    if (options.serverSide) {
      return config.data;
    }

    let data = [...config.data];
    const term = this.searchTerm();

    if (options.searching !== false && term) {
      const lowerTerm = term.toLowerCase();
      const searchableCols = config.columns.filter(c => c.searchable !== false).map(c => c.key);
      data = data.filter(row =>
        searchableCols.some(colKey =>
          String(row[colKey] || '').toLowerCase().includes(lowerTerm)
        )
      );
    }

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
    const options = this.configS();
    const total = options.serverSide ? (this.dataConfigS().totalRecords || 0) : this.processedData().length;
    return Math.ceil(total / this.pageSize());
  });

  paginatedData = computed(() => {
    const options = this.configS();
    if (options.paging === false || options.serverSide) {
      return this.processedData();
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
    effect(() => {
      const current = this.currentPage();
      const total = this.totalPages();
      if (total === 0) {
          if (current !== 1) {
              this.currentPage.set(1);
          }
      } else if (current > total) {
          this.currentPage.set(total);
      }
    });

    effect(() => {
      const cfg = this.configS();
      const state: UniTableState = {
        searchTerm: this.searchTerm(),
        pageSize: this.pageSize(),
        sortColumn: this.sortColumn(),
        sortDirection: this.sortDirection(),
        currentPage: this.currentPage(),
        hiddenColumns: Array.from(this.hiddenColumns()),
        externalFilters: this.externalState
      };

      if (cfg.serverSide) {
        this.stateChange.emit(state);
      }
      if (cfg.onStateChange) {
        cfg.onStateChange!(state);
      }
      if (cfg.autoSaveState !== false && cfg.storageKey) {
        const savedState = {
          searchTerm: state.searchTerm,
          pageSize: state.pageSize,
          sort: { column: state.sortColumn, direction: state.sortDirection },
          currentPage: state.currentPage,
          hiddenCols: state.hiddenColumns,
          externalFilters: state.externalFilters
        };
        localStorage.setItem(cfg.storageKey, JSON.stringify(savedState));
      }
    });
  }

  ngOnInit(): void {
    // Initial setup of non-config-dependent signals is handled here.
    // The main configS signal is set in ngOnChanges, which runs before ngOnInit.
    
    // Set initial hidden columns based on dataConfig
    const initialHidden = new Set<string>();
    this.dataConfig.columns.forEach(col => {
      if (col.visible === false) {
        initialHidden.add(col.key);
      }
    });
    this.hiddenColumns.set(initialHidden);

    // Now that configS is resolved, apply its values to other signals,
    // respecting that localStorage might have already set them.
    const cfg = this.configS();
    
    // Check if pageSize is still at its initial default before overriding with config
    if (this.pageSize() === 10 && cfg.pageLength) {
      this.pageSize.set(cfg.pageLength);
    }

    // Check if sortColumn is still at its initial default before overriding with config
    if (this.sortColumn() === null && cfg.defaultSort) {
      this.sortColumn.set(cfg.defaultSort.column);
      this.sortDirection.set(cfg.defaultSort.direction);
    }
    
    // Restore state from localStorage, which will override any defaults set above.
    if (cfg.storageKey) {
      const saved = localStorage.getItem(cfg.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        this.searchTerm.set(parsed.searchTerm ?? '');
        this.pageSize.set(parsed.pageSize ?? cfg.pageLength ?? 10);
        this.currentPage.set(parsed.currentPage ?? 1);
        this.sortColumn.set(parsed.sort?.column ?? cfg.defaultSort?.column ?? null);
        this.sortDirection.set(parsed.sort?.direction ?? cfg.defaultSort?.direction ?? 'asc');
        if (parsed.hiddenCols) {
          this.hiddenColumns.set(new Set(parsed.hiddenCols));
        }

        if (parsed.externalFilters) {
          this.stateRestored.emit(parsed.externalFilters);
        }
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      const resolvedConfig: UniTableConfig = {
        paging: true,
        searching: true,
        colVis: true,
        pageLength: 10,
        overflow: 'visible',
        serverSide: false,
        manualSearch: false,
        showContextMenu: false,
        autoSaveState: true,
        showSaveControls: false,
        pageLengthOptions: [5, 10, 25, 50, 100],
        ...this.config
      };

      if (this.config.responsive === true && !this.config.overflow) {
        resolvedConfig.overflow = 'responsive';
      }

      this.configS.set(resolvedConfig);
    }
    if (changes['dataConfig']) {
      this.dataConfigS.set(this.dataConfig);
    }
  }
  
  ngAfterContentInit(): void {
    this.templates.forEach(item => {
      this.templateMap.set(item.name, item.template);
    });

    if (this.manualSearchComponent) {
      this.manualSearchSubscription = this.manualSearchComponent.searchTermChange.subscribe(term => {
        this.onSearch(term);
      }) as Subscription;
    }
  }

  ngAfterViewInit() {
    if (this.configS().overflow === 'responsive') {
      this.setupResizeObserver();
    }
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.manualSearchSubscription?.unsubscribe();
  }

  getColumnTemplate(col: UniColumn): TemplateRef<any> | null {
    if (col.templateId) {
      return this.templateMap.get(col.templateId) || null;
    }
    return col.cellTemplate || null;
  }

  getTemplate(name: string): TemplateRef<any> | null {
    return this.templateMap.get(name) || null;
  }
  
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
    if (this.configS().overflow !== 'responsive' || !this.tableContainer || !this.dataTable) return;
    
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
          this.cdr.detectChanges();
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
        this.cdr.detectChanges();
        if (this.dataTable.nativeElement.offsetWidth > containerWidth) {
          this.responsiveHiddenColumns.update(s => {
            s.add(colToRestore.key);
            return new Set(s);
          });
          this.cdr.detectChanges();
        }
      }
    }
  }

  onSearch(term: string) {
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

  toggleMenu() {
    this.menuOpen.update(v => !v);
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
  
  manualSave() {
    const cfg = this.configS();
    if (!cfg.storageKey) return;

    const fullSnapshot = {
      searchTerm: this.searchTerm(),
      pageSize: this.pageSize(),
      sort: { column: this.sortColumn(), direction: this.sortDirection() },
      currentPage: this.currentPage(),
      hiddenCols: Array.from(this.hiddenColumns()),
      externalFilters: this.externalState
    };

    localStorage.setItem(cfg.storageKey, JSON.stringify(fullSnapshot));
  }

  resetView() {
    const cfg = this.configS();
    if (cfg.storageKey) {
      localStorage.removeItem(cfg.storageKey);
    }

    this.searchTerm.set('');
    this.pageSize.set(cfg.pageLength || 10);
    this.currentPage.set(1);
    this.sortColumn.set(cfg.defaultSort?.column || null);
    this.sortDirection.set(cfg.defaultSort?.direction || 'asc');
    this.hiddenColumns.set(new Set(this.dataConfigS().columns.filter(c => c.visible === false).map(c => c.key)));
    
    this.stateRestored.emit(null); 
  }

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

  getCombinedStyle(
    styleConfig: { [key: string]: string } | ((...args: any[]) => { [key: string]: string }) | undefined,
    row: any | null,
    col: UniColumn
  ): { [key: string]: string } {
    let styles: { [key: string]: string } = {};

    if (col.width) styles['width'] = col.width;
    if (col.minWidth) styles['minWidth'] = col.minWidth;

    if (styleConfig) {
      const dynamicStyles = typeof styleConfig === 'function' ? (row ? styleConfig(row, col) : styleConfig(col)) : styleConfig;
      styles = { ...styles, ...dynamicStyles };
    }
    return styles;
  }
}
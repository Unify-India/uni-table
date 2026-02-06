import { 
  Component, OnInit, ElementRef, ChangeDetectorRef, AfterViewInit, OnDestroy, 
  signal, computed, effect, TemplateRef, HostListener, 
  input, output, viewChild, contentChild, contentChildren, linkedSignal,
  AfterContentInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniTableConfig, UniDataConfig, UniTableState, UniColumn } from './uni-table.interface';
import { UniLabelComponent } from './components/uni-label.component';
import { UniTemplateDirective } from './components/uni-template.directive';
import { UniSearchComponent } from './components/uni-search.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'uni-table',
  standalone: true,
  imports: [CommonModule, FormsModule, UniLabelComponent, UniSearchComponent],
  templateUrl: './uni-table.component.html',
  styleUrl: './uni-table.component.scss'
})
export class UniTableComponent implements OnInit, AfterContentInit, AfterViewInit, OnDestroy {
  // Signal Inputs
  config = input<UniTableConfig>({});
  dataConfig = input<UniDataConfig>({ columns: [], data: [] });
  externalState = input<any>(null);

  // Signal Outputs
  stateChange = output<UniTableState>();
  stateRestored = output<any>();

  // Signal Queries
  tableContainer = viewChild<ElementRef>('tableContainer');
  dataTable = viewChild<ElementRef>('dataTable');
  colVisWrapper = viewChild<ElementRef>('colVisWrapper');
  contextMenuWrapper = viewChild<ElementRef>('contextMenuWrapper');
  templates = contentChildren(UniTemplateDirective);
  manualSearchComponent = contentChild(UniSearchComponent);
  
  private templateMap = computed(() => {
    const map = new Map<string, TemplateRef<any>>();
    this.templates().forEach(item => {
      map.set(item.name(), item.template);
    });
    return map;
  });

  private manualSearchSubscription?: any;

  // Derived Configuration Signal
  protected configS = computed(() => {
    const cfg = this.config();
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
      pagingControls: {
        firstLast: false,
        prevNext: true,
        type: 'icons',
        firstText: 'First',
        lastText: 'Last',
        prevText: 'Previous',
        nextText: 'Next',
        ...cfg.pagingControls
      },
      ...cfg
    };

    if (cfg.responsive === true && !cfg.overflow) {
      resolvedConfig.overflow = 'responsive';
    }

    return resolvedConfig;
  });

  protected dataConfigS = linkedSignal(() => this.dataConfig());

  public effectivePageLengthOptions = computed(() => {
    return this.configS().pageLengthOptions || [5, 10, 25, 50, 100];
  });

  public searchTerm = signal('');
  currentPage = signal(1);
  
  pageSize = linkedSignal(() => this.configS().pageLength ?? 10);
  sortColumn = linkedSignal<string | null>(() => this.configS().defaultSort?.column ?? null);
  sortDirection = linkedSignal<'asc' | 'desc'>(() => this.configS().defaultSort?.direction ?? 'asc');

  hiddenColumns = linkedSignal<UniDataConfig, Set<string>>({
    source: this.dataConfig,
    computation: (data: UniDataConfig) => {
      const initialHidden = new Set<string>();
      data.columns.forEach((col: UniColumn) => {
        if (col.visible === false) {
          initialHidden.add(col.key);
        }
      });
      return initialHidden;
    }
  });

  responsiveHiddenColumns = signal<Set<string>>(new Set());
  expandedRows = signal<Set<number>>(new Set());
  showColVisMenu = signal(false);
  menuOpen = signal(false);

  draggedColumnIndex = signal<number | null>(null);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showColVisMenu() && !this.colVisWrapper()?.nativeElement.contains(event.target)) {
      this.showColVisMenu.set(false);
    }
    if (this.menuOpen() && !this.contextMenuWrapper()?.nativeElement.contains(event.target)) {
      this.menuOpen.set(false);
    }
  }

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
        externalFilters: this.externalState()
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
    const cfg = this.configS();
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
  
  ngAfterContentInit(): void {
    effect(() => {
      const comp = this.manualSearchComponent();
      if (this.manualSearchSubscription) {
        this.manualSearchSubscription.unsubscribe();
      }
      if (comp) {
        this.manualSearchSubscription = comp.searchTermChange.subscribe(term => {
          this.onSearch(term);
        });
      }
    });
  }

  ngAfterViewInit() {
    effect(() => {
      if (this.configS().overflow === 'responsive') {
        this.setupResizeObserver();
      } else {
        this.resizeObserver?.disconnect();
      }
    });
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    if (this.manualSearchSubscription) {
      this.manualSearchSubscription.unsubscribe();
    }
  }

  getColumnTemplate(col: UniColumn): TemplateRef<any> | null {
    if (col.templateId) {
      return this.templateMap().get(col.templateId) || null;
    }
    return col.cellTemplate || null;
  }

  getTemplate(name: string): TemplateRef<any> | null {
    return this.templateMap().get(name) || null;
  }
  
  setupResizeObserver() {
    if (typeof ResizeObserver === 'undefined') return;
    this.resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => this.calculateResponsiveColumns());
    });
    const container = this.tableContainer();
    if (container) {
      this.resizeObserver.observe(container.nativeElement);
    }
  }

  calculateResponsiveColumns() {
    const container = this.tableContainer();
    const table = this.dataTable();
    if (this.configS().overflow !== 'responsive' || !container || !table) return;
    
    const containerWidth = container.nativeElement.clientWidth;
    const visibleCols = this.dataConfigS().columns.filter(c => !this.hiddenColumns().has(c.key));
    const sortedCols = [...visibleCols].sort((a, b) => (a.priority || 0) - (b.priority || 0));

    if (table.nativeElement.offsetWidth > containerWidth) {
      for (const col of sortedCols) {
        if (!this.responsiveHiddenColumns().has(col.key)) {
          this.responsiveHiddenColumns.update(s => {
            const next = new Set(s);
            next.add(col.key);
            return next;
          });
          this.cdr.detectChanges();
          if (table.nativeElement.offsetWidth <= containerWidth) break;
        }
      }
    } else {
      const hiddenArr = Array.from(this.responsiveHiddenColumns());
      const hiddenCols = hiddenArr.map(key => this.dataConfigS().columns.find(c => c.key === key)!).filter(Boolean);
      hiddenCols.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      
      if (hiddenCols.length > 0) {
        const colToRestore = hiddenCols[0];
        this.responsiveHiddenColumns.update(s => {
          const next = new Set(s);
          next.delete(colToRestore.key);
          return next;
        });
        this.cdr.detectChanges();
        if (table.nativeElement.offsetWidth > containerWidth) {
          this.responsiveHiddenColumns.update(s => {
            const next = new Set(s);
            next.add(colToRestore.key);
            return next;
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
      const next = new Set(s);
      next.has(columnKey) ? next.delete(columnKey) : next.add(columnKey);
      return next;
    });
  }

  toggleColVisMenu() {
    this.showColVisMenu.update(v => !v);
    this.menuOpen.set(false);
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
    this.showColVisMenu.set(false);
  }

  toggleRowExpansion(index: number) {
    this.expandedRows.update(s => {
      const next = new Set(s);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
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
      externalFilters: this.externalState()
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
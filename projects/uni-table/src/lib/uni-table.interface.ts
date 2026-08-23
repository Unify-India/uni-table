import { TemplateRef } from '@angular/core';

export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

export interface UniPagingControl {
  firstLast?: boolean;
  prevNext?: boolean;
  type?: 'icons' | 'text';
  firstText?: string;
  lastText?: string;
  prevText?: string;
  nextText?: string;
}

export interface UniTableConfig {
  paging?: boolean;
  pagingControls?: UniPagingControl;
  searching?: boolean;
  colVis?: boolean;
  pageLength?: number;
  responsive?: boolean; // Deprecated
  overflow?: 'scroll' | 'responsive' | 'visible';
  serverSide?: boolean;
  onStateChange?: (state: UniTableState) => void;
  defaultSort?: SortState; // Use new SortState interface
  manualSearch?: boolean;
  showContextMenu?: boolean;
  pageLengthOptions?: number[];

  /**
   * PERSISTENCE SETTINGS
   */
  storageKey?: string; // New
  autoSaveState?: boolean; // New
  showSaveControls?: boolean; // New
}

export interface UniTableState {
  searchTerm: string;
  pageSize: number;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  hiddenColumns: string[];
  externalFilters?: unknown;
}

export interface UniColumn<T extends object = Record<string, unknown>> {
  key: string;            // Data property key or unique ID
  title: string;          // Header display text
  headerLabel?: string;   // Optional translation key for header, falls back to title
  width?: string;
  minWidth?: string;
  visible?: boolean;      // Default true
  orderable?: boolean;    // Default true
  searchable?: boolean;   // Default true
  priority?: number;      // Higher number = Higher Priority (Stays visible longer). Default 0.
  headerClass?: string;
  cellClass?: string;
  headerStyle?: { [key: string]: string } | ((column: UniColumn<T>) => { [key: string]: string });
  cellStyle?: { [key: string]: string } | ((row: T, column: UniColumn<T>) => { [key: string]: string });
  cellTemplate?: TemplateRef<unknown>; // For direct template reference
  templateId?: string; // For template reference by string ID
  headerWrap?: boolean; // Optional: If true, header text will wrap. Defaults to false (ellipsis).
}

export interface UniAction {
  label: string;
  icon?: string;
  class?: string;
  onClick: () => void;
}

export interface UniDataConfig<T extends object = Record<string, unknown>> {
  columns: UniColumn<T>[];
  data: T[];
  totalRecords?: number;
  actions?: UniAction[]; // Toolbar actions like Export
}
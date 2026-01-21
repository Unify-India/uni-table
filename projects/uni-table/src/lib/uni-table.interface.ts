import { TemplateRef } from '@angular/core';

export interface UniDtOptions {
  paging?: boolean;
  searching?: boolean;
  colVis?: boolean;
  pageLength?: number;
  responsive?: boolean; // Deprecated
  overflow?: 'scroll' | 'responsive' | 'visible';
  saveState?: boolean;
  stateSaveKey?: string;
  serverSide?: boolean;
  onStateChange?: (state: UniTableState) => void;
  defaultSort?: { column: string; direction: 'asc' | 'desc' };
}

export interface UniTableState {
  searchTerm: string;
  pageSize: number;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  hiddenColumns: string[];
}

export interface UniColumn {
  key: string;            // Data property key or unique ID
  title: string;          // Header display text
  width?: string;
  minWidth?: string;
  visible?: boolean;      // Default true
  orderable?: boolean;    // Default true
  searchable?: boolean;   // Default true
  priority?: number;      // Higher number = Higher Priority (Stays visible longer). Default 0.
  headerClass?: string;
  cellClass?: string;
  cellTemplate?: TemplateRef<any>; // For direct template reference
  templateId?: string; // For template reference by string ID
  headerWrap?: boolean; // Optional: If true, header text will wrap. Defaults to false (ellipsis).
}

export interface UniAction {
  label: string;
  icon?: string;
  class?: string;
  onClick: () => void;
}

export interface UniDataConfig {
  columns: UniColumn[];
  data: any[];
  totalRecords?: number;
  actions?: UniAction[]; // Toolbar actions like Export
}

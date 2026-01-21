# Uni-Table

`uni-table` is a feature-rich, reusable Angular data table library designed to be a blend of DataTables.net and Material Design principles. It provides a flexible and powerful way to display tabular data.

## Features

### **`uni-table` Feature Highlights**

*   **Signal-First Architecture:** Leverages Angular 19 `signal` inputs and `computed()` properties for sorting, pagination, and filtering, ensuring optimal `OnPush` performance and instant UI updates.
*   **Reactive Column Visibility (ColVis):** Implements column toggling via reactive signals rather than array mutation, allowing for instant, flicker-free showing and hiding of columns without re-rendering the entire table.
*   **Hybrid Responsiveness (Smart Collapse):** Utilizes `ResizeObserver` to automatically detect container width and move overflowing columns into an expandable "child row" (accordion style), eliminating horizontal scrolling on mobile.
*   **Config-Driven Template Injection:** Enables users to map custom UI templates (like action buttons) to columns using simple string IDs in the JSON config, keeping the table logic completely decoupled from user component logic.
*   **Decoupled Translation Support:** Includes a built-in, config-toggleable translation pipe (via `InjectionToken`) that handles header localization without requiring complex external dependencies or class overrides.
*   **Modern CSS Variable Theming:** Exposes a full suite of CSS Custom Properties (e.g., `--uni-header-bg`) for effortless theming that pierces Shadow DOM boundaries without using `::ng-deep`.
*   **Encapsulation-Free Customization:** Uses `ViewEncapsulation.None` with strict BEM-style naming (e.g., `.uni-table__row`) to allow users to easily override default styles using standard CSS classes.
*   **Dynamic Class Injection:** Supports conditional styling by allowing users to inject custom class names for specific headers or cells directly via the column configuration (e.g., `{ cellClass: 'status-error' }`).

## Getting Started

1.  **Installation**

    ```bash
    npm install uni-table
    ```

2.  **Import the component**

    Since `UniTableComponent` is a standalone component, you can import it directly into your component's `imports` array.

    ```typescript
    import { UniTableComponent } from 'uni-table';

    @Component({
      // ...
      imports: [CommonModule, UniTableComponent],
    })
    export class YourComponent {}
    ```

3.  **Use in your template**

    ```html
    <uni-table [dtOptions]="dtOptions" [dataConfig]="dataConfig">
    </uni-table>
    ```

## API

### Inputs

| Name         | Type            | Description                                                                                                                                                                                          |
| :----------- | :-------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dtOptions`  | `UniDtOptions`  | An object containing options to configure the table's features, such as pagination, searching, and state saving. See the `UniDtOptions` interface for more details.                                |
| `dataConfig` | `UniDataConfig` | An object that defines the table's columns and provides the data to be displayed. It can also include custom toolbar actions. See the `UniDataConfig` interface for more details. |

### Outputs

| Name          | Type                           | Description                                                                                              |
| :------------ | :----------------------------- | :------------------------------------------------------------------------------------------------------- |
| `stateChange` | `EventEmitter<UniTableState>` | Emits an event whenever the table's state changes (e.g., pagination, sorting, searching). The emitted event contains the current state of the table. |

---

## Interfaces

### UniDtOptions

```typescript
export interface UniDtOptions {
  paging?: boolean;
  searching?: boolean;
  colVis?: boolean;
  pageLength?: number;
  responsive?: boolean; // Deprecated, use overflow
  overflow?: 'scroll' | 'responsive' | 'visible';
  saveState?: boolean;
  stateSaveKey?: string;
  serverSide?: boolean;
  onStateChange?: (state: UniTableState) => void;
  defaultSort?: { column: string; direction: 'asc' | 'desc' };
}
```

### UniDataConfig

```typescript
export interface UniDataConfig {
  columns: UniColumn[];
  data: any[];
  totalRecords?: number; // Required for server-side pagination
  actions?: UniAction[];
}
```

### UniColumn

```typescript
export interface UniColumn {
  key: string;
  title: string;
  width?: string;
  minWidth?: string;
  visible?: boolean;
  orderable?: boolean;
  searchable?: boolean;
  priority?: number; // Higher number = higher priority (less likely to be hidden)
  headerClass?: string;
  cellClass?: string;
  cellTemplate?: TemplateRef<any>;
}
```

### UniAction

```typescript
export interface UniAction {
  label: string;
  icon?: string;
  class?: string;
  onClick: () => void;
}
```

### UniTableState

```typescript
export interface UniTableState {
  searchTerm: string;
  pageSize: number;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  hiddenColumns: string[];
}
```

---

## Building

To build the library, run:

```bash
ng build uni-table
```

This command will compile your project, and the build artifacts will be placed in the `dist/` directory.

### Publishing the Library

Once the project is built, you can publish your library by following these steps:

1.  Navigate to the `dist` directory:
    ```bash
    cd dist/uni-table
    ```

2.  Run the `npm publish` command to publish your library to the npm registry:
    ```bash
    npm publish
    ```

# 📖 Uni-Table Implementation Guide (Plain English)

Welcome to the **Uni-Table Implementation Guide**! This document explains how Uni-Table works, how to configure it, and what each parameter does in simple, developer-friendly terms.

---

## 🛠️ The Core Mechanism: How It Works

Uni-Table operates in one of two segregated modes: **Client-Side Mode** or **Server-Side Mode**. 

---

### 💻 1. Client-Side Mode (Default)
In Client-Side Mode, you provide the entire dataset upfront. Uni-Table takes full control over processing it in the browser.

*   **How it handles Data:** You pass the full array to `dataConfig.data`. Uni-Table holds this in memory.
*   **How it handles Pagination:** Slices the full data array locally according to `pageLength`.
*   **How it handles Sorting & Searching:** Automatically filters and sorts the records in-browser using reactive Signals.
*   **Who is responsible for what:**
    *   *You (Parent):* Fetch the entire list once and pass it in.
    *   *Uni-Table:* Handles page numbers, filtering columns, searching, sorting, and UI controls automatically.

#### 📝 Client-Side Code Example
```typescript
// parent.component.ts
tableConfig: UniTableConfig = {
  serverSide: false, // Default is false
  paging: true,
  searching: true
};

dataConfig: UniDataConfig = {
  columns: [
    { key: 'name', title: 'Name' },
    { key: 'role', title: 'Role' }
  ],
  data: [
    { name: 'Alice', role: 'Developer' },
    { name: 'Bob', role: 'Designer' },
    { name: 'Charlie', role: 'Manager' }
    // ... all other records
  ]
};
```

---

### 🌐 2. Server-Side Mode
In Server-Side Mode, Uni-Table serves as a UI controller. It does not search, sort, or paginate locally. Instead, it reports user actions back to you so you can fetch the correct slice from your database or API.

*   **How it handles Data:** You pass only the current page's slice of data to `dataConfig.data`.
*   **How it handles Pagination:** Uni-Table relies on `dataConfig.totalRecords` to calculate the total pages and render the page numbers correctly.
*   **How it handles Sorting & Searching:** Instead of sorting/searching the local array, it emits a `(stateChange)` event containing the search terms and sort fields.
*   **Who is responsible for what:**
    *   *Uni-Table:* Renders UI page buttons, tracks search input fields, and captures click actions. Emits state updates.
    *   *You (Parent):* Listens to the `(stateChange)` event, makes an API call to query the backend database, and feeds the resulting slice and total record count back to the table.

#### 📝 Server-Side Code Example
```html
<!-- parent.component.html -->
<uni-table 
  [config]="tableConfig" 
  [dataConfig]="dataConfig" 
  (stateChange)="onTableStateChange($event)">
</uni-table>
```

```typescript
// parent.component.ts
tableConfig: UniTableConfig = {
  serverSide: true, // Crucial: enables server-side mode
  paging: true,
  searching: true
};

dataConfig: UniDataConfig = {
  columns: [
    { key: 'name', title: 'Name' },
    { key: 'role', title: 'Role' }
  ],
  data: [], // Starts empty, filled dynamically
  totalRecords: 0 // Starts at 0, updated by API response
};

onTableStateChange(state: UniTableState) {
  // state contains: searchTerm, pageSize, sortColumn, sortDirection, currentPage
  this.apiService.getUsers(state).subscribe(response => {
    this.dataConfig = {
      ...this.dataConfig,
      data: response.items,         // Only the current page's items (e.g., 10 items)
      totalRecords: response.total  // Total records matching in database (e.g., 500)
    };
  });
}
```

---

## 📥 Component Inputs Mapping

Uni-Table takes three primary inputs to control its behavior, styling, and data:

```html
<uni-table 
  [config]="tableConfig" 
  [dataConfig]="dataConfig"
  [externalState]="filters()">
</uni-table>
```

### 1. `config` (`UniTableConfig`)
This object handles the **features** and **UI behavior** of the table.

| Parameter | Type | Default | Purpose (Plain English) |
| :--- | :--- | :--- | :--- |
| `serverSide` | `boolean` | `false` | When `true`, offloads all sorting, filtering, and paging calculations to your server/API instead of processing them locally. |
| `paging` | `boolean` | `true` | When `true`, splits your table into separate pages. When `false`, displays all records on a single page. |
| `searching` | `boolean` | `true` | Enables or disables the global search input box above the table. |
| `colVis` | `boolean` | `false` | Enables a button/dropdown that lets users toggle columns on and off dynamically. |
| `pageLength` | `number` | `10` | The default number of rows to show per page. |
| `pageLengthOptions` | `number[]` | `[5, 10, 25, 50]`| The dropdown options for changing the page length (e.g. `[10, 20, 50]`). |
| `overflow` | `'scroll' \| 'responsive' \| 'visible'` | `'scroll'` | Controls how the table behaves on small screens:<br>• `'scroll'`: Shows a horizontal scrollbar.<br>• `'responsive'`: Automatically collapses columns that do not fit into an expandable row details drawer.<br>• `'visible'`: No overflow handling. |
| `manualSearch` | `boolean` | `false` | If `true`, hides the built-in search bar so you can bind and trigger searches using your own custom external input. |
| `showContextMenu` | `boolean` | `false` | When `true`, enables a right-click action menu on table rows. |
| `storageKey` | `string` | `undefined` | A unique string key used to save the table's state in the browser's `localStorage` (so state persists when the page is refreshed). |
| `autoSaveState` | `boolean` | `true` | When `true` (and a `storageKey` is provided), automatically saves sorting, paging, search terms, and column visibility changes to storage. |
| `showSaveControls` | `boolean` | `false` | If `true`, adds "Save View" and "Reset View" buttons to the toolbar for saving/loading manual state snapshots. |
| `defaultSort` | `SortState` | `undefined` | Defines the starting sort column and direction when the table loads (e.g. `{ column: 'name', direction: 'asc' }`). |
| `pagingControls` | `UniPagingControl` | `undefined` | Customizes the look of pagination buttons (e.g., icons vs. text like "Next" / "Prev"). |

---

### 2. `dataConfig` (`UniDataConfig`)
This object handles the **structure** and **source data** of the table.

| Parameter | Type | Purpose (Plain English) |
| :--- | :--- | :--- |
| `columns` | `UniColumn[]` | An array defining each column's key, title, width, templates, and behavior. |
| `data` | `any[]` | The array of objects (rows) to display inside the table. |
| `totalRecords` | `number` | **Crucial for Server-Side mode.** The total number of rows available on the server (used to compute pages and show count summaries). |
| `actions` | `UniAction[]` | Custom actions (like export buttons) to show in the table toolbar. |

---

### 3. `externalState` (`any`)
* **Purpose:** Allows you to feed external filter configurations (e.g., status dropdowns, date ranges) into the table. When the user saves their view, this external filter state is saved alongside the internal table state, and is returned to the parent via the `stateRestored` output.

---

## 🔀 Column Configurations (`UniColumn`)

Each column configuration object inside `dataConfig.columns` accepts the following parameters:

| Parameter | Type | Default | Purpose (Plain English) |
| :--- | :--- | :--- | :--- |
| `key` | `string` | **Required** | The property key in your row data objects (e.g., `'email'` to bind `row.email`). |
| `title` | `string` | **Required** | The text displayed in the column header. |
| `headerLabel` | `string` | `undefined` | A translation key for multi-language headers. Falls back to `title` if not defined. |
| `width` | `string` | `undefined` | Sets a fixed width for the column (e.g., `'150px'`, `'20%'`). |
| `minWidth` | `string` | `undefined` | Sets a minimum width constraint for responsive views. |
| `visible` | `boolean` | `true` | Whether the column is visible by default when loaded. |
| `orderable` | `boolean` | `true` | Setting to `false` disables column sorting when the user clicks the header. |
| `searchable` | `boolean` | `true` | Setting to `false` excludes this column's data from global search results. |
| `priority` | `number` | `0` | Determines column preservation during responsiveness. Columns with a higher priority number stay visible longer, while lower priority columns collapse first. |
| `headerWrap` | `boolean` | `false` | When `true`, header text wraps to multiple lines. When `false`, long header text is truncated with an ellipsis. |
| `cellTemplate` | `TemplateRef` | `undefined` | A direct reference to a custom Angular HTML template to render the cell. |
| `templateId` | `string` | `undefined` | A string identifier referencing an `<ng-template>` declared with the `uniTemplate` directive. |
| `headerClass` / `cellClass` | `string` | `undefined` | CSS classes to style the header or body cells. |
| `headerStyle` / `cellStyle` | `object \| function` | `undefined` | Custom styles (or a dynamic function returning styles based on row/column context). |

---

## 📤 Component Outputs (Events)

### `stateChange` (`EventEmitter<UniTableState>`)
* **When it fires:** Anytime the table's state changes (page index, page size, sort order, search term, hidden columns, or external filters change).
* **Why use it:** This is the primary driver for **Server-Side** table implementations. You hook into this event, retrieve the current state, send a request to your API, and pass back the data slice to `dataConfig.data`.

### `stateRestored` (`EventEmitter<any>`)
* **When it fires:** On table initialization if a saved view or state was recovered from local storage.
* **Why use it:** Restores external search filters in your parent component's forms or UI to stay in sync with the table's recovered state.

---

## 🎨 Styling & Theme Customization (No `::ng-deep` required)

Uni-Table is built with CSS Variables (CSS Custom Properties). This design allows you to style the table cleanly from your parent component's style sheet without having to use deprecated/heavy approaches like `::ng-deep` or modifying `:host` directly.

### How to Override Variables
To customize the table, simply reference the selector `uni-table` in your component's CSS/SCSS or your global stylesheet, and define new values for the parameters:

```css
/* src/app/my-component.component.css */
uni-table {
  --uni-font-family: 'Inter', sans-serif;
  --uni-bg: #1e1e24;
  --uni-text-color: #f8f9fa;
  --uni-border: #3a3a42;
  
  /* Style the headers */
  --uni-table-head-bg: #2e2e38;
  --uni-table-head-color: #0d6efd;
  
  /* Highlight rows on hover */
  --uni-table-hover-bg: rgba(255, 255, 255, 0.05);
  
  /* Primary buttons & Pagination */
  --uni-button-primary-bg: #00bcd4;
  --uni-button-primary-border-color: #00bcd4;
}
```

### 📋 Available CSS Variables Reference

Here is the complete list of custom variables defined on the table component that you can override:

#### 1. General & Base Styles
*   `--uni-font-family` (Default: `sans-serif`): Font family of all text in the table.
*   `--uni-font-size` (Default: `1rem`): Base font size.
*   `--uni-line-height` (Default: `1.5`): Line height.
*   `--uni-bg` (Default: `#fff`): The background color of the table card/container.
*   `--uni-text-color` (Default: `#212529`): Default font color for row values.
*   `--uni-border` (Default: `#dee2e6`): Border color for cells and containers.
*   `--uni-border-radius` (Default: `0.375rem`): Outer corner rounding of the table container.

#### 2. Header, Footer, and Structure
*   `--uni-hf-bg` (Default: `#f8f9fa`): Default background for table headers and footers.
*   `--uni-hf-text-color` (Default: `#495057`): Default text color in headers and footers.
*   `--uni-hf-padding` (Default: `0.75rem`): Padding size within headers and footers.

#### 3. Table Rows & Cells
*   `--uni-table-bg` (Default: `transparent`): Cell background color.
*   `--uni-table-cell-padding-y` (Default: `0.5rem`): Vertical padding inside table cells.
*   `--uni-table-cell-padding-x` (Default: `0.5rem`): Horizontal padding inside table cells.
*   `--uni-table-striped-bg` (Default: `rgba(0, 0, 0, 0.05)`): Background of striped alternating rows.
*   `--uni-table-hover-bg` (Default: `rgba(0, 0, 0, 0.075)`): Background of rows when hovered.
*   `--uni-table-head-bg` (Default: `var(--uni-hf-bg)`): Background color of the header row.
*   `--uni-table-head-color` (Default: `var(--uni-hf-text-color)`): Text color of header columns.
*   `--uni-table-sort-icon-color` (Default: `#adb5bd`): Sorting arrow icon default color.
*   `--uni-table-sort-icon-active-color` (Default: `var(--uni-text-color)`): Sorting arrow icon color when active.

#### 4. Inputs & Selection Controls
*   `--uni-control-bg` (Default: `#fff`): Search inputs and dropdown options background.
*   `--uni-control-border-color` (Default: `#ced4da`): Input border color.
*   `--uni-control-text-color` (Default: `#495057`): Input text color.
*   `--uni-control-focus-border-color` (Default: `#86b7fe`): Input border color when selected/active.
*   `--uni-control-padding-y` (Default: `0.25rem`): Vertical padding inside search fields.
*   `--uni-control-padding-x` (Default: `0.5rem`): Horizontal padding inside search fields.

#### 5. Buttons & Actions
*   `--uni-button-primary-bg` (Default: `#0d6efd`): Background color of primary actions.
*   `--uni-button-primary-color` (Default: `#fff`): Font color of primary actions.
*   `--uni-button-primary-border-color` (Default: `#0d6efd`): Border color of primary actions.
*   `--uni-button-secondary-bg` (Default: `#6c757d`): Background color of secondary actions.
*   `--uni-button-secondary-color` (Default: `#fff`): Font color of secondary actions.
*   `--uni-button-secondary-border-color` (Default: `#6c757d`): Border color of secondary actions.

#### 6. Pagination Controls
*   `--uni-pagination-color` (Default: `var(--uni-button-primary-bg)`): Active/hover state paging button color.
*   `--uni-pagination-hover-color` (Default: `#0b5ed7`): Hover background color for page numbers.
*   `--uni-pagination-active-bg` (Default: `var(--uni-button-primary-bg)`): Background color of the current page number.
*   `--uni-pagination-active-color` (Default: `#fff`): Text color of the current page number.
*   `--uni-pagination-disabled-color` (Default: `#6c757d`): Text/icon color of disabled paging buttons.
*   `--uni-pagination-padding-y` (Default: `0.375rem`): Vertical padding inside pagination items.
*   `--uni-pagination-padding-x` (Default: `0.75rem`): Horizontal padding inside pagination items.


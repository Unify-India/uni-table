# 🧪 Automated Test Suite Documentation

This document provides a comprehensive guide to the automated test suite implemented for Uni-Table. It outlines the purpose, testing scenarios, and expected outcomes for each unit test in the test suite.

---

## 📂 Core Component Operations

### 1. Component Instantiation
* **Test Case:** `should create`
* **Purpose:** Verifies that the `UniTableComponent` compiles and instantiates successfully within the Angular runtime environment.
* **Expected Findings:** The component instance is truthy, all signals are initialized, and no constructor errors are thrown.

### 2. Row Rendering
* **Test Case:** `should render the correct number of rows`
* **Purpose:** Confirms that the DOM rendering engine displays the correct number of `<tr>` rows matching the length of the data slice.
* **Expected Findings:** In default client-side mode with 6 mock rows, the table displays exactly 6 `<tr>` elements in the table body.

### 3. Column Headers Rendering
* **Test Case:** `should render the correct columns`
* **Purpose:** Verifies that header cells (`<th>`) are dynamically rendered corresponding to the columns array and display the correct title names.
* **Expected Findings:** Renders exactly 3 headers in the DOM containing the text strings: `"ID"`, `"Name"`, and `"Age"`.

---

## 🔍 Interactive Table Controls (Client-Side)

### 4. Global Search Filtering
* **Test Case:** `should filter data when searching`
* **Purpose:** Asserves the reactiveness of the search filtering by updating the in-memory array whenever a search term is inputted.
* **Expected Findings:** Querying `"John"` filters the visible dataset down to two rows containing matching letters (e.g., `"John Doe"` and `"Bob Johnson"`).

### 5. Interactive Column Sorting
* **Test Case:** `should sort data when clicking on header`
* **Purpose:** Verifies that clicking header columns alters sorting states (Ascending/Descending) and reorders the rows.
* **Expected Findings:** Clicking the `"Age"` header once sorts values in Ascending order (lowest age first). Clicking it a second time reverses the rows into Descending order (highest age first).

### 6. Data Pagination Slicing
* **Test Case:** `should paginate data correctly`
* **Purpose:** Asserves that setting `pageSize` and changing active page boundaries dynamically subsets the visible array rows.
* **Expected Findings:** Setting a `pageSize` of 2 splits 6 rows into 3 pages. Navigating to page 2 displays the second slice of data (rows 3 and 4) in the table body.

### 7. Column Visibility Toggling
* **Test Case:** `should toggle column visibility`
* **Purpose:** Verifies that excluding/toggling a column via `toggleColumnVisibility` dynamically hides the column cells from headers and data rows.
* **Expected Findings:** Hiding the `"Age"` column reduces the number of rendered header columns from 3 to 2, removing the header and cells matching the `"age"` key.

### 8. Row Details Expansion
* **Test Case:** `should toggle row expansion`
* **Purpose:** Validates that clicking responsive details toggles the index state in `expandedRows` to display detailed drawer rows.
* **Expected Findings:** Calling `toggleRowExpansion(0)` adds index `0` to the active set; calling it again removes it.

---

## 💾 Persistence & State Handshakes

### 9. State Storage & Recovery
* **Test Case:** `should save and restore state from localStorage`
* **Purpose:** Asserts that table filters/sort values persist to `localStorage` using the configured `storageKey` and reload correctly on initialization.
* **Expected Findings:** Setting a search term to `"Alice"` saves `{ searchTerm: 'Alice', ... }` to storage. On re-initialization, the table reads the storage key and restores `"Alice"` into the search filter input automatically.

### 10. State Change Emission (Server-Side)
* **Test Case:** `should emit stateChange in server-side mode`
* **Purpose:** Verifies that user controls (searching, pagination, sorting) emit state change payloads via the `stateChange` output when `serverSide: true` is active.
* **Expected Findings:** Typing `"test"` into the search field triggers the `stateChange.emit` emitter with a payload containing `{ searchTerm: 'test', pageSize: 10, ... }`.

---

## 🛡️ Edge Cases & Detailed Scenarios

### 11. Sorting with Empty / Null / Mixed Values
* **Test Case:** `should handle sorting with null, undefined, and mixed values safely`
* **Purpose:** Verifies comparative sorting logic robustness when evaluating columns with missing or non-matching types.
* **Expected Findings:** Rows with `null` or `undefined` ages sort safely to the end of the collection during an Ascending sort without causing runtime exceptions.

### 12. Corrupted State File Recovery
* **Test Case:** `should recover gracefully if storageKey is set but localStorage contains invalid JSON`
* **Purpose:** Tests exception/crash resilience during local storage initialization checks.
* **Expected Findings:** If `localStorage` contains a corrupt text entry (e.g. `invalid-json-{`), `ngOnInit` catches the SyntaxError, logs a warning, and initializes the table with default empty values without throwing a crash error.

### 13. Paging Boundary Enforcement
* **Test Case:** `should reject invalid page numbers on page change`
* **Purpose:** Asserts that input values for pages stay within `1 <= page <= totalPages` bounds.
* **Expected Findings:** Attempting to navigate to page `0` or page `10` (when max page count is 3) is ignored, preserving the current page selection.

### 14. Combined Styles Resolution
* **Test Case:** `should compute combined styles dynamically for headers and cells`
* **Purpose:** Verifies custom styling function evaluations inside `getCombinedStyle`.
* **Expected Findings:** A cell styling function evaluating `row.age > 30 ? 'red' : 'blue'` resolves to `'red'` for a row where age is 40, and `'blue'` for a row where age is 20, appending style widths correctly.

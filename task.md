Here is the implementation plan for the **Preference Persistence Module**. This covers both the silent auto-save functionality and the manual save/reset controls for handling external filters.

### **1. Configuration Updates**

We need to add flags to your `UniTableConfig` interface to control this behavior.

```typescript
// uni-table.config.ts

export interface UniTableConfig {
  // ... existing configs ...

  /**
   * PERSISTENCE SETTINGS
   */

  /**
   * Unique key for LocalStorage.
   * REQUIRED if you want any saving features.
   * Example: 'user_list_table_v1'
   */
  storageKey?: string;

  /**
   * If true, table automatically saves Sort, Page, and ColVis to LocalStorage
   * on every change (silently).
   * @default true
   */
  autoSaveState?: boolean;

  /**
   * If true, shows "Save View" and "Reset View" buttons in the toolbar.
   * Use this when you want to save EXTERNAL filters along with table state.
   * @default false
   */
  showSaveControls?: boolean;
}

```

---

### **2. Implementation Logic (Library Side)**

This logic goes inside your `UniTableComponent`.

#### **Part A: Auto-Save (The "Silent" Observer)**

We use an Angular 19 `effect()` to watch your signals and write to LocalStorage automatically.

```typescript
// uni-table.component.ts

// Inputs
config = input.required<UniTableConfig>();

// Internal State Signals
pageIndex = signal(0);
sortState = signal<SortState>({ field: '', direction: '' });
hiddenColumns = signal<Set<string>>(new Set());

constructor() {
  // 1. THE AUTO-SAVER
  effect(() => {
    const cfg = this.config();
    
    // Only run if AutoSave is NOT disabled and we have a Key
    if (cfg.autoSaveState !== false && cfg.storageKey) {
      
      // Create snapshot of internal state
      const state = {
        page: this.pageIndex(),
        sort: this.sortState(),
        hiddenCols: Array.from(this.hiddenColumns())
      };

      // Save silently
      localStorage.setItem(cfg.storageKey, JSON.stringify(state));
    }
  });
}

// 2. THE RESTORATION (On Init)
ngOnInit() {
  const cfg = this.config();
  if (cfg.storageKey) {
    const saved = localStorage.getItem(cfg.storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Restore Internal State
      this.pageIndex.set(parsed.page ?? 0);
      this.sortState.set(parsed.sort ?? { field: '', direction: '' });
      if (parsed.hiddenCols) {
        this.hiddenColumns.set(new Set(parsed.hiddenCols));
      }

      // If we found external filters (from a Manual Save), emit them back to parent!
      if (parsed.externalFilters) {
        this.stateRestored.emit(parsed.externalFilters);
      }
    }
  }
}

```

---

#### **Part B: Manual Save Controls (The "Gateway")**

These controls are displayed only when `showSaveControls: true`. They handle the "External Filter" snapshot.

**New Input/Output:**

```typescript
// Input: Parent passes current filter object here (e.g., { status: 'Active' })
externalState = input<any>(null); 

// Output: We emit this when loading from storage or resetting
stateRestored = output<any>(); 

```

**The Template (Inside Toolbar):**

```html
<div *ngIf="config().showSaveControls" class="uni-table-controls">
  
  <button (click)="manualSave()" class="btn-save" title="Save View">
    <i class="icon-save"></i>
  </button>

  <button (click)="resetView()" class="btn-reset" title="Reset View">
    <i class="icon-refresh"></i>
  </button>

</div>

```

**The Logic:**

```typescript
manualSave() {
  const cfg = this.config();
  if (!cfg.storageKey) return;

  const fullSnapshot = {
    // 1. Capture Internal State
    page: this.pageIndex(),
    sort: this.sortState(),
    hiddenCols: Array.from(this.hiddenColumns()),
    
    // 2. Capture External Filter State (The Gateway)
    externalFilters: this.externalState() 
  };

  localStorage.setItem(cfg.storageKey, JSON.stringify(fullSnapshot));
  // Optional: Show "View Saved" toast
}

resetView() {
  const cfg = this.config();
  if (cfg.storageKey) {
    localStorage.removeItem(cfg.storageKey);
  }

  // 1. Reset Internal State to Defaults
  this.pageIndex.set(0);
  this.sortState.set({ field: '', direction: '' });
  this.hiddenColumns.set(new Set());
  
  // 2. Tell Parent to Reset External Filters
  this.stateRestored.emit(null); 
  
  // 3. Trigger Data Refresh
  this.refreshData();
}

```

---

### **3. User Experience (How to use it)**

#### **Scenario A: Simple Auto-Save (Default)**

*User just wants page/sort to be remembered.*

```typescript
config = {
  storageKey: 'users_v1',
  autoSaveState: true,
  showSaveControls: false // No buttons needed
};

```

#### **Scenario B: Saving External Filters**

*User has a sidebar with complex filters and wants to save/restore them.*

**Parent Component TS:**

```typescript
config = {
  storageKey: 'users_complex_v1',
  showSaveControls: true // Show buttons
};

filters = signal({ status: 'active' });

// When table emits restored data (on load) or null (on reset)
restoreFilters(savedFilters: any) {
  if (savedFilters) {
    this.filterForm.patchValue(savedFilters);
  } else {
    this.filterForm.reset(); // Handle Reset
  }
}

```

**Parent HTML:**

```html
<uni-table 
   [config]="config" 
   [externalState]="filters()" 
   (stateRestored)="restoreFilters($event)">
</uni-table>

```
This is the **"Gateway Pattern"** I detailed in Part B.

To be absolutely clear: **The Table does not need to know what the filters are.** It just acts as a secure "Vault" that holds the data and gives it back when the page loads.

Here is the exact flow of how the Table **reads, saves, and emits back** the user's filter preference.

### The "Handshake" Workflow

#### 1. The Saving Flow (Input)

* **User Action:** User selects "City: New York" in their external component.
* **User Code:** They pass this object `{ city: 'NY' }` into your table's `[externalState]` input.
* **Save Trigger:** When the user clicks the "Save View" button (inside the table), the Table takes a snapshot:
* *Internal:* Page 1, Sort Desc.
* *External:* `{ city: 'NY' }` (It grabbed this from the input).


* **Action:** Table writes this combined JSON to LocalStorage.

#### 2. The Restoration Flow (Emit Back)

* **Page Load:** User refreshes the browser.
* **Table Init:** The Table reads LocalStorage.
* **Internal Restore:** It sets itself to Page 1, Sort Desc.
* **External Restore (The Critical Part):**
* The Table sees the `{ city: 'NY' }` data in the JSON.
* It **EMITS** this object via the `(stateRestored)` output event.


* **User Code:** The Parent component listens to `(stateRestored)`. It receives `{ city: 'NY' }` and immediately updates the "City" dropdown to "New York".

### The Code Implementation (Simplified)

**1. Library Side (`uni-table.component.ts`)**

```typescript
// INPUT: The Gateway for INCOMING filters
externalState = input<any>(null); 

// OUTPUT: The Gateway for OUTGOING (restored) filters
stateRestored = output<any>(); 

ngOnInit() {
  const savedJson = localStorage.getItem(this.config().storageKey);
  if (savedJson) {
    const data = JSON.parse(savedJson);
    
    // 1. Restore Table's own state internally
    this.pageIndex.set(data.page);

    // 2. EMIT BACK the external filters to the user
    if (data.externalFilters) {
      this.stateRestored.emit(data.externalFilters);
    }
  }
}

```

**2. User Side (`user-list.component.html`)**

```html
<app-filter [form]="filterForm"></app-filter>

<uni-table 
    [externalState]="filterForm.value" 
    (stateRestored)="filterForm.patchValue($event)">
    </uni-table>

```

### Why this is the correct approach

1. **Zero Coupling:** Your table doesn't know if the filter is a Date Range, a Dropdown, or a Search string. It just saves the `JSON` object.
2. **Timing Safe:** Because the table emits `(stateRestored)` inside `ngOnInit`, the Parent component receives the data immediately on load, ensuring the UI is synced before the user even sees the page.
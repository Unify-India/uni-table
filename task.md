Here is the consolidated feature list for your `uni-table` library, refined into concise 1-2 line statements suitable for your README or internal documentation.

### **`uni-table` Feature Highlights**

* **Signal-First Architecture:**
Leverages Angular 19 `signal` inputs and `computed()` properties for sorting, pagination, and filtering, ensuring optimal `OnPush` performance and instant UI updates.
* **Reactive Column Visibility (ColVis):**
Implements column toggling via reactive signals rather than array mutation, allowing for instant, flicker-free showing and hiding of columns without re-rendering the entire table.
* **Hybrid Responsiveness (Smart Collapse):**
Utilizes `ResizeObserver` to automatically detect container width and move overflowing columns into an expandable "child row" (accordion style), eliminating horizontal scrolling on mobile.
* **Config-Driven Template Injection:**
Enables users to map custom UI templates (like action buttons) to columns using simple string IDs in the JSON config, keeping the table logic completely decoupled from user component logic.
* **Decoupled Translation Support:**
Includes a built-in, config-toggleable translation pipe (via `InjectionToken`) that handles header localization without requiring complex external dependencies or class overrides.
* **Modern CSS Variable Theming:**
Exposes a full suite of CSS Custom Properties (e.g., `--uni-header-bg`) for effortless theming that pierces Shadow DOM boundaries without using `::ng-deep`.
* **Encapsulation-Free Customization:**
Uses `ViewEncapsulation.None` with strict BEM-style naming (e.g., `.uni-table__row`) to allow users to easily override default styles using standard CSS classes.
* **Dynamic Class Injection:**
Supports conditional styling by allowing users to inject custom class names for specific headers or cells directly via the column configuration (e.g., `{ cellClass: 'status-error' }`).
Our final decision was to use the **"Soft Coupling" Strategy** combined with a **Signal-Based Component**.

This approach assumes your organization uses `ngx-translate` (standard), but builds the library so it doesn't *crash* if the translation service is missing. It shifts the complexity **away from the user**—they just pass a key, and the library handles the reactivity.

Here is the implementation blueprint.

### 1. The Strategy: "Soft Coupling"

* **Dependency:** Your library does **not** bundle `ngx-translate`. It lists it as a `peerDependency`.
* **Mechanism:** We create a smart component (`UniLabelComponent`) that attempts to inject `TranslateService`.
* **If found:** It subscribes to language changes and updates text instantly.
* **If missing:** It falls back to showing the raw key (safe failure).



---

### 2. The Implementation (Your Code)

#### Step A: Update `package.json` (Library Side)

Do not install it as a dependency. Use Peer Dependencies.

```json
"peerDependencies": {
  "@angular/common": "^19.0.0",
  "@angular/core": "^19.0.0",
  "@ngx-translate/core": "^15.0.0" // or whatever version you use
}

```

#### Step B: The `UniLabelComponent` (The Engine)

Create this component inside your library. This is what you will use inside your `<th>` tags.

```typescript
import { Component, input, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'uni-label',
  standalone: true,
  imports: [CommonModule],
  // The template is just the text. No wrappers needed.
  template: `{{ displayText() }}` 
})
export class UniLabelComponent {
  // 1. The Key passed from config (e.g., 'USER.NAME')
  key = input.required<string>();

  // 2. Soft Injection: Try to get the service, but don't crash if missing
  private translate = inject(TranslateService, { optional: true });

  // 3. Create a Signal for the Language Change Event
  // If service exists, we turn the Observable stream into a Signal
  // If service is missing, we create a dummy signal that never changes
  private langChange = this.translate 
    ? toSignal(this.translate.onLangChange) 
    : signal(null);

  // 4. The Reactive Logic
  displayText = computed(() => {
    const k = this.key();
    
    // Register dependency on the language signal so this re-runs when lang changes
    this.langChange(); 

    // If Service exists, return translated string (Instant/Synchronous)
    if (this.translate) {
      return this.translate.instant(k);
    }

    // Fallback: Just show the key
    return k;
  });
}

```

#### Step C: Use it in `UniTableComponent` (The Table)

Update your table's header template to use this component instead of `{{ col.label }}`.

```html
<thead>
  <tr>
    <th *ngFor="let col of columns()">
      
      <div class="uni-header__container">
        
        <uni-label 
           [key]="col.headerLabel" 
           class="uni-header__label"
           [class.uni-header__label--wrap]="col.headerWrap">
        </uni-label>

        <div class="uni-header__icon">...</div>

      </div>

    </th>
  </tr>
</thead>

```

---

### 3. The User Experience (User Side)

The user does **zero** setup for this. They just write the config string.

**user-list.component.ts**

```typescript
columns = [
  // User just passes the Key. No pipes, no services.
  { field: 'firstName', headerLabel: 'LBL_FIRST_NAME' }, 
  { field: 'status', headerLabel: 'LBL_STATUS' }
];

```

**app.config.ts (User's Global Setup)**
The user just sets up `ngx-translate` as they normally would in any Angular app.

```typescript
providers: [
  importProvidersFrom(TranslateModule.forRoot(...))
]

```

---

### 4. Why this is the "Final Take"

1. **Reactivity:** Because we used `toSignal(onLangChange)` inside `computed`, the text updates the *millisecond* the language changes, without reloading the table or the page.
2. **Safety:** If a team uses your library in a project *without* `ngx-translate`, the table still works (it just shows "LBL_FIRST_NAME").
3. **Performance:** Angular's Change Detection only updates the text node inside `<uni-label>`. It does not re-render the `<th>` or the `<tr>`.
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

---


## Column header config
This is a great set of constraints. Let's break down the solutions for the header wrapping, the "Why Emit?" debate for state management, and the Server-Side Rendering (SSR) API integration.

### 1. Header Text: Ellipsis (`...`) vs. Word Wrap

You are right—some organizations (especially in Government or Legal sectors) strictly forbid truncating text. They want to see the full header even if it makes the row taller.

**The Solution:** A `headerWrap` flag in the Column Config.

* **Default:** `false` (Ellipsis + Single Line).
* **Flag:** `true` (Word Wrap + Multi-line).

**How it works (CSS):**
We apply a modifier class based on the flag. The "Flexbox Shell" logic remains, but the rules change for the label part.

```css
/* Default (Ellipsis) */
.uni-header__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Modifier (Wrap) */
.uni-header__label--wrap {
  white-space: normal; /* Allow wrapping */
  overflow: visible;
  line-height: 1.2;    /* Tighter line height for multi-line */
  padding-right: 4px;  /* Ensure text doesn't touch the icon */
}

```

**Config Usage:**

```typescript
{ 
  field: 'description', 
  headerLabel: 'LBL_VERY_LONG_DESCRIPTION', 
  headerWrap: true // User forces wrap for this specific column
}

```

*Note: The sorting icon will still stay vertically centered or aligned to the top (using `align-items: flex-start`) depending on your design preference.*

---

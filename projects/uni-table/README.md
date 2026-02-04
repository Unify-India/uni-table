# Uni-Table: High-Performance Angular Data Table with Signals

[![npm version](https://img.shields.io/npm/v/@unify-india/uni-table.svg)](https://www.npmjs.com/package/@unify-india/uni-table)
[![npm downloads](https://img.shields.io/npm/dm/@unify-india/uni-table.svg)](https://www.npmjs.com/package/@unify-india/uni-table)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

**Uni-Table** is a next-generation data grid for Angular, re-engineered with **Signals** to deliver zero-lag performance. It combines enterprise-grade features—like server-side processing and complex filtering—with a developer-friendly configuration API, making it the ideal choice for building responsive, data-heavy applications.

---

**[✨ Explore the Interactive Demo on StackBlitz](https://stackblitz.com/edit/uni-table)**

---

![Uni-Table Client-Side Data Grid with Pagination and Search](https://github.com/Unify-India/uni-table/blob/master/projects/uni-table-demo/docs/images/client-side-table.png)
![Uni-Table Server-Side Data Grid](https://github.com/Unify-India/uni-table/blob/master/projects/uni-table-demo/docs/images/server-side-table.png)

### 🎨 Visual Tour: Features in Action

What you see in the screenshots above isn't just a static table—it's a high-performance data engine in action:

1.  **Dynamic Header Controls:** Take full command of your table's toolbar. Seamlessly toggle features like **Export**, **Global Search**, and **Column Visibility (`colVis`)**. You can even enable a **Context Menu** for quick client-side actions (available in client-side mode).
2.  **Smart Conditional Highlighting:** Visualize your data's meaning at a glance. Easily apply conditional styling—like the orange cell highlights shown—to draw attention to critical values or specific data states without complex CSS hacks.
3.  **Rich Custom Templates:** Go beyond simple text. Inject custom `ng-template`s to render interactive **Action columns**, formatted **Pricing**, status badges, or even complex nested components.

## 📦 Installation

To install the library, run:

```bash
npm install @unify-india/uni-table
```

Since `UniTableComponent` is a standalone component, import it directly into your component's `imports` array:

```typescript
import { UniTableComponent } from '@unify-india/uni-table';

@Component({
  // ...
  imports: [UniTableComponent],
})
export class YourComponent {}
```

## 📊 Version Compatibility

> **Note:** The current version (`0.1.1`) is considered a **beta release**. Once we receive sufficient feedback and confirmation from our users, we will transition to a versioning scheme that aligns directly with Angular's major and minor versions (e.g., `@unify-india/uni-table` version `19.2.x` will target Angular `19.2.x`).

| Angular Version | Uni-Table Version |
| :--- | :--- |
| **Angular 19+** | `0.1.1` (Beta) |
| **Angular 20** | *Coming Soon* |
| **Angular 21** | *Coming Soon* |

## ✨ Key Features

Uni-Table isn't just another data grid; it's a complete toolkit for building data-rich interfaces that your users will love.

*   **🚀 Signal-First Architecture: Speed by Design**
    Built entirely on Angular Signals, Uni-Table delivers ultra-fast, fine-grained reactivity. Sorting, paging, and filtering happen instantly.

*   **🎨 Your Pagination, Your Rules**
    Fully customizable pagination controls (text, icons, or both) and flexible navigation options (First/Last, Prev/Next).

*   **📱 Advanced Responsiveness**
    Smart collapse functionality moves overflow columns into an expandable "details view," with priority controls to keep critical data visible.

*   **👁️ Reactive Column Visibility**
    Built-in `colVis` menu lets users instantly toggle columns on or off without re-rendering the DOM.

*   **💾 Intelligent State Persistence**
    Automatically saves page, sort order, search terms, and column visibility to local storage so users never lose their context.

*   **🌐 Universal Data Handling (Client & Server)**
    Seamlessly handles local arrays or server-side data (via `stateChange` output).

*   **🔧 Pixel-Perfect Column Control**
    Precise width controls, custom `ng-template` support for cells, and dynamic styling.

*   **🔍 Powerful Search**
    Global text search out-of-the-box, plus a `manualSearch` API for external control.

## 🎨 Effortless Styling with CSS Variables

Customize the entire table design without `::ng-deep` by overriding CSS variables:

```css
uni-table {
  --uni-primary-color: #6366f1;
  --uni-bg: #ffffff;
  --uni-table-striped-bg: #f8fafc;
  --uni-border-radius: 12px;
}
```

## 🚀 Quick Start

```typescript
import { Component } from '@angular/core';
import { UniDataConfig, UniTableConfig } from '@unify-india/uni-table';

@Component({
  selector: 'app-root',
  template: `
    <uni-table [config]="tableConfig" [dataConfig]="dataConfig"></uni-table>
  `
})
export class AppComponent {
  tableConfig: UniTableConfig = {
    paging: true,
    searching: true,
    colVis: true,
    autoSaveState: true,
    storageKey: 'my-users-table'
  };

  dataConfig: UniDataConfig = {
    columns: [
      { key: 'id', title: 'ID', width: '50px' },
      { key: 'name', title: 'Name', priority: 1 },
      { key: 'email', title: 'Email' },
    ],
    data: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ],
  };
}
```

## 📖 API Reference

### Component Inputs

| Name         | Type            | Description                                                                                                                                                                                          |
| :----------- | :-------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config`     | `UniTableConfig`| **(Primary)** Configuration object for table features (paging, sorting, state saving, etc.).                                                                                                         |
| `dtOptions`  | `UniDtOptions`  | *(Legacy/Alias)* Alternative input for table options. Merged with `config`.                                                                                                                        |
| `dataConfig` | `UniDataConfig` | **(Required)** Defines columns (`key`, `title`, `width`, `template`, etc.) and the data array to be displayed.                                                                                      |

### Component Outputs

| Name          | Type                           | Description                                                                                              |
| :------------ | :----------------------------- | :------------------------------------------------------------------------------------------------------- |
| `stateChange` | `EventEmitter<UniTableState>` | Emits whenever the table state changes (page, sort, search). Critical for **Server-Side** implementations to fetch new data. |

## 🤝 Contributing & Feedback

We want to make this the best data table for Angular!

*   **Issues:** Found a bug? [Open an Issue](https://github.com/Unify-India/uni-table/issues).
*   **PRs:** Check out our [Contributing Guidelines](../../CONTRIBUTING.md).

**Need Urgent Support?** Reach out to me directly on **[LinkedIn](https://www.linkedin.com/in/iam5k/)**.

💡 **Looking for a Better Way?** If you are facing performance issues or hitting limitations with other packages, reach out to me (**[IAM5K](https://www.linkedin.com/in/iam5k/)**). I'd be happy to discuss if Uni-Table is the right fit!

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
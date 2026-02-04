# Uni-Table

[![npm version](https://img.shields.io/npm/v/@unify-india/uni-table.svg)](https://www.npmjs.com/package/@unify-india/uni-table)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Uni-Table** is a powerful, modern, and highly configurable data table for Angular, built from the ground up with **Signals** for peak performance and reactivity. It is designed to be a flexible, feature-rich, and developer-friendly solution for displaying tabular data in enterprise applications.

---

**[➡️ View Live Demo](https://stackblitz.com/edit/uni-table)**

---

![uni-table screenshot](https://github.com/Unify-India/uni-table/blob/master/projects/uni-table-demo/docs/images/client-side-table.png)
![uni-table screenshot](https://github.com/Unify-India/uni-table/blob/master/projects/uni-table-demo/docs/images/server-side-table.png)

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

| Angular Version | Uni-Table Version |
| :--- | :--- |
| **Angular 19+** | `0.1.1` |
| **Angular 20** | *Coming Soon* |
| **Angular 21** | *Coming Soon* |

## ✨ Key Features

Uni-Table comes packed with features to handle complex data grids with ease.

*   **🚀 Signal-First Architecture**
    Built entirely using Angular Signals to ensure ultra-fast, fine-grained reactivity. This means UI updates for sorting, pagination, and filtering happen instantly without unnecessary change detection cycles, resulting in a glitch-free user experience.

*   **📱 Advanced Responsiveness**
    Handling wide tables on small screens is effortless. The table automatically detects when columns don't fit and moves them into an expandable child row ("details view"). You can control which columns stay visible using the `priority` property in your column config.

*   **👁️ Reactive Column Visibility (`colVis`)**
    Empower your users to control their view. The built-in Column Visibility menu allows users to toggle columns on or off instantly. This is handled reactively without re-rendering the entire table DOM.

*   **💾 Smart State Persistence**
    Don't lose context on reload. Uni-Table can automatically save the user's state (current page, page size, sort order, search term, and hidden columns) to local storage. Configure `storageKey` and `autoSaveState` to enable this seamless experience.

*   **🌐 Universal Data Handling (Client & Server)**
    Whether you have a simple local array or a massive dataset on the server, Uni-Table handles it.
    *   **Client-Side:** Pass the data array, and the table handles sorting, searching, and paging automatically.
    *   **Server-Side:** Set `serverSide: true` and hook into the `stateChange` output to fetch data dynamically based on the current table state.

*   **🎨 Deep Customization**
    *   **Templates:** Use `ng-template` to render custom content for any cell (images, buttons, status badges).
    *   **Styling:** Configurable classes for headers and cells.
    *   **Pagination:** Customize text, icons, and layout of pagination controls.

*   **🔍 Powerful Searching & Filtering**
    Includes a built-in global search box that filters across all searchable columns. For more control, `manualSearch` allows you to trigger searches programmatically or via external inputs.

## 🚀 Quick Start

Define your options and data configuration:

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
      { key: 'name', title: 'Name', priority: 1 }, // High priority: stays visible longer
      { key: 'email', title: 'Email' },
    ],
    data: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ],
  };
}
```

## 📖 Detailed Documentation

This README provides a high-level overview. For a comprehensive guide on implementation, API references, interface definitions, and advanced configuration options, please consult the:

👉 **[Internal Implementation Guide](https://github.com/Unify-India/uni-table/blob/master/projects/uni-table/README.md)**

## 🤝 Contributing & Feedback

We want to make this the best data table for Angular!

*   **Try it out:** Install it in your project and let us know what you think.
*   **Found a bug?** Please [Open an Issue](https://github.com/Unify-India/uni-table/issues).
*   **Have a feature request?** We'd love to hear your ideas.
*   **Want to contribute?** PRs are welcome! Check out our [Contributing Guidelines](CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

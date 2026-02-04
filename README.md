# Uni-Table

[![npm version](https://img.shields.io/npm/v/@unify-india/uni-table.svg)](https://www.npmjs.com/package/@unify-india/uni-table)
[![npm downloads](https://img.shields.io/npm/dm/@unify-india/uni-table.svg)](https://www.npmjs.com/package/@unify-india/uni-table)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Uni-Table** is a powerful, modern, and highly configurable data table for Angular, built from the ground up with **Signals** for peak performance and reactivity. It is designed to be a flexible, feature-rich, and developer-friendly solution for displaying tabular data in enterprise applications.

---

**[➡️ View Live Demo](https://stackblitz.com/edit/uni-table)**

---

![uni-table screenshot](https://github.com/Unify-India/uni-table/blob/master/projects/uni-table-demo/docs/images/client-side-table.png)
![uni-table screenshot](https://github.com/Unify-India/uni-table/blob/master/projects/uni-table-demo/docs/images/server-side-table.png)

### 🎨 Visual Tour: Features in Action

What you see in the screenshots above isn't just a static table—it's a high-performance data engine in action:

1.  **Dynamic Header Controls:** Take full command of your table's toolbar. Seamlessly toggle features like **Export**, **Global Search**, and **Column Visibility (`colVis`)**. You can even enable a **Context Menu** for quick client-side actions (can be seen in client-side mode).
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
| :-------------- | :---------------- |
| **Angular 19+** | `0.1.1` (Beta)    |
| **Angular 20**  | *Coming Soon*     |
| **Angular 21**  | *Coming Soon*     |

## ✨ Key Features

Uni-Table isn't just another data grid; it's a complete toolkit for building data-rich interfaces that your users will love.

*   **🚀 Signal-First Architecture: Speed by Design**
    Forget about sluggish UI updates. Built entirely on Angular Signals, Uni-Table delivers ultra-fast, fine-grained reactivity. Sorting, paging, and filtering happen instantly, ensuring a buttery-smooth 60fps experience even with complex data interactions.

*   **🎨 Your Pagination, Your Rules**
    Why settle for generic controls?
    *   **Fully Customizable:** Choose between text labels ("Previous", "Next"), intuitive icons, or both.
    *   **Flexible Navigation:** Decide exactly which controls to show—First/Last, Previous/Next—tailoring the experience to your design system.

*   **📱 Advanced Responsiveness: Mobile-Ready Instantly**
    Don't let wide tables break your mobile layout.
    *   **Smart Collapse:** Columns that don't fit are automatically tucked away into an expandable "details view."
    *   **Priority Control:** You decide what matters most. Use the `priority` setting to ensure critical columns stay visible on smaller screens while secondary data gracefully yields space.

*   **👁️ Reactive Column Visibility: User-Centric Control**
    Empower your users to curate their own view. The built-in, reactive `colVis` menu lets users instantly toggle columns on or off. No page reloads, no heavy DOM re-rendering—just instant personalization.

*   **💾 Intelligent State Persistence**
    Users hate losing their place. With `autoSaveState`, Uni-Table remembers everything:
    *   Current page & page size
    *   Sort order & direction
    *   Search terms
    *   Hidden/Visible columns
    *   *Result:* Users pick up exactly where they left off, every time.

*   **🌐 Universal Data Handling: Client or Server? Yes.**
    *   **Client-Side Agility:** Pass a local array, and let Uni-Table handle the heavy lifting—sorting, searching, and pagination are automatic.
    *   **Server-Side Power:** dealing with millions of records? Flip the `serverSide` switch. Hook into the `stateChange` event to fetch exactly what you need, when you need it.

*   **🔧 Pixel-Perfect Column Control**
    *   **Precise Layouts:** Define exact `width` and `minWidth` to ensure your data breathes.
    *   **Rich Content:** Inject custom `ng-template`s for any cell. Render status badges, action buttons, user avatars, or complex components with ease.
    *   **Styling Freedom:** Apply custom classes and styles to headers and cells dynamically based on data.

*   **🔍 Powerful, Flexible Search**
    *   **Global Search:** Out-of-the-box text search that filters across all your columns.
    *   **Manual Control:** Need to trigger search from an external input or clear it programmatically? The `manualSearch` API puts you in the driver's seat.

## 🎨 Effortless Styling with CSS Variables

Say goodbye to `::ng-deep` and complex CSS selectors. Uni-Table is built with a modern **variable-based styling mechanism**. You can directly update the design of the entire table by simply overriding CSS variables in your component's CSS or global styles.

```css
/* Customize your table globally or per component */
uni-table {
  --uni-primary-color: #6366f1;
  --uni-bg: #ffffff;
  --uni-table-striped-bg: #f8fafc;
  --uni-border-radius: 12px;
  --uni-font-family: 'Inter', sans-serif;
  --uni-table-head-bg: #f1f5f9;
}
```

This approach gives you complete control over the look and feel while keeping your stylesheets clean and maintainable.

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

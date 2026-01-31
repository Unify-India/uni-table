# Uni-Table

[![npm version](https://img.shields.io/npm/v/uni-table.svg)](https://www.npmjs.com/package/@unify-india/uni-table)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Uni-Table** is a powerful, modern, and highly configurable data table for Angular, built from the ground up with Signals for peak performance and reactivity. It's designed to be a flexible and feature-rich solution for displaying tabular data.

---

**[➡️ View Live Demo](https://YOUR_DEMO_URL_HERE)**

---

![uni-table screenshot](https://YOUR_SCREENSHOT_URL_HERE)

## Key Features

*   🚀 **Signal-First Architecture:** Built with Angular Signals for ultra-fast, glitch-free UI updates for sorting, pagination, and filtering.
*   📱 **Advanced Responsiveness:** Automatically hides columns that don't fit and moves them into an expandable child row, preventing horizontal scrollbars on smaller screens.
*   👁️ **Reactive Column Visibility:** Instantly show or hide columns with a built-in menu, without re-rendering the entire table.
*   🔧 **Configuration-Driven:** Define columns, behavior, and custom templates through simple JSON configuration.
*   🎨 **Easy Customization:** Inject custom templates for cells and headers, and control pagination UI elements with simple options.
*   🌐 **Client & Server-Side Data:** Works seamlessly with both local data arrays and remote APIs for pagination, sorting, and searching.

## Installation

```bash
npm install uni-table
```

Since `UniTableComponent` is a standalone component, import it directly into your component's `imports` array:

```typescript
// your.component.ts
import { UniTableComponent } from 'uni-table';

@Component({
  // ...
  imports: [CommonModule, UniTableComponent],
})
export class YourComponent {}
```

## Basic Usage

Provide a configuration object and your data to the component.

```html
<!-- your.component.html -->
<uni-table [dtOptions]="dtOptions" [dataConfig]="dataConfig">
</uni-table>
```

```typescript
// your.component.ts
import { Component } from '@angular/core';
import { UniDataConfig, UniDtOptions } from 'uni-table';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  dtOptions: UniDtOptions = {
    paging: true,
    searching: true,
    colVis: true,
  };

  dataConfig: UniDataConfig = {
    columns: [
      { key: 'id', title: 'ID' },
      { key: 'name', title: 'Name' },
      { key: 'email', title: 'Email' },
    ],
    data: [
      { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
    ],
  };
}
```

## API Reference

_(For detailed interface definitions, please see `uni-table.interface.ts`)_

### Component Inputs

| Name         | Type            | Description                                                                                                                                                                                          |
| :----------- | :-------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dtOptions`  | `UniDtOptions`  | An object containing options to configure the table's features, such as pagination, searching, and state saving. See the `UniDtOptions` interface for more details.                                |
| `dataConfig` | `UniDataConfig` | An object that defines the table's columns and provides the data to be displayed. It can also include custom toolbar actions. See the `UniDataConfig` interface for more details. |

### Component Outputs

| Name          | Type                           | Description                                                                                              |
| :------------ | :----------------------------- | :------------------------------------------------------------------------------------------------------- |
| `stateChange` | `EventEmitter<UniTableState>` | Emits an event whenever the table's state changes (e.g., pagination, sorting, searching). The emitted event contains the current state of the table. |

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
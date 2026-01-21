# UniWorkspace

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.19.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

---

## Uni-Table Library

`uni-table` is a feature-rich, reusable Angular data table library designed to be a blend of DataTables.net and Material Design principles. It provides a flexible and powerful way to display tabular data.

### Features

-   **Configurable UI:** Toggle features like pagination, global search, and column visibility to fit your needs.
-   **Data Sources:** Works with both client-side (local) and server-side (remote) data.
-   **Pagination:** Full pagination support, including controls for page navigation and customizable page size.
-   **Sorting:** Sort data by any column in either ascending or descending order.
-   **Filtering:** Provides a global search input to filter data across all searchable columns.
-   **Column Management:**
    -   **Visibility:** Users can interactively show and hide columns.
    -   **Responsiveness:** Define column priorities to automatically hide less important columns on smaller screens. Hidden data is accessible through an expandable details row.
    -   **Reordering:** End-users can reorder columns using drag-and-drop.
-   **State Persistence:** Automatically saves the table's state (including sorting, pagination, and column visibility) to local storage and restores it on reload.
-   **Customization:**
    -   **Cell Templates:** Use `ng-template` to provide completely custom layouts for individual cells.
    -   **Toolbar Actions:** Add custom buttons and actions, such as "Export" or "Add New", to the table's header.
-   **Styling:** Built on Bootstrap 5 for a modern, responsive design that is easy to customize and theme.

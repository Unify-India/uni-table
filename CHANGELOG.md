# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [22.0.0] - 2026-08-23

### Added
- Generic type-safety constraints (`T extends object`) on `UniColumn` and `UniDataConfig` to eliminate `any` types.
- Detailed unit test scenarios covering null-sorting, corrupt localStorage state recovery, page limits, and dynamic styles.
- Comprehensive `docs/tests.md` documenting automated test specifications and expected findings.
- Developer-friendly `projects/uni-table/IMPLEMENTATION_GUIDE.md` detailing parameter mapping and client vs. server setup.

### Performance
- Integrated Angular Deferrable Views (`@defer`) to lazy-load `UniSearchComponent` and `UniLabelComponent` (with placeholder fallback to prevent layout shifts).

### Changed
- Bumped package version and updated peer dependencies to support **Angular 22** (`^22.0.0`).

### Security
- Wrapped local storage state parser (`JSON.parse`) in a `try-catch` block to handle corrupted/invalid state data gracefully.

## [0.1.1] - 2026-02-04

### Added

- Initial release of **Uni-Table** library.
- Signal-based architecture for high performance.
- Advanced responsiveness with expandable details row.
- Reactive column visibility.
- Configuration-driven setup.
- Support for both Client-side and Server-side data.

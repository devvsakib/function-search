# Function Search

> Search exported functions and components across your entire workspace — instantly. No more guessing file names or manually digging through folders.

---

## Features

- Search exported functions and components across your entire workspace
- Fast fuzzy search — type partial names like `card`, `sup`, `btn`
- Shows file path and line number for each result
- Jump directly to the function definition in one click
- Ignores non-function exports (variables, plain objects, type aliases)

### Supported export patterns

```js
export function Component() {}
export const Component = () => {};
export default function Component() {}
export const Component = function () {};
```

---

## Installation

### From VSIX

1. Open VS Code
2. Go to the Extensions panel (`Ctrl+Shift+X`)
3. Click `...` → **Install from VSIX**
4. Select your `.vsix` file and confirm

---

## Usage

1. Open your project in VS Code
2. Open the Command Palette:
    - Windows/Linux: `Ctrl+Shift+P`
    - Mac: `Cmd+Shift+P`
3. Type `Search Function` and press Enter
4. Start typing a partial name — e.g. `support`, `card`, `btn`
5. Select a result to jump directly to the function in its file

### Example

Given a codebase with:

```js
export const SupportCard = () => {};
export function UserProfile() {}
export default function Navbar() {}
```

You can find them by typing `support`, `user`, or `nav`.

---

## How It Works

1. **Scan** — Recursively scans all `.js`, `.jsx`, `.ts`, `.tsx` files in your workspace, skipping `node_modules`
2. **Detect** — Uses regex pattern matching to identify exported function declarations and expressions
3. **Match** — Applies fuzzy search against your query and returns ranked results with file paths and line numbers

---

## Known Limitations

- Only detects **exported** functions — unexported ones are not indexed
- Regex-based parsing — complex or dynamic export patterns may be missed (AST support is planned)

---

## Upcoming Features

- Sidebar tree view for browsing functions by file
- Cached indexing for significantly faster results on large workspaces
- Improved result ranking (similar to native VS Code search)
- User-configurable settings for UI mode and file filters
- AST-based parsing for more accurate and complete detection

---

## Repository

[github.com/devvsakib/function-search](https://github.com/devvsakib/function-search)

---

## Author

**Sakib Ahmed**

## License

MIT

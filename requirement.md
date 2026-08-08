Implemented requirements and notes

- **Float list:** reworked into a reusable floating menu injected by the content script.
- **Save on click:** clicking a list item saves the current page as a Chrome bookmark under the Bookmarks Bar → `FloatBookmark` → `<button title>`.
- **Background worker:** bookmark creation is performed in `background.js` using the `bookmarks` permission; the worker searches for the Bookmarks Bar folder and falls back to a top-level folder.
- **All sites:** content script injects on all pages via `content_scripts` matching `"<all_urls>"` in `manifest.json`.
- **Menu config:** list items are now loaded from `menu_items.json` (editable JSON). The content script fetches this file (with a fallback list) and `menu_items.json` is exposed via `web_accessible_resources`.
- **Draggable:** header lets you drag the entire box; position is saved.
- **Position saving (relative):** position is stored as distance from window right (`floatBookmarkRight`) and top (`floatBookmarkTop`) and restored relative to the top-right corner.
- **Restore on viewport change:** the script listens for `resize` / `orientationchange` / `visualViewport.resize` and re-applies/clamps the saved top/right to keep the box visible.
- **Resizable:** the box is resizable (CSS `resize: both`); the internal menu flexes to fill the container so more items are visible when taller.
- **Initial size:** current code sets initial height to `800px` (changeable in `content.js`).
- **Button sizing:** each button's `min-height` is set dynamically to `(font-size + 2px)` so text fits; labels wrap when necessary.
- **Collapse header:** clicking the header collapses/expands the entire box (saves/restores height), not just the scroll area.
- **Scroll behavior:** when the box is resized, a `ResizeObserver` scrolls the list to top.

Files changed
- `d/ myExtensions/FloatBookmark/content.js` — float UI, drag/resize, position save/restore, collapse, load `menu_items.json`, scroll-on-resize.
- `d/ myExtensions/FloatBookmark/background.js` — bookmark bar lookup/creation and bookmark creation.
- `d/ myExtensions/FloatBookmark/manifest.json` — added `bookmarks` permission, `web_accessible_resources` for `menu_items.json`, and background service worker.
- `d/ myExtensions/FloatBookmark/menu_items.json` — editable menu configuration file.

Notes / next steps
- Test in Chrome: load unpacked extension (see `manifest.json`), open a page, resize/drag the list, click an item to confirm bookmark created under Bookmarks Bar → `FloatBookmark` → subfolder.
- If you prefer a different initial height (e.g., 300px) change the `box.style.height` value in `content.js`.
- I can add a small options UI to edit `menu_items.json` from the popup or store items in `chrome.storage` for runtime edits.
Files changed
- `d/ myExtensions/FloatBookmark/content.js` — float UI, drag/resize, position save/restore, collapse, scroll-on-resize.
- `d/ myExtensions/FloatBookmark/background.js` — bookmark folder lookup/creation and bookmark creation.
- `d/ myExtensions/FloatBookmark/manifest.json` — added `bookmarks` permission and background service worker, `content_scripts` set to `<all_urls>`.

Notes / next steps
- Test in Chrome: load unpacked extension (see `manifest.json`), open a page, resize/drag the list, click an item to confirm bookmark created under Bookmarks Bar → `FloatBookmark` → subfolder.
- If you want configurable initial size, folder root, or styles, I can add options UI or use `chrome.storage` to persist settings.

Implemented requirements and notes

- **Right sidebar:** the menu is displayed as a fixed right-hand sidebar instead of a floating panel.
- **Save on click:** clicking a list item saves the current page as a bookmark under Bookmarks Bar → `FloatBookmark` → `<button title>`.
- **Save dropped links:** dragging a link and dropping it onto a button also saves that link into the corresponding bookmark folder.
- **Resizable sidebar:** users can resize the sidebar by dragging the right edge; the adjusted width is remembered across reloads.
- **Page content shift:** the page content is pushed left when the sidebar appears so the menu does not block the original content area.
- **Background worker:** bookmark creation is performed in `background.js` using the `bookmarks` permission; it finds or creates the `FloatBookmark` root folder and folder-specific subfolders.
- **All sites:** content script injects on all pages through `content_scripts` with `"<all_urls>"`.
- **Menu config:** items are loaded from `menu_items.json`; the extension exposes that file as a `web_accessible_resource` and uses a fallback list if needed.
- **Collapse header:** clicking the header toggles collapse/expand for the sidebar.
- **Scroll handling:** wheel scrolling inside the sidebar stays contained within the menu and does not scroll the underlying page.
- **Persistent state:** sidebar width and position are preserved using `localStorage`.

Files changed
- `content.js` — sidebar UI, drag/resize handling, drop-to-bookmark support, page spacing, persistent state, menu item loading.
- `background.js` — bookmark folder lookup/creation and bookmark creation.
- `manifest.json` — added `bookmarks` permission, `web_accessible_resources`, and background service worker settings.
- `menu_items.json` — editable menu configuration file.

Notes / next steps
- Test in Chrome by loading the unpacked extension and verifying click and drag/drop bookmark behavior.
- Verify the sidebar stays on the right, resizes with the handle, and moves page content instead of overlapping it.
- If you want, I can also add visible resize handle styling and a settings UI for menu item management.

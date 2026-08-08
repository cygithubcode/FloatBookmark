const ROOT_FOLDER_TITLE = "FloatBookmark";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action !== "addBookmark") return;

    const folderName = message.folderName || "default";
    const url = message.url;
    const title = message.title || url;

    ensureBookmarkFolder(folderName)
        .then(folderId => createBookmark(folderId, title, url))
        .then(() => sendResponse({ success: true }))
        .catch(error => {
            console.error("Bookmark save error:", error);
            sendResponse({ success: false, error: error.message || String(error) });
        });

    return true;
});

function ensureBookmarkFolder(subfolderName) {
    return getBookmarksRoot()
        .then(rootId => getOrCreateFolder(rootId, ROOT_FOLDER_TITLE))
        .then(rootFolderId => getOrCreateFolder(rootFolderId, subfolderName));
}

function getBookmarksRoot() {
    return new Promise((resolve, reject) => {
        chrome.bookmarks.getTree(tree => {
            if (chrome.runtime.lastError || !tree || tree.length === 0) {
                return reject(chrome.runtime.lastError || new Error("Bookmarks tree not available"));
            }
            const root = tree[0];
            // Try to find the browser's Bookmarks Bar (case-insensitive), searching the tree.
            function findBookmarksBar(node) {
                if (!node) return null;
                const title = (node.title || '').toLowerCase();
                if (title === 'bookmarks bar' || title === 'bookmarks toolbar' || title === 'bookmark bar') return node;
                if (node.children && node.children.length) {
                    for (const child of node.children) {
                        const found = findBookmarksBar(child);
                        if (found) return found;
                    }
                }
                return null;
            }

            const bar = findBookmarksBar(root);
            if (bar) {
                resolve(bar.id);
            } else if (root.children && root.children.length > 0) {
                // fallback to the first top-level bookmark folder
                resolve(root.children[0].id);
            } else {
                resolve(root.id);
            }
        });
    });
}

function getOrCreateFolder(parentId, title) {
    return new Promise((resolve, reject) => {
        chrome.bookmarks.getChildren(parentId, nodes => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            const existing = (nodes || []).find(node => node.title === title && node.url === undefined);
            if (existing) {
                return resolve(existing.id);
            }
            chrome.bookmarks.create({ parentId, title }, node => {
                if (chrome.runtime.lastError || !node) {
                    return reject(chrome.runtime.lastError || new Error("Failed to create folder"));
                }
                resolve(node.id);
            });
        });
    });
}

function createBookmark(parentId, title, url) {
    return new Promise((resolve, reject) => {
        chrome.bookmarks.create({ parentId, title, url }, node => {
            if (chrome.runtime.lastError || !node) {
                return reject(chrome.runtime.lastError || new Error("Failed to create bookmark"));
            }
            resolve(node);
        });
    });
}

const MENU_ID = "float-bookmark-menu";
const HEADER_ID = "float-bookmark-header";
const SIDEBAR_MIN_WIDTH = 100;
const SIDEBAR_MAX_WIDTH = 500;
const SIDEBAR_DEFAULT_WIDTH = 260;

const MENU_FALLBACK = [
    "trd","lauph","drive","mind ways thoughts","ToCheck","Music","Living","food","kalaok","Coding","羽毛球","archery","AI","AI","Stats","Tape reading","learn stat trd","心理","房子","realestate","train","tv","jobs","music","car","doc","exercise","Volleyball","travel","Korean","Soccer","Business","ohters","Health","Basketball","Financial"
];

async function loadMenuItems() {
    try {
        const url = chrome.runtime.getURL('menu_items.json');
        const res = await fetch(url);
        if (!res.ok) return MENU_FALLBACK;
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return MENU_FALLBACK;
        return data;
    } catch (e) {
        return MENU_FALLBACK;
    }
}

function savePageSpacing() {
    if (window.__floatBookmarkPageSpacingSaved) return;
    window.__floatBookmarkPageSpacingSaved = {
        htmlMarginRight: document.documentElement.style.marginRight || "",
        htmlPaddingRight: document.documentElement.style.paddingRight || "",
        htmlOverflowX: document.documentElement.style.overflowX || "",
        htmlMaxWidth: document.documentElement.style.maxWidth || "",
        bodyMarginRight: document.body.style.marginRight || "",
        bodyPaddingRight: document.body.style.paddingRight || "",
        bodyOverflowX: document.body.style.overflowX || "",
        bodyMaxWidth: document.body.style.maxWidth || ""
    };
}

function applyPageSpacing(width) {
    savePageSpacing();
    document.documentElement.style.boxSizing = "border-box";
    document.documentElement.style.marginRight = `${width}px`;
    document.documentElement.style.paddingRight = "0";
    document.documentElement.style.overflowX = "hidden";
    document.documentElement.style.overscrollBehaviorX = "none";
    document.documentElement.style.setProperty('--yt-content-margin', `${width}px`);
    document.body.style.boxSizing = "border-box";
    document.body.style.marginRight = `${width}px`;
    document.body.style.paddingRight = "0";
    document.body.style.overflowX = "hidden";
    document.body.style.overscrollBehaviorX = "none";
}

function restorePageSpacing() {
    const saved = window.__floatBookmarkPageSpacingSaved;
    if (!saved) return;
    document.documentElement.style.marginRight = saved.htmlMarginRight;
    document.documentElement.style.paddingRight = saved.htmlPaddingRight || "";
    document.documentElement.style.overflowX = saved.htmlOverflowX || "";
    document.documentElement.style.maxWidth = saved.htmlMaxWidth || "";
    document.body.style.marginRight = saved.bodyMarginRight;
    document.body.style.paddingRight = saved.bodyPaddingRight || "";
    document.body.style.overflowX = saved.bodyOverflowX || "";
    document.body.style.maxWidth = saved.bodyMaxWidth || "";
}

function getSavedSidebarWidth() {
    const width = Number(localStorage.getItem("floatBookmarkSidebarWidth"));
    if (Number.isFinite(width) && width >= SIDEBAR_MIN_WIDTH && width <= SIDEBAR_MAX_WIDTH) {
        return width;
    }
    return SIDEBAR_DEFAULT_WIDTH;
}

function saveSidebarWidth(width) {
    localStorage.setItem("floatBookmarkSidebarWidth", String(width));
}

async function createSidebarMenu() {
    if (document.getElementById(MENU_ID)) return;
    const MENU_ITEMS = await loadMenuItems();

    const savedWidth = getSavedSidebarWidth();
    const box = document.createElement("div");
    box.id = MENU_ID;
    box.style.position = "fixed";
    box.style.top = "0";
    box.style.right = "0";
    box.style.width = `${savedWidth}px`;
    box.style.height = "100vh";
    box.style.minWidth = `${SIDEBAR_MIN_WIDTH}px`;
    box.style.boxSizing = "border-box";
    box.style.overscrollBehavior = "contain";
    box.style.background = "#222";
    box.style.color = "white";
    box.style.zIndex = 9999999;
    box.style.borderLeft = "1px solid #444";
    box.style.boxShadow = "-4px 0 16px rgba(0,0,0,0.35)";
    box.style.cursor = "default";
    box.style.userSelect = "none";
    box.style.resize = "none";
    box.style.display = "flex";
    box.style.flexDirection = "column";
    box.style.overflow = "hidden";
    box.style.fontFamily = "Arial, sans-serif";

    const header = document.createElement("div");
    header.id = HEADER_ID;
    header.style.padding = "10px";
    header.style.background = "#1a73e8";
    header.style.borderRadius = "8px 8px 0 0";
    header.style.cursor = "pointer";
    header.style.fontWeight = "700";
    header.style.fontSize = "14px";
    header.innerText = "Bookmarks";
    box.appendChild(header);

    const menu = document.createElement("div");
    menu.style.display = "flex";
    menu.style.flexDirection = "column";
    menu.style.flex = "1 1 auto";
    menu.style.minHeight = "0";
    menu.style.overflow = "auto";
    menu.style.boxSizing = "border-box";
    menu.style.overscrollBehavior = "contain";
    menu.style.paddingRight = "8px";

    MENU_ITEMS.forEach(title => {
        const button = document.createElement("div");
        button.innerText = title;
        button.style.padding = "12px 10px";
        button.style.borderTop = "1px solid #444";
        button.style.cursor = "pointer";
        button.style.fontSize = "14px";
        button.style.lineHeight = "1.4";
        button.style.minHeight = "42px";
        button.style.whiteSpace = "normal";
        button.style.wordBreak = "break-word";
        button.style.overflow = "visible";
        const fs = parseFloat(window.getComputedStyle(button).fontSize) || 14;
        button.style.minHeight = (fs + 2) + "px";

        button.addEventListener("mouseenter", () => {
            if (!button.classList.contains("selected")) button.style.background = "#333";
        });
        button.addEventListener("mouseleave", () => {
            if (!button.classList.contains("selected")) button.style.background = "transparent";
        });

        button.addEventListener("click", () => {
            const folderName = title;
            const url = window.location.href;
            const pageTitle = document.title || url;

            chrome.runtime.sendMessage(
                { action: "addBookmark", folderName, url, title: pageTitle },
                response => {
                    if (response && response.success) {
                        button.classList.add("selected");
                        button.style.background = "#0b5ed7";
                    } else {
                        const message = response && response.error ? response.error : "Failed to add bookmark.";
                        alert(message);
                    }
                }
            );
        });

        menu.appendChild(button);
    });

    const resizeHandle = document.createElement("div");
    resizeHandle.id = "resize-handle";
    resizeHandle.style.position = "absolute";
    resizeHandle.style.left = "0";
    resizeHandle.style.top = "0";
    resizeHandle.style.bottom = "0";
    resizeHandle.style.width = "8px";
    resizeHandle.style.cursor = "ew-resize";
    resizeHandle.style.background = "transparent";
    resizeHandle.style.zIndex = "10000000";
    box.appendChild(resizeHandle);

    box.appendChild(menu);
    document.body.appendChild(box);
    applyPageSpacing(savedWidth);

    let isResizing = false;

    function resizePanel(e) {
        if (!isResizing) return;
        const newWidth = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, window.innerWidth - e.clientX));
        box.style.width = `${newWidth}px`;
        applyPageSpacing(newWidth);
        document.documentElement.style.setProperty('--yt-content-margin', `${newWidth}px`);
    }

    function stopResize() {
        isResizing = false;
        document.body.style.cursor = "";
        saveSidebarWidth(box.getBoundingClientRect().width);
        document.removeEventListener("mousemove", resizePanel);
        document.removeEventListener("mouseup", stopResize);
    }

    resizeHandle.addEventListener("mousedown", event => {
        event.preventDefault();
        isResizing = true;
        document.body.style.cursor = "ew-resize";
        document.addEventListener("mousemove", resizePanel);
        document.addEventListener("mouseup", stopResize);
    });

    const wheelHandler = event => {
        const deltaY = event.deltaY;
        const scrollTop = menu.scrollTop;
        const scrollHeight = menu.scrollHeight;
        const clientHeight = menu.clientHeight;
        const atTop = scrollTop === 0;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

        if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) {
            event.stopPropagation();
            return;
        }

        event.preventDefault();
        event.stopPropagation();
    };

    menu.addEventListener("wheel", wheelHandler, { passive: false });
    box.addEventListener("wheel", wheelHandler, { passive: false });

    header.addEventListener("click", () => {
        const isCollapsed = box.dataset.collapsed === "1";
        if (isCollapsed) {
            const saved = box.dataset.savedHeight;
            if (saved) box.style.height = saved;
            menu.style.display = "flex";
            box.dataset.collapsed = "0";
        } else {
            box.dataset.savedHeight = box.style.height || (box.getBoundingClientRect().height + "px");
            box.style.height = header.getBoundingClientRect().height + "px";
            menu.style.display = "none";
            box.dataset.collapsed = "1";
        }
    });

    // Scroll menu to top whenever the container is resized
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => {
            try { menu.scrollTop = 0; } catch (e) { /* ignore */ }
        });
        ro.observe(box);
    }

}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createSidebarMenu);
} else {
    createSidebarMenu();
}



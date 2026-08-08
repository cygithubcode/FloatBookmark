const MENU_ID = "float-bookmark-menu";
const HEADER_ID = "float-bookmark-header";

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

async function createFloatingMenu() {
    if (document.getElementById(MENU_ID)) return;
    const MENU_ITEMS = await loadMenuItems();

    const box = document.createElement("div");
    box.id = MENU_ID;
    box.style.position = "fixed";
    box.style.top = "150px";
    box.style.right = "20px";
    box.style.width = "150px";
    box.style.height = "800px";
    box.style.minWidth = "130px";
    box.style.minHeight = "10px";
    box.style.background = "#222";
    box.style.color = "white";
    box.style.zIndex = 9999999;
    box.style.borderRadius = "8px";
    box.style.boxShadow = "0 0 12px rgba(0,0,0,0.35)";
    box.style.cursor = "move";
    box.style.userSelect = "none";
    box.style.resize = "both";
    box.style.display = "flex";
    box.style.flexDirection = "column";
    box.style.overflow = "hidden";
    box.style.fontFamily = "Arial, sans-serif";

    const savedRight = localStorage.getItem("floatBookmarkRight");
    const savedTop = localStorage.getItem("floatBookmarkTop");
    if (savedRight !== null && savedTop !== null) {
        box.style.right = Math.max(0, parseFloat(savedRight)) + "px";
        box.style.top = Math.max(0, parseFloat(savedTop)) + "px";
        box.style.left = "auto";
    }

    const header = document.createElement("div");
    header.id = HEADER_ID;
    header.style.padding = "10px";
    header.style.background = "#1a73e8";
    header.style.borderRadius = "8px 8px 0 0";
    header.style.cursor = "pointer";
    header.style.fontWeight = "700";
    header.style.fontSize = "14px";
    header.innerText = "Float";
    box.appendChild(header);

    const menu = document.createElement("div");
    menu.style.display = "flex";
    menu.style.flexDirection = "column";
    menu.style.flex = "1 1 auto";
    menu.style.minHeight = "0";
    menu.style.overflow = "auto";

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

    box.appendChild(menu);
    document.body.appendChild(box);

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let dragMoved = false;

    header.addEventListener("mousedown", event => {
        isDragging = true;
        dragMoved = false;
        offsetX = event.clientX - box.getBoundingClientRect().left;
        offsetY = event.clientY - box.getBoundingClientRect().top;
        document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", event => {
        if (!isDragging) return;

        const newLeft = event.clientX - offsetX;
        const newTop = event.clientY - offsetY;

        if (Math.abs(newLeft - box.getBoundingClientRect().left) > 2 || Math.abs(newTop - box.getBoundingClientRect().top) > 2) {
            dragMoved = true;
        }

        box.style.left = Math.max(0, newLeft) + "px";
        box.style.top = Math.max(0, newTop) + "px";
        box.style.right = "auto";
    });

    document.addEventListener("mouseup", () => {
        if (isDragging) {
            const rect = box.getBoundingClientRect();
            const offsetRight = Math.max(0, Math.round(window.innerWidth - rect.right));
            localStorage.setItem("floatBookmarkRight", offsetRight);
            localStorage.setItem("floatBookmarkTop", Math.max(0, Math.round(rect.top)));
        }
        isDragging = false;
        document.body.style.userSelect = "";
    });

    header.addEventListener("click", event => {
        if (dragMoved) return;
        const isCollapsed = box.dataset.collapsed === "1";
        if (isCollapsed) {
            const saved = box.dataset.savedHeight;
            if (saved) box.style.height = saved; else box.style.height = "300px";
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

    // Adjust position when window or viewport size changes so top/right remain valid
    function adjustPosition() {
        const savedRight = localStorage.getItem("floatBookmarkRight");
        const savedTop = localStorage.getItem("floatBookmarkTop");
        if (savedRight !== null) {
            box.style.right = Math.max(0, parseFloat(savedRight)) + "px";
            box.style.left = "auto";
        }

        if (savedTop !== null) {
            // clamp top so the box stays in viewport
            const rect = box.getBoundingClientRect();
            const desiredTop = Math.max(0, Math.min(parseFloat(savedTop), window.innerHeight - rect.height - 8));
            box.style.top = desiredTop + "px";
        } else {
            const rect = box.getBoundingClientRect();
            if (rect.top + rect.height > window.innerHeight) {
                box.style.top = Math.max(8, window.innerHeight - rect.height - 8) + "px";
            }
        }
    }

    window.addEventListener("resize", adjustPosition);
    window.addEventListener("orientationchange", adjustPosition);
    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", adjustPosition);
    }

    // Ensure position is valid on create
    adjustPosition();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createFloatingMenu);
} else {
    createFloatingMenu();
}



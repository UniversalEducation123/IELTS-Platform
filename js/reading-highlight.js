/* =====================================
   IELTS Reading Highlighter
===================================== */

const pageKey =
    "readingHighlights_" + window.location.pathname;

    

let highlightMode = false;

/* ---------- Toolbar ---------- */

const highlightBtn = document.createElement("button");
highlightBtn.id = "readingHighlightToggle";
highlightBtn.innerHTML = `
<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
  <g transform="rotate(-35 12 12)">
    <rect x="8" y="2" width="8" height="13" rx="2" fill="#F3D36A"/>
    <rect x="8" y="15" width="8" height="5" fill="#C89B00"/>
    <polygon points="8,20 16,20 12,23" fill="#8B6B00"/>
  </g>
</svg>`;
document.body.appendChild(highlightBtn);

const clearBtn = document.createElement("button");
clearBtn.id = "readingClearHighlights";
clearBtn.innerHTML = `
<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
  <path d="M7 16L15 8L20 13L12 21H7L3 17L11 9" 
        fill="none"
        stroke="#5F5B55"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"/>
  <path d="M7 21H18" 
        stroke="#5F5B55"
        stroke-width="2"
        stroke-linecap="round"/>
</svg>`;
document.body.appendChild(clearBtn);

/* ---------- Styles ---------- */

const style = document.createElement("style");

style.textContent = `
body.highlight-mode{
    cursor:text;
}

body.highlight-mode .passage-panel,
body.highlight-mode .questions-panel{
    cursor:text;
}

#readingHighlightToggle,
#readingClearHighlights{
    position:fixed;
    right:22px;
    z-index:9999;

    width:52px;
    height:52px;

    border:none;
    border-radius:50%;

    display:flex;
    align-items:center;
    justify-content:center;

    font-size:22px;
    cursor:pointer;

    box-shadow:0 8px 20px rgba(0,0,0,.18);
    transition:.2s;
}

#readingHighlightToggle{
    bottom:24px;
    background:#8B9A6E;
    color:#fff;
}

#readingHighlightToggle.active{
    background:#F3D36A;
}

#readingClearHighlights{
    bottom:88px;
    background:#fff;
    border:1px solid #DDD;
}

#readingHighlightToggle:hover,
#readingClearHighlights:hover{
    transform:scale(1.08);
}

.reading-highlight{
    background:#FDE68A !important;
    color:inherit;
    padding:0;
    border-radius:2px;
}
    ::highlight(reading-highlight){
    background:#FDE68A;
}

@media (max-width:700px){

    #readingHighlightToggle{
        right:18px;
        bottom:18px;
    }

    #readingClearHighlights{
        right:18px;
        bottom:82px;
    }

}`;

document.head.appendChild(style);

/* ---------- Save ---------- */

let savedRanges = {};

function saveHighlights() {

    const activePart = document.querySelector(".reading-part.active");
    if (!activePart) return;

    const partId = activePart.id;

    const ranges = [];

    readingHighlight.forEach(range => {

        ranges.push({
            startPath: getNodePath(range.startContainer, activePart),
            startOffset: range.startOffset,
            endPath: getNodePath(range.endContainer, activePart),
            endOffset: range.endOffset
        });

    });

    savedRanges[partId] = ranges;

    sessionStorage.setItem(
        pageKey,
        JSON.stringify(savedRanges)
    );
}

/* ---------- Restore ---------- */

function restoreHighlights() {

    const activePart = document.querySelector(".reading-part.active");
    if (!activePart) return;

    const partId = activePart.id;

    savedRanges = JSON.parse(
        sessionStorage.getItem(pageKey) || "{}"
    );

    readingHighlight.clear();

    if (!savedRanges[partId]) return;

    savedRanges[partId].forEach(item => {

        const start = getNodeFromPath(item.startPath, activePart);
        const end = getNodeFromPath(item.endPath, activePart);

        if (!start || !end) return;

        const range = new Range();

        range.setStart(start, item.startOffset);
        range.setEnd(end, item.endOffset);

        readingHighlight.add(range);

    });

}

function getNodePath(node, root){

    const path = [];

    while(node && node !== root){

        const parent = node.parentNode;
        if(!parent) break;

        path.unshift(
            Array.prototype.indexOf.call(parent.childNodes, node)
        );

        node = parent;
    }

    return path;
}

function getNodeFromPath(path, root){

    let node = root;

    for(const index of path){

        node = node.childNodes[index];

        if(!node) return null;
    }

    return node;
}

/* Restore after the page loads */

document.addEventListener("DOMContentLoaded", () => {
    restoreHighlights();
});

/* ---------- Toggle ---------- */

highlightBtn.addEventListener("click", function () {

    highlightMode = !highlightMode;

    document.body.classList.toggle(
        "highlight-mode",
        highlightMode
    );

    highlightBtn.classList.toggle(
        "active",
        highlightMode
    );

});

/* ---------- Highlight (CSS Highlight API) ---------- */

const readingHighlight = new Highlight();

if (CSS.highlights) {
    CSS.highlights.set("reading-highlight", readingHighlight);
}

document.addEventListener("mouseup", () => {

    if (!highlightMode) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);

    const activePart = document.querySelector(".reading-part.active");
    if (!activePart) return;

    const allowed =
        activePart.querySelector(".passage-panel")?.contains(range.commonAncestorContainer) ||
        activePart.querySelector(".questions-panel")?.contains(range.commonAncestorContainer);

    if (!allowed) {
        selection.removeAllRanges();
        return;
    }

    readingHighlight.add(range.cloneRange());

    selection.removeAllRanges();

    saveHighlights();

});

/* ---------- Erase highlight ---------- */

document.addEventListener("click", (e) => {

    const mark = e.target.closest(".reading-highlight");

    if (!mark) return;

    // Only erase while Highlight mode is ON
    if (!highlightMode) return;

    const parent = mark.parentNode;

    while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
    }

    parent.removeChild(mark);

    parent.normalize();

    saveHighlights();
});

/* ---------- Clear all highlights ---------- */

clearBtn.addEventListener("click", () => {

    const activePart = document.querySelector(".reading-part.active");
    if (!activePart) return;

    if (!confirm("Remove all highlights from this part?")) return;

    readingHighlight.clear();

    savedRanges[activePart.id] = [];

    sessionStorage.setItem(
        pageKey,
        JSON.stringify(savedRanges)
    );

});
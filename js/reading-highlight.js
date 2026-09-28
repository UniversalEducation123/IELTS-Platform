/* =====================================
   IELTS Reading Highlighter
===================================== */

const pageKey =
    "readingHighlights_" + window.location.pathname;

let highlightMode = false;

/* ---------- Toolbar ---------- */

const highlightBtn = document.createElement("button");
highlightBtn.id = "readingHighlightToggle";
highlightBtn.innerHTML = "🖍 Highlight";
document.body.appendChild(highlightBtn);

const clearBtn = document.createElement("button");
clearBtn.id = "readingClearHighlights";
clearBtn.innerHTML = "🧽 Clear";
document.body.appendChild(clearBtn);

/* ---------- Styles ---------- */

const style = document.createElement("style");

style.textContent = `
#readingHighlightToggle{
    position:fixed;
    top:92px;
    right:24px;
    z-index:9999;

    display:flex;
    align-items:center;
    gap:8px;

    padding:11px 18px;

    border:none;
    border-radius:999px;

    background:rgba(139,154,110,.96);
    color:#fff;

    font-size:14px;
    font-weight:600;

    cursor:pointer;

    box-shadow:0 10px 24px rgba(76,74,70,.16);
    transition:.25s;
}

#readingHighlightToggle:hover{
    transform:translateY(-2px);
}

#readingHighlightToggle.active{
    background:#F3D36A;
    color:#5A4700;
}

body.highlight-mode{
    cursor:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cg transform='rotate(-35 16 16)'%3E%3Crect x='12' y='2' width='8' height='18' rx='2' fill='%238B9A6E'/%3E%3Crect x='12' y='18' width='8' height='8' fill='%23F3D36A'/%3E%3Cpolygon points='12,26 20,26 16,31' fill='%23C89B00'/%3E%3C/g%3E%3C/svg%3E") 4 28, text;
}

.reading-highlight{
    background:#FDE68A;
    border-radius:3px;
    padding:1px 0;
}

@media (max-width:700px){
    #readingHighlightToggle{
        top:auto;
        bottom:18px;
        right:18px;
    }
}

#readingClearHighlights{
    position:fixed;
    top:92px;
    right:178px;
    z-index:9999;

    padding:11px 16px;

    border:none;
    border-radius:999px;

    background:#FFFFFF;
    color:#5F5B55;

    font-size:14px;
    font-weight:600;

    cursor:pointer;

    border:1px solid #D8D3C8;
    box-shadow:0 10px 24px rgba(76,74,70,.10);

    transition:.25s;
}

#readingClearHighlights:hover{
    background:#F6F3EE;
}

@media (max-width:700px){
    #readingClearHighlights{
        bottom:18px;
        top:auto;
        right:160px;
    }
}
`;

document.head.appendChild(style);

/* ---------- Save ---------- */

function saveHighlights(){

    const passage =
        document.querySelector(".passage-panel");

    if (!passage) return;

    sessionStorage.setItem(
        pageKey,
        passage.innerHTML
    );
}

/* ---------- Restore ---------- */

function restoreHighlights(){

    const saved =
        sessionStorage.getItem(pageKey);

    if (!saved) return;

    const passage =
        document.querySelector(".passage-panel");

    if (passage) {
        passage.innerHTML = saved;
    }
}

/* Restore after the page loads */

document.addEventListener("DOMContentLoaded", () => {
    restoreHighlights();
});

/* ---------- Toggle ---------- */

highlightBtn.addEventListener("click", () => {

    highlightMode = !highlightMode;

    document.body.classList.toggle(
        "highlight-mode",
        highlightMode
    );

    highlightBtn.classList.toggle(
        "active",
        highlightMode
    );

    highlightBtn.innerHTML =
        highlightMode
            ? "🖍 Highlighting"
            : "🖍 Highlight";

});

/* ---------- Highlight ---------- */

document.addEventListener("mouseup", () => {

    if (!highlightMode) return;

    const selection = window.getSelection();

    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);

    const passage = document.querySelector(".passage-panel");

    if (!passage || !passage.contains(range.commonAncestorContainer)) {
        selection.removeAllRanges();
        return;
    }

    try{
        const span = document.createElement("span");
        span.className = "reading-highlight";
        range.surroundContents(span);
        saveHighlights();
    }catch(e){}

    selection.removeAllRanges();

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

    const passage = document.querySelector(".passage-panel");

    if (!passage) return;

    const confirmed = confirm(
        "Remove all highlights from this passage?"
    );

    if (!confirmed) return;

    passage.querySelectorAll(".reading-highlight").forEach(mark => {

        const parent = mark.parentNode;

        while (mark.firstChild) {
            parent.insertBefore(mark.firstChild, mark);
        }

        parent.removeChild(mark);

    });

    passage.normalize();

    sessionStorage.removeItem(pageKey);

});
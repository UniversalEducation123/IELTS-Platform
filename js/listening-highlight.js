/* =====================================
   IELTS Listening Highlighter
===================================== */

const pageKey =
    "listeningHighlights_" + window.location.pathname;

let highlightMode = false;


/* ---------- Get Listening content area ---------- */

function getHighlightRoot() {

    return (
        document.querySelector(".listening-container") ||
        document.body
    );

}


/* ---------- Toolbar ---------- */

const highlightBtn = document.createElement("button");

highlightBtn.id = "listeningHighlightToggle";

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

clearBtn.id = "listeningClearHighlights";

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

body.listening-highlight-mode{
    cursor:text;
}

body.listening-highlight-mode .listening-container{
    cursor:text;
}


#listeningHighlightToggle,
#listeningClearHighlights{

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


#listeningHighlightToggle{

    bottom:24px;

    background:#8B9A6E;

    color:#fff;
}


#listeningHighlightToggle.active{

    background:#F3D36A;

}


#listeningClearHighlights{

    bottom:88px;

    background:#fff;

    border:1px solid #DDD;

}


#listeningHighlightToggle:hover,
#listeningClearHighlights:hover{

    transform:scale(1.08);

}


::highlight(listening-highlight){

    background:#FDE68A;

}


@media (max-width:700px){

    #listeningHighlightToggle{

        right:18px;
        bottom:18px;

    }

    #listeningClearHighlights{

        right:18px;
        bottom:82px;

    }

}
`;

document.head.appendChild(style);


/* ---------- Save ---------- */

let savedRanges = [];


function saveHighlights(){

    const root = getHighlightRoot();

    if (!root) return;


    const ranges = [];


    listeningHighlight.forEach(function(range){

        ranges.push({

            startPath:
                getNodePath(
                    range.startContainer,
                    root
                ),

            startOffset:
                range.startOffset,

            endPath:
                getNodePath(
                    range.endContainer,
                    root
                ),

            endOffset:
                range.endOffset

        });

    });


    savedRanges = ranges;


    sessionStorage.setItem(

        pageKey,

        JSON.stringify(savedRanges)

    );

}


/* ---------- Restore ---------- */

function restoreHighlights(){

    const root = getHighlightRoot();

    if (!root) return;


    try{

        savedRanges = JSON.parse(

            sessionStorage.getItem(pageKey) || "[]"

        );

    }catch(error){

        console.error(
            "Could not restore Listening highlights:",
            error
        );

        savedRanges = [];

    }


    listeningHighlight.clear();


    if (!Array.isArray(savedRanges)) return;


    savedRanges.forEach(function(item){

        const start =
            getNodeFromPath(
                item.startPath,
                root
            );

        const end =
            getNodeFromPath(
                item.endPath,
                root
            );


        if (!start || !end) return;


        try{

            const range = new Range();


            range.setStart(
                start,
                item.startOffset
            );


            range.setEnd(
                end,
                item.endOffset
            );


            listeningHighlight.add(range);


        }catch(error){

            console.error(
                "Could not restore Listening highlight:",
                error
            );

        }

    });

}


/* ---------- Node Path ---------- */

function getNodePath(node, root){

    const path = [];


    while(node && node !== root){

        const parent = node.parentNode;

        if(!parent) break;


        path.unshift(

            Array.prototype.indexOf.call(

                parent.childNodes,

                node

            )

        );


        node = parent;

    }


    return path;

}


function getNodeFromPath(path, root){

    let node = root;


    for(const index of path){

        node = node.childNodes[index];


        if(!node){

            return null;

        }

    }


    return node;

}


/* ---------- Restore after page loads ---------- */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        restoreHighlights();

    }
);


/* ---------- Toggle ---------- */

highlightBtn.addEventListener(
    "click",
    function(){

        highlightMode = !highlightMode;


        document.body.classList.toggle(

            "listening-highlight-mode",

            highlightMode

        );


        highlightBtn.classList.toggle(

            "active",

            highlightMode

        );

    }
);


/* ---------- Highlight CSS API ---------- */

const listeningHighlight =
    new Highlight();


if (CSS.highlights) {

    CSS.highlights.set(

        "listening-highlight",

        listeningHighlight

    );

}


/* ---------- Highlight Selected Text ---------- */

document.addEventListener(
    "mouseup",
    function(){

        if (!highlightMode) return;


        const selection =
            window.getSelection();


        if (
            !selection ||
            selection.isCollapsed
        ){

            return;

        }


        const range =
            selection.getRangeAt(0);


        const root =
            getHighlightRoot();


        if (!root) return;


        /*
         * Only allow highlighting inside
         * the Listening content.
         */

        const allowed =
            root.contains(
                range.commonAncestorContainer
            );


        if (!allowed){

            selection.removeAllRanges();

            return;

        }


        listeningHighlight.add(
            range.cloneRange()
        );


        selection.removeAllRanges();


        saveHighlights();

    }
);


/* ---------- Clear all highlights ---------- */

clearBtn.addEventListener(
    "click",
    function(){

        const root =
            getHighlightRoot();


        if (!root) return;


        if (
            !confirm(
                "Remove all highlights from this part?"
            )
        ){

            return;

        }


        listeningHighlight.clear();


        savedRanges = [];


        sessionStorage.setItem(

            pageKey,

            JSON.stringify(savedRanges)

        );

    }
);
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

const highlightBtn =
    window.parent.document.getElementById(
        "listeningHighlightToggle"
    );

const clearBtn =
    window.parent.document.getElementById(
        "listeningClearHighlights"
    );


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

highlightBtn.onclick = function () {

    highlightMode = !highlightMode;

    document.body.classList.toggle(
        "listening-highlight-mode",
        highlightMode
    );

    highlightBtn.classList.toggle(
        "active",
        highlightMode
    );

};

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

clearBtn.onclick = () => {

    const root =
        getHighlightRoot();

    if (!root) return;

    if (
        !confirm(
            "Remove all highlights from this part?"
        )
    ) {
        return;
    }

    listeningHighlight.clear();

    savedRanges = [];

    sessionStorage.setItem(
        pageKey,
        JSON.stringify(savedRanges)
    );

};
var content = '';

/*
    Recursive function which prases the dom to find out text nodes
    they can contain the records which we are looking for.
*/
function parse(node) {
    if (node) {
        var childNodes = node.childNodes;
        for (var i=0; i < childNodes.length; i++) {
            var childNode = childNodes[i];
            if (Node.ELEMENT_NODE === childNode.nodeType) {
                /*
                    Check for iframe and if present then consider it as a
                    html document and drill down further.
                */
                if (childNode.contentDocument &&
                    childNode.contentDocument.firstChild &&
                    childNode.contentDocument.firstChild.nextSibling
                ) {
                    parse(childNode.contentDocument.firstChild.nextSibling);
                } else {
                    parse(childNode);
                }
            } else if (Node.TEXT_NODE === childNode.nodeType && childNode.nodeValue.trim().length) {
                content += childNode.nodeValue;
            }
        }
    }

    return content;
}

chrome.runtime.sendMessage({
    action: "getSource",
    source: parse(document.firstChild.nextSibling) // pass the html node of the document.
});

// @author Rob W <http://stackoverflow.com/users/938089/rob-w>
// Demo: var serialized_html = DOMtoString(document);

/*function DOMtoString(document_root) {
    var html = '',
        node = document_root.firstChild;
    while (node) {
        switch (node.nodeType) {
            case Node.ELEMENT_NODE:
                html += node.outerHTML;
                break;
            case Node.TEXT_NODE:
                html += node.nodeValue;
                break;
            case Node.CDATA_SECTION_NODE:
                html += '<![CDATA[' + node.nodeValue + ']]>';
                break;
            case Node.COMMENT_NODE:
                html += '<!--' + node.nodeValue + '-->';
                break;
            case Node.DOCUMENT_TYPE_NODE:
                // (X)HTML documents are identified by public identifiers
                html += "<!DOCTYPE " + node.name + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') + (!node.publicId && node.systemId ? ' SYSTEM' : '') + (node.systemId ? ' "' + node.systemId + '"' : '') + '>\n';
                break;
        }
        node = node.nextSibling;
    }
    return html;
}*/
var content = '';
function parse(node) {
    if (node) {
        var childNodes = node.childNodes;
        for (var i=0; i < childNodes.length; i++) {
            var childNode = childNodes[i];
            if (Node.ELEMENT_NODE === childNode.nodeType) {
                // check for iframe
                if (childNode.contentDocument &&
                    childNode.contentDocument.firstChild &&
                    childNode.contentDocument.firstChild.nextSibling
                ) {
                    //console.log(childNode.contentDocument.firstChild.nextSibling);
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
    source: parse(document.firstChild.nextSibling)
});

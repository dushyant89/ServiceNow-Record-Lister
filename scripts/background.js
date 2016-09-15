// React when a browser action's icon is clicked.
chrome.browserAction.onClicked.addListener(function(tab) {
    // Look through all the pages in this extension to find one we can use.
    var views = chrome.extension.getViews();
    var viewTabUrl = chrome.extension.getURL('popup.html');
    // The extension should work only on the below pattern.
    var pattern = /^https?:\/\/([a-zA-Z\d-]+\.){0,}service-now\.com/g;
    for (var i = 0; i < views.length; i++) {
        var view = views[i];
        // If this view has the right URL.
        if (view.location.href === viewTabUrl) {
            if (!view.location.origin.match(pattern)) {
                view.showNoServiceNotification();
            }
            break;
        }
    }
});
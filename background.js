var urls = [
    "*://www.google.com.hk/url?*",
    "*://www.google.com/url?*"
];

chrome.webRequest.onBeforeRequest.addListener(function(detail) {
    try {
        console.debug('origin url: ' + detail.url);
        var url = detail.url.match(/url=([^&]+)/ig) && decodeURIComponent(RegExp.$1);
        console.debug('target url: ' + url);
        return { redirectUrl: url };
    } catch (e) {
        console.error(e);
    }
}, { urls: urls }, ['blocking']);

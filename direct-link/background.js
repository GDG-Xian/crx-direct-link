var RE_SEARCH = /https?\:\/\/(www\.google\.[^\/]+)\/url\?.*/;
var RE_IMAGES = /https?\:\/\/(www\.google\.[^\/]+)\/imgres\?.*/;
var FILTERS = { urls: ['<all_urls>'], types: ['main_frame'] };

function config(key, value) {
    if (value === undefined) {
        return localStorage[key];
    } else {
        return (localStorage[key] = value); 
    }
}

function registerTab(tabId, directUrl, targetUrl) {
    localStorage['direct_url_' + tabId] = directUrl; 
    localStorage['target_url_' + tabId] = targetUrl; 
}

function clearRegistion(tabId) {
    delete localStorage['direct_url_' + tabId];
    delete localStorage['target_url_' + tabId];
}

// 注册跳转处理事件
chrome.webRequest.onErrorOccurred.addListener(function(details) {
    return handler_wrapper('error', details); 
}, FILTERS);

chrome.webRequest.onBeforeRequest.addListener(function(details) {
    return handler_wrapper('before', details); 
}, FILTERS, ['blocking']);


// 标签更新时，检测如何注册的 URL 为 Google 搜索结果中转链接，则显示一次图标
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var directUrl = localStorage['direct_url_' + tabId];
    var targetUrl = localStorage['target_url_' + tabId];

    if (directUrl && targetUrl) {
        chrome.pageAction.show(tabId);
    }
});

chrome.tabs.onRemoved.addListener(function(tabId) {
    clearRegistion(tabId);
});

function empty() {}

function handler_wrapper(type, details) {
    details.direct_type = type;
    if (localStorage['skip-safe-check'] === 'true') {
        return type === 'error' ? empty() : direct_handler(details); 
    } else {
        return type === 'before' ? empty() : direct_handler(details); 
    }
}

function direct_handler(details) {
    if (RE_SEARCH.test(details.url)) {
        try {
            var url = details.url.match(/url=([^&]+)/ig) 
                && decodeURIComponent(RegExp.$1);

            registerTab(details.tabId, details.url, url);

            var domain = details.url.match(RE_SEARCH) && RegExp.$1;
            if (domain in localStorage) {
                console.debug('Page Url: ' + url);
                if (details.direct_type === 'error') {
                    chrome.tabs.update(details.tabId, { 'url': url });
                } else {
                    return { redirectUrl: url };
                }
            }
        } catch (e) {
            console.error(e);
        }
    } else if (RE_IMAGES.test(details.url)) {
        try {
            var url = details.url.match(/imgurl=([^&]+)/ig) 
                && decodeURIComponent(RegExp.$1);
            var refer = details.url.match(/imgrefurl=([^&]+)/ig) 
                && decodeURIComponent(RegExp.$1);
            var domain = details.url.match(RE_IMAGES) && RegExp.$1;
            if (domain in localStorage) {
                console.debug('Image Url: ' + url);
                console.debug('Refer Url: ' + refer);
                if (details.direct_type === 'error') {
                    chrome.tabs.update(details.tabId, { 'url': url });
                } else {
                    return { redirectUrl: url };
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
}

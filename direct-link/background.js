var RE_SEARCH = /https?\:\/\/(www\.google\.[^\/]+)\/url\?.*/,
    FILTERS = { urls: ['<all_urls>'], types: ['main_frame'] };

// 设置或者读取 localStorage 的配置方法
function config(key, value) {
    if (value === undefined) {
        return localStorage[key];
    } else {
        return (localStorage[key] = value); 
    }
}


// 中转请求控制器
function dispatcherHandler(handlerType) {
    
    return function(details) { 
        var mode = config('mode') || 'AUTO';

        if (RE_SEARCH.test(details.url)) {
            var targetUrl = details.url.match(/url=([^&]+)/ig) && decodeURIComponent(RegExp.$1);

            localStorage['direct_url_' + details.tabId] = details.url; 
            localStorage['target_url_' + details.tabId] = targetUrl; 

            if (mode !== 'REDIRECT' && mode === handlerType) {

                console.info(mode, '=>', targetUrl);
                if (mode === 'AUTO') {
                    chrome.tabs.update(details.tabId, { 'url': targetUrl });
                } else {
                    return { redirectUrl: targetUrl };
                }
            }
        }

    }
}

// 注册跳转处理事件
chrome.webRequest.onErrorOccurred.addListener(dispatcherHandler('AUTO'), FILTERS);
chrome.webRequest.onBeforeRequest.addListener(dispatcherHandler('DIRECT'), FILTERS, ['blocking']);

// 标签更新时，检测如果注册的 URL 为 Google 搜索结果中转链接，则显示图标
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (localStorage['direct_url_' + tabId] && localStorage['target_url_' + tabId]) {
        chrome.pageAction.show(tabId);
    }
});

// 关闭标签时清除标记
chrome.tabs.onRemoved.addListener(function(tabId) {
    delete localStorage['direct_url_' + tabId];
    delete localStorage['target_url_' + tabId];
});


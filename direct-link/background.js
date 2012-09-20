var RE_SEARCH = /https?\:\/\/(www\.google\.[^\/]+)\/url\?.*/;
var RE_IMAGES = /https?\:\/\/(www\.google\.[^\/]+)\/imgres\?.*/;

// 启用和禁用域名
function toggle_domain(domain_name, enabled) {
    if (enabled) {
        localStorage[domain_name] = 'domain-enabled';
    } else {
        delete localStorage[domain_name];
    }
}

// 遍历域名
function iter_enabled_domains(handler) {
    for (var key in localStorage) {
        if (localStorage[key] === 'domain-enabled') {
            handler(key);
        }
    }
}

// 如果是第一次运行，将 www.google.com 和 www.google.com.hk 默认启用
function execute_setup() {
    var firstRun = (localStorage['firstRun'] === 'true');
    if (!firstRun) {
      localStorage['firstRun'] = 'true';
      localStorage['www.google.com'] = 'domain-enabled';
      localStorage['www.google.com.hk'] = 'domain-enabled';
    }
}
execute_setup();

// Google搜索结果被重置时，重定义页面到搜索结果目标页面
chrome.webRequest.onErrorOccurred.addListener(function(details) {
    if (RE_SEARCH.test(details.url)) {
        try {
            var url = details.url.match(/url=([^&]+)/ig) 
                && decodeURIComponent(RegExp.$1);
            var domain = details.url.match(RE_SEARCH) && RegExp.$1;
            if (domain in localStorage) {
                console.debug('Page Url: ' + url);
                chrome.tabs.update(details.tabId, { 'url': url });
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
                chrome.tabs.update(details.tabId, { 'url': url });
            }
        } catch (e) {
            console.error(e);
        }
    }
}, { urls: ['<all_urls>'], types: ['main_frame', 'sub_frame'] });

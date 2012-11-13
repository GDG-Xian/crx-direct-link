var RE_SEARCH = /https?\:\/\/(www\.google\.[^\/]+)\/url\?.*/;
var RE_IMAGES = /https?\:\/\/(www\.google\.[^\/]+)\/imgres\?.*/;
var FILTERS = { urls: ['<all_urls>'], types: ['main_frame', 'sub_frame'] };

function get_option(name) {
    return localStorage[name];
}

// 启用和禁用域名
function toggle_domain(domain_name, enabled) {
    if (enabled) {
        localStorage[domain_name] = 'domain-enabled';
    } else {
        delete localStorage[domain_name];
    }
}

// 启用和禁用安全检查
function toggle_safe_check(enabled) {
    localStorage['skip-safe-check'] = enabled; 
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
      localStorage['skip-safe-check'] = 'true';
      localStorage['www.google.com'] = 'domain-enabled';
      localStorage['www.google.com.hk'] = 'domain-enabled';
    } else {
      localStorage['skip-safe-check'] = localStorage['skip-safe-check'] || true;
    }

    
    chrome.webRequest.onErrorOccurred.addListener(function(details) {
        return handler_wrapper('error', details); 
    }, FILTERS);
    chrome.webRequest.onBeforeRequest.addListener(function(details) {
        return handler_wrapper('before', details); 
    }, FILTERS, ['blocking']);
}
execute_setup();

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

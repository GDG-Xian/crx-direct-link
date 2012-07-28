var GOOGLE_SEARCH_URLS = [
    "*://www.google.com.hk/url?*",
    "*://www.google.com/url?*"
];

var GOOGLE_IMAGE_URLS = [
    '*://www.google.com.hk/imgres?*',
    '*://www.google.com/imgres?*'
];

// Format string using template
// Usage:
//
// var s1 = '%{1} and %{2}!';
// console.log('source: ' + s1);
// console.log('target: ' + fmt(s1, 'ask', 'learn'));
//
// var s2 = "%{name} is %{age} years old, his son's name is %{sons[0].name}";
// console.log('source: ' + s2);
// console.log('target: ' + fmt(s2, { name: 'Lao Ming', age: 32, sons: [{ name: 'Xiao Ming' }]}));
function fmt() {
    var args = arguments;
    return args[0].replace(/%\{(.*?)}/g, function(match, prop) {
        return function(obj, props) {
            var prop = /\d+/.test(props[0]) ? parseInt(props[0]) : props[0];
            if (props.length > 1) {
                return arguments.callee(obj[prop], props.slice(1));
            } else {
                return obj[prop];
            }
        }(typeof args[1] === 'object' ? args[1] : args, prop.split(/\.|\[|\]\[|\]\./));
    });
}

// Google搜索结果被重置时，重定义页面到搜索结果目标页面
chrome.webRequest.onErrorOccurred.addListener(function(details) {
    console.log('Request Error: ' + details.error);
    console.log('Error Page: ' + details.url);
    
    try {
        var url = details.url.match(/url=([^&]+)/ig) 
            && decodeURIComponent(RegExp.$1);
        console.debug('Page Url: ' + url);
        chrome.tabs.update(details.tabId, { 'url': url });
    } catch (e) {
        console.error(e);
    }
}, { urls: GOOGLE_SEARCH_URLS });

// 当页面被重置时，重定向google图片搜索结果的URL直接到图片页面
chrome.webRequest.onErrorOccurred.addListener(function(details) {
    console.log('Request Error: ' + details.error);
    console.log('Error Page: ' + details.url);
    
    try {
        var url = details.url.match(/imgurl=([^&]+)/ig) 
            && decodeURIComponent(RegExp.$1);
        var refer = details.url.match(/imgrefurl=([^&]+)/ig) 
            && decodeURIComponent(RegExp.$1);
        console.debug('Image Url: ' + url);
        console.debug('Refer Url: ' + refer);
        chrome.tabs.update(details.tabId, { 'url': url });
    } catch (e) {
        console.error(e);
    }
}, { urls: GOOGLE_IMAGE_URLS });

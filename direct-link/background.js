const RE_SEARCH = /https?\:\/\/(www\.google\.[^\/]+)\/url\?.*/;
const FILTERS = { urls: ['<all_urls>'], types: ['main_frame'] };

function getMode() {
    return localStorage['mode'] || 'AUTO';
}

function setMode(mode) {
    localStorage['mode'] = mode;
    setModeIcon(mode);
}

function setModeIcon(mode) {
    chrome.browserAction.setIcon({ path: 'icon19-' + mode + '.png' });
}

function extractTargetUrl(sourceUrl) {
    return sourceUrl.match(/(q|url)=([^&]+)/ig) && decodeURIComponent(RegExp.$2)
}

function isActiveMode(redirectMode, requestMode) {
    return redirectMode !== 'REDIRECT' && redirectMode == requestMode
}

function isRedirectUrl(url) {
    return RE_SEARCH.test(url);
}

// 中转请求控制器
function dispatcherHandler(requestMode) {
    return function(details) { 
        const redirectMode = getMode();

        if (isActiveMode(redirectMode, requestMode) && isRedirectUrl(details.url)) {
            const targetUrl = extractTargetUrl(details.url);

            console.info(redirectMode, '=>', targetUrl);
            if (redirectMode == 'DIRECT') {
                // onBeforeRequest use requestBlocking to redirect request directly
                return { redirectUrl: targetUrl };
            } else {
                // onErrorOccurred updates the tab instead
                console.log('  REASON:'. details.error);
                return { cancel: true };
            }
        }
    }
}

chrome.webRequest.onErrorOccurred.addListener(dispatcherHandler('AUTO'), FILTERS);
chrome.webRequest.onBeforeRequest.addListener(dispatcherHandler('DIRECT'), FILTERS, ['blocking']);

setModeIcon(getMode());

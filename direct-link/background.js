const RE_SEARCH = /https?\:\/\/(www\.google\.[^\/]+)\/url\?.*/;
const FILTERS = { urls: ['<all_urls>'], types: ['main_frame', 'sub_frame'] };
const LOCALES = {
    on: {
        icon: 'icon19-on.png',
        title: '直连已启用',
        message: '将自动跳过 Google 安全检查'
    },
    off: {
        icon: 'icon19-off.png',
        title: '直连已禁用',
        message: 'Google 安全检查为你保驾护航'
    }
};

function isModeOn() {
    return localStorage['mode'] == 'on';
}

function getMode() {
    return isModeOn() ? 'on' : 'off';
}

function setMode(mode) {
    localStorage['mode'] = mode;
}

function updatePopup(event) {
    const locales = LOCALES[getMode()];

    chrome.browserAction.setIcon({ path: locales.icon });
    chrome.browserAction.setTitle({ title: `${locales.title}\n${locales.message}` });

    // Don't show notiffication on installed.
    if (!event['reason']) {
        chrome.notifications.create('crx-direct-link', {
            type: 'basic',
            iconUrl: locales.icon,
            title: locales.title,
            message: locales.message
        });
    }
}

function toggleMode(event) {
    setMode(isModeOn() ? 'off' : 'on');
    updatePopup(event);
}

function extractTargetUrl(sourceUrl) {
    return sourceUrl.match(/(q|url)=([^&]+)/ig) && decodeURIComponent(RegExp.$2)
}

function isRedirectUrl(url) {
    return RE_SEARCH.test(url);
}

function directHandler(details) {
    if (isModeOn() && isRedirectUrl(details.url)) {
        const targetUrl = extractTargetUrl(details.url);

        console.info('Direct link to', targetUrl);

        return { redirectUrl: targetUrl };
    }
}

chrome.webRequest.onBeforeRequest.addListener(directHandler, FILTERS, ['blocking']);
chrome.browserAction.onClicked.addListener(toggleMode);
chrome.runtime.onInstalled.addListener(updatePopup);
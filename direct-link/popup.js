var app = chrome.extension.getBackgroundPage(),
    mode = app.config('mode') || 'AUTO';

function modeChangeHandler() {
    app.config('mode', this.value);
}

Array.create(document.getElementsByName('mode')).forEach(function(modeNode) {
    // 选中当前模式
    if (mode === modeNode.value) modeNode.checked = 'checked';
    modeNode.addEventListener('click', modeChangeHandler, false);
});


var app = chrome.extension.getBackgroundPage(),
    mode = app.config('mode') || 'AUTO';

function modeChangeHandler() {
    app.config('mode', this.value);
}

var modeNodes = document.getElementsByName('mode');
for (var i = 0; i < modeNodes.length; i++) {
    var modeNode = modeNodes[i];
    if (mode === modeNode.value) modeNode.checked = 'checked';
    modeNode.addEventListener('click', modeChangeHandler, false);
}


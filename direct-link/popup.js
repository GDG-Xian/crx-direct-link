var app = chrome.extension.getBackgroundPage(),
    mode = app.config('mode') || 'AUTO';

function modeChangeHandler() {
    var mode = this.value;
    app.config('mode', mode);
    chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
        app.showModeIcon(tabs[0].id, mode);
    }); 
}

var modeNodes = document.getElementsByName('mode');
for (var i = 0; i < modeNodes.length; i++) {
    var modeNode = modeNodes[i];
    if (mode === modeNode.value) modeNode.checked = 'checked';
    modeNode.addEventListener('click', modeChangeHandler, false);
}


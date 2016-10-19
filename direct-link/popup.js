const app = chrome.extension.getBackgroundPage();

function modeChangeHandler() {
    let mode = this.value;
    app.setMode(mode);
}

let modeNodes = document.getElementsByName('mode');
let currentMode = app.getMode();
modeNodes.forEach(modeNode => {
  if (modeNode.value == currentMode) {
    modeNode.checked = 'checked';
  }

  modeNode.addEventListener('click', modeChangeHandler, false);
});

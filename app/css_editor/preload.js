const { contextBridge, ipcRenderer } = require('electron');

console.log("[Theme] Injected");

const utils = {
    getCss: () => {
        return ipcRenderer.sendSync('get-css');
    },

    saveCss: (css) => {
        ipcRenderer.send('save-css', css);
    },

    reloadCss: () => {
        ipcRenderer.send('css-reload');
    }
}

contextBridge.exposeInMainWorld('utils', utils);

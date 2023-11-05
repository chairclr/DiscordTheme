const { contextBridge, ipcRenderer } = require("electron");

ipcRenderer.invoke("isMainProcessAlive").then(async () => {
    console.log("[Theme] Fully Injected");

    const theme = {
        version: "1.0.0",
        enable: () => {
            ipcRenderer.send("css-enable");
        },
        disable: () => {
            ipcRenderer.send("css-disable");
        },
        reload: () => {
            if (settings.css) {
                ipcRenderer.send("css-reload");
            }
        },
        openEditor: () => {
            ipcRenderer.send("open-css");
        }
    };

    contextBridge.exposeInMainWorld("theme", theme);
});

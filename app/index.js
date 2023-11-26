const electron = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

var cssEditor = null;
var mainWindow = null;

const basePath = path.join(path.dirname(require.main.filename), "..");

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        if (entry.name.toString().startsWith(".")) {
            continue;
        }

        entry.isDirectory()
            ? copyDir(srcPath, destPath)
            : fs.copyFileSync(srcPath, destPath);
    }
}

const discordConf = path.join(os.homedir(), ".config", "discord");
const modulesPath = path.join(discordConf,
    fs
    .readdirSync(discordConf)
    .find((folder) => fs.lstatSync(path.join(discordConf, folder)).isDirectory() && fs
        .readdirSync(path.join(discordConf, folder))
        .find((folder2) => folder2 == "modules")), "modules");

console.log("Found modules path: " + modulesPath);

const themePath = path.join(modulesPath, "discord_theme");

if (fs.existsSync(themePath)) {
    fs.rmdirSync(themePath, { recursive: true });
}

copyDir(path.join(basePath, "app", "discord_theme"), themePath);

let originalAppPath = path.join(basePath, "original.asar");

const originalPackage = require(path.resolve(
    path.join(originalAppPath, "package.json")
));

require.main.filename = path.join(originalAppPath, originalPackage.main);

electron.app.setAppPath(originalAppPath);
electron.app.name = originalPackage.name;

const electronCache = require.cache[require.resolve("electron")];

const { BrowserWindow } = electron;
const propertyNames = Object.getOwnPropertyNames(electronCache.exports);

delete electronCache.exports;

const newElectron = {};
for (const propertyName of propertyNames) {
    Object.defineProperty(newElectron, propertyName, {
        ...Object.getOwnPropertyDescriptor(electron, propertyName),
        get: () =>
            propertyName === "BrowserWindow"
                ? class extends BrowserWindow {
                    constructor(opts) {

                        opts.webPreferences.devTools = true;

                        const window = new BrowserWindow(opts);

                        if (window.resizable && !mainWindow) {
                            console.log("[Theme] Found Discord window.");
                            console.log("Found modules path: " + modulesPath);

                            mainWindow = window;

                            // NOTE: loaded in order
                            const files = [ "websmack.js", "favorites.js" ];

                            window.webContents.on("dom-ready", () => {
                                window.webContents.executeJavaScript(
                                    `DiscordNative.nativeModules.requireModule("discord_theme");`
                                );

                                for (const filecontents of files) {
                                    window.webContents.executeJavaScript(fs.readFileSync(path.join(themePath, filecontents)));
                                }
                            });
                        }

                        return window;
                    }
                }
                : electron[propertyName],
    });
}

electronCache.exports = newElectron;

module.exports = require(originalAppPath);

function loadCss() {
    return fs.readFileSync(path.join(themePath, "theme.css"), "utf8");
}

function saveCss(css) {
    return fs.writeFileSync(path.join(themePath, "theme.css"), css);
}

function removeCss(window) {
    window.webContents.executeJavaScript(
        `document.getElementById("theme")?.remove?.();`
    );
}

function injectCss(window, css, id = "theme") {
    window.webContents.executeJavaScript(
        `document.body.insertAdjacentHTML("beforeend", \`<style id="${id}">${css}</style>\`);`
    );
}

electron.ipcMain.on("open-css", () => {
    if (!cssEditor) {
        cssEditor = new BrowserWindow({
            width: 1000,
            height: 800,
            autoHideMenuBar: true,
            backgroundColor: "#1e1e1e",
            webPreferences: {
                preload: path.join(
                    path.join(basePath, "app", "css_editor", "preload.js")
                ),
            },
        });

        cssEditor.loadFile(path.join(basePath, "app", "css_editor", "index.html"));
        cssEditor.on("closed", () => {
            cssEditor = null;
        });
    } else {
        cssEditor.focus();
    }
});

electron.ipcMain.handle("isMainProcessAlive", () => {
    console.log("[Theme] Injected into render process");
    
    return true;
});

electron.ipcMain.on("get-css", (event) => {
    event.returnValue = loadCss();
});

electron.ipcMain.on("save-css", (_, css) => {
    saveCss(css);
});

electron.ipcMain.on("css-enable", () => {
    console.log("[Theme] Injecting CSS.");
    injectCss(mainWindow, loadCss());
});

electron.ipcMain.on("css-disable", () => {
    console.log("[Theme] Removing CSS.");
    removeCss(mainWindow);
});

electron.ipcMain.on("css-reload", () => {
    console.log("[Theme] Reloading CSS.");
    removeCss(mainWindow);
    injectCss(mainWindow, loadCss());
});
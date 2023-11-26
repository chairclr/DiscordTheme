(() => {

    function exfil(prop, callback) {
        const protoKey = Symbol(prop);
        let hitProto = false;

        Object.defineProperty(Object.prototype, prop, {
            configurable: true,
            enumerable: false,
            set(v) {
                if (this === Object.prototype) {
                    hitProto = true;
                    Object.prototype[protoKey] = v;
                    return;
                }

                Object.defineProperty(this, prop, {
                    configurable: true,
                    writable: true,
                    enumerable: true,
                    value: v,
                });

                callback(this);
                if (!hitProto) delete Object.prototype[prop];
            },

            get() {
                return this[protoKey];
            },
        });
    }

    console.log("[Favorites] Loading websmack");

    const api = websmack.autoApi();
    const favoriteGifs = api.findByCode("d\\.FrecencyUserSettingsActionCreators\\.updateAsync\\(\"favoriteGifs\"");


    function addTargetAsFavorite(target, avatar) {
        favoriteGifs.addFavoriteGIF({
            url: target.href ?? (avatar ? target.src.replace("size=32", "size=4096") : target.src),
            src: target.dataset.safeSrc ?? target.poster ?? (avatar ? target.src.replace("size=32", "size=4096") : target.src),
            width: target.clientWidth ?? (avatar ? 128 : 160),
            height: target.clientHeight ?? (avatar ? 128 : 160),
            format: 1
        });
    }

    let focusClass = null;
    function getFocusClass() {
        if (focusClass != null)
            return focusClass;

        let messageCopyNativeLink = document.getElementById("message-copy-native-link");
        messageCopyNativeLink.dispatchEvent(new MouseEvent("mouseenter", {
            view: window,
            bubbles: true,
            cancelable: true
        }));
        messageCopyNativeLink.classList.forEach((c) => {
            if (c.indexOf("focus") != -1)
                focusClass = c;
        });

        messageCopyNativeLink.classList.remove(focusClass);

        return focusClass;
    }

    function removeAllFocus(elem) {
        elem.classList.forEach((c) => {
            if (c.indexOf("focus") != -1)
                elem.classList.remove(c);
        });

        for (child of elem.children)
            removeAllFocus(child);
    }

    function findNestedImageTag(elem) {
        for (child of elem.children) {
            if (child.nodeName != "IMG") {
                let possibleImg = findNestedImageTag(child);
                if (possibleImg != null && possibleImg != undefined)
                    return possibleImg;
            }
            else
                return child;
        }

        return null;
    }

    let fluxstore = undefined;

    function contextMenuOpen(payload) {
        if (payload.contextMenu.target.nodeName != "A" && payload.contextMenu.target.nodeName != "VIDEO" && payload.contextMenu.target.nodeName != "IMG" && payload.contextMenu.target.nodeName != "DIV")
            return;

        if (payload.contextMenu.target.nodeName == "DIV") {
            let shouldContinue = false;
            for (c of payload.contextMenu.target.classList) {
                if (c.indexOf("cover") != -1 || (c.indexOf("wrapper") != 1 && payload.contextMenu.target.role == "img")) { // prevent button from showing up on random divs
                    shouldContinue = true;
                    break;
                }
            }

            if (!shouldContinue)
                return;
        }

        let target = payload.contextMenu.target
        let avatar = false;
        if (payload.contextMenu.target.nodeName == "DIV") {
            target = payload.contextMenu.target.parentElement.querySelector("video")

            if (target == null || target == undefined) {
                target = findNestedImageTag(payload.contextMenu.target);
                avatar = true;
            }
        }

        var inserted = false;

        var tryInsert = () => {

            if (inserted) {
                return;
            }

            elem = document.querySelector("[class^=menu]");        
            
            if (!elem && !inserted) {
                console.log("[Favorites] No context menu found, tyring to insert into context menu again lol");

                setTimeout(tryInsert, 200);
            }

            console.log("[Favorites] Inserted into context menu");

            inserted = true;

            let menuItemGroup = elem.querySelector("[class^=scroller]").querySelectorAll("[role^=group]");
            let menuItems = menuItemGroup[2] ?? menuItemGroup[1] // For some context menus they are shorter and [2] is undefined
            let originalButton = menuItems.children[0];
            let originalButtonlabel = originalButton.children[0];

            let addFavoriteButton = document.createElement("div");
            addFavoriteButton.classList = originalButton.classList;
            addFavoriteButton.role = originalButton.role;
            addFavoriteButton.dataset.menuItem = true;
            addFavoriteButton.id = "message-add-to-favorites";

            let addFavoriteLabel = document.createElement("div");
            addFavoriteLabel.classList = originalButtonlabel.classList;

            let addFavoriteText = document.createTextNode("Add to Favorites");
            addFavoriteLabel.appendChild(addFavoriteText);
            addFavoriteButton.appendChild(addFavoriteText);

            addFavoriteButton.addEventListener("click", () => {
                addTargetAsFavorite(target, avatar);
                fluxstore._dispatcher.dispatch({
                    type: "CONTEXT_MENU_CLOSE",
                    contextMenu: payload.contextMenu
                });
            });

            addFavoriteButton.addEventListener("mouseenter", () => {
                removeAllFocus(elem);
                elem.setAttribute("aria-activedescendant", "message-add-to-favorites");
                addFavoriteButton.classList.add(getFocusClass());
            });

            addFavoriteButton.addEventListener("mouseleave", () => {
                addFavoriteButton.classList.remove(getFocusClass());
            });

            menuItems.appendChild(addFavoriteButton);

            let menuY = parseFloat(elem.parentElement.style.top);
            elem.parentElement.style.top = (menuY - 32) + "px";
        };

        setTimeout(tryInsert, 50);

        console.log("[Favorites] Trying to insert into context menu");
    };


    exfil("_dispatcher", (flux) => {
        fluxstore = flux;
        flux._dispatcher.subscribe("CONTEXT_MENU_OPEN", contextMenuOpen);
    });

})();

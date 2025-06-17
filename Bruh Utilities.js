// ==UserScript==
// @name         Bruh Utilities
// @description  actually good legit script for moomoo?
// @version      2
// @author       Liliu
// @match        *://*.moomoo.io/*
// @icon         https://images.steamusercontent.com/ugc/1859434388160338193/3C73C20823B3D29F123D0F5749F2869A7C575494/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false
// @require      https://cdn.jsdelivr.net/npm/msgpack-lite@0.1.26/dist/msgpack.min.js
// @require      https://greasyfork.org/scripts/423602-msgpack/code/msgpack.js
// @grant        GM_addStyle
// ==/UserScript==


const PACKET_MAP = {
    "33": "9",
    "ch": "6",
    "pp": "0",
    "13c": "c",
    "f": "9",
    "a": "9",
    "d": "F",
    "G": "z"
}
let originalSend = WebSocket.prototype.send;

WebSocket.prototype.send = new Proxy(originalSend, {
    apply: ((target, websocket, argsList) => {
        let decoded = msgpack.decode(new Uint8Array(argsList[0]));

        if (PACKET_MAP.hasOwnProperty(decoded[0])) {
            decoded[0] = PACKET_MAP[decoded[0]];
        }

        return target.apply(websocket, [msgpack.encode(decoded)]);
    })
});

(() => {
    // Constants and Variables
    let ws = null;
    let x = 0;
    let y = 0;
    let angle = 0;
    let msgpack5 = window.msgpack;
    let scale = 45;
    let placeOffset = 5;
    let autoMill = false;
    let autoSpawnpad = false;
    let placeMacro = true;
    const inventory = {
        primary: null,
        secondary: null,
        food: null,
        wall: null,
        spike: null,
        mill: null,
        mine: null,
        boostPad: null,
        trap: null,
        turret: null,
        spawnpad: null
    };
    const vars = {
        camX: 0,
        camY: 0
    };
    const myPlayer = {
        sid: null,
        x: null,
        y: null,
        dir: null,
        buildIndex: null,
        weaponIndex: null,
        weaponVariant: null,
        team: null,
        isLeader: null,
        skinIndex: null,
        tailIndex: null,
        iconIndex: null
    };

    // Helper Functions

    /**
    * Utility function to join arrays
    * @param {Array} message - The array to join
    * @returns {Array} - Joined array
    */
    const join = message => Array.isArray(message) ? [...message] : [...message];

    /**`
    * Hook function for WebSocket
    * @param {object} ms - WebSocket message
    */
    const hookWS = ms => {
        let tmpData = msgpack5.decode(new Uint8Array(ms.data));
        if ((ms = undefined) || (tmpData = (ms = tmpData.length > 1 ? [tmpData[0], ...join(tmpData[1])] : tmpData)[0]) || ms) {
            if ("C" == tmpData && null === myPlayer.sid && (myPlayer.sid = ms[1]) || "a" == tmpData) {
                for (tmpData = 0; tmpData < ms[1].length / 13; tmpData++) {
                    let data = ms[1].slice(13 * tmpData, 13 * (tmpData + 1));
                    if (data[0] == myPlayer.sid) {
                        Object.assign(myPlayer, {
                            x: data[1],
                            y: data[2],
                            dir: data[3],
                            buildIndex: data[4],
                            weaponIndex: data[5],
                            weaponVariant: data[6],
                            team: data[7],
                            isLeader: data[8],
                            skinIndex: data[9],
                            tailIndex: data[10],
                            iconIndex: data[11]
                        });
                    }
                }
            }
            vars.camX || (vars.camX = myPlayer.x);
            vars.camY || (vars.camY = myPlayer.y);

            cacheItems();
            if (y !== myPlayer.y || x !== myPlayer.x) {
                // automill code
                if (Math.atan2(y - myPlayer.y, x - myPlayer.x) < (scale + placeOffset) * 2) {
                    if (autoMill) {
                        let angle = Math.atan2(y - myPlayer.y, x - myPlayer.x);
                        millPlace(inventory.mill, angle + Math.PI / 2.5);
                        millPlace(inventory.mill, angle);
                        millPlace(inventory.mill, angle - Math.PI / 2.5);
                    }
                    x = myPlayer.x;
                    y = myPlayer.y;
                }
            }
            cacheItems();
            if (y !== myPlayer.y || x !== myPlayer.x) {
                // autoSpawnbad code
                if (Math.atan2(y - myPlayer.y, x - myPlayer.x) < (scale + placeOffset) * 2) {
                    if (autoSpawnpad) {
                        let angle = Math.atan2(y - myPlayer.y, x - myPlayer.x);
                        millPlace(inventory.spawnpad, angle + Math.PI / 2.5);
                        millPlace(inventory.spawnpad, angle);
                        millPlace(inventory.spawnpad, angle - Math.PI / 2.5);
                    }
                    x = myPlayer.x;
                    y = myPlayer.y;
                }
            }
            cacheItems();
        }
    };
    /**
    * Function to emit a packet
    * @param {string} event - Event type
    * @param {*} a - Parameter a
    * @param {*} b - Parameter b
    * @param {*} c - Parameter c
    * @param {*} m - Parameter m
    * @param {*} r - Parameter r
    */
    const emit = (event, a, b, c, m, r) => ws.send(Uint8Array.from([...msgpack5.encode([event, [a, b, c, m, r]])]));
    /**
    * Function to place an item
    * @param {number} itemID - The ID of the item to place
    * @param {number} angle - The angle to place the item at
    */
    const place = (itemID, angle) => {
        emit("G", itemID, false);
        emit("d", 1, angle);
        if (!document.getElementById('legitPlace').checked) {
            emit("G", myPlayer.weaponIndex, true);
        }
    };

    const millPlace = (event, l) => {
        emit("G", event, false);
        emit("d", 1, l);
        emit("d", 0, l);
        emit("G", myPlayer.weaponIndex, true);
    };
    /**
    * Function to send a chat message
    * @param {string} event - The chat message
    */
    const chat = event => emit("6", event);

    /**
    * Cache the player's items
    */
    const cacheItems = () => {
        for (let c = 0; c < 9; c++) {
            var _document$getElementB;
            if (((_document$getElementB = document.getElementById(`actionBarItem${c}`)) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.offsetParent) !== null) {
                inventory.primary = c;
            }
        }
        for (let s = 9; s < 16; s++) {
            var _document$getElementB2;
            if (((_document$getElementB2 = document.getElementById(`actionBarItem${s}`)) === null || _document$getElementB2 === void 0 ? void 0 : _document$getElementB2.offsetParent) !== null) {
                inventory.secondary = s;
            }
        }
        for (let P = 16; P < 19; P++) {
            var _document$getElementB3;
            if (((_document$getElementB3 = document.getElementById(`actionBarItem${P}`)) === null || _document$getElementB3 === void 0 ? void 0 : _document$getElementB3.offsetParent) !== null) {
                inventory.food = P - 16;
            }
        }
        for (let f = 19; f < 22; f++) {
            var _document$getElementB4;
            if (((_document$getElementB4 = document.getElementById(`actionBarItem${f}`)) === null || _document$getElementB4 === void 0 ? void 0 : _document$getElementB4.offsetParent) !== null) {
                inventory.wall = f - 16;
            }
        }
        for (let _ = 22; _ < 26; _++) {
            var _document$getElementB5;
            if (((_document$getElementB5 = document.getElementById(`actionBarItem${_}`)) === null || _document$getElementB5 === void 0 ? void 0 : _document$getElementB5.offsetParent) !== null) {
                inventory.spike = _ - 16;
            }
        }
        for (let u = 26; u < 29; u++) {
            var _document$getElementB6;
            if (((_document$getElementB6 = document.getElementById(`actionBarItem${u}`)) === null || _document$getElementB6 === void 0 ? void 0 : _document$getElementB6.offsetParent) !== null) {
                inventory.mill = u - 16;
            }
        }
        for (let I = 29; I < 31; I++) {
            var _document$getElementB7;
            if (((_document$getElementB7 = document.getElementById(`actionBarItem${I}`)) === null || _document$getElementB7 === void 0 ? void 0 : _document$getElementB7.offsetParent) !== null) {
                inventory.mine = I - 16;
            }
        }
        for (let p = 31; p < 33; p++) {
            var _document$getElementB8;
            if (((_document$getElementB8 = document.getElementById(`actionBarItem${p}`)) === null || _document$getElementB8 === void 0 ? void 0 : _document$getElementB8.offsetParent) !== null) {
                inventory.boostPad = p - 16;
            }
        }
        for (let x = 31; x < 33; x++) {
            var _document$getElementB9;
            if (((_document$getElementB9 = document.getElementById(`actionBarItem${x}`)) === null || _document$getElementB9 === void 0 ? void 0 : _document$getElementB9.offsetParent) !== null && x !== 36) {
                inventory.trap = x - 16;
            }
        }
        for (let g = 29; g < 31; g++) {
            var _document$getElementB10;
            if (((_document$getElementB10 = document.getElementById(`actionBarItem${g}`)) === null || _document$getElementB10 === void 0 ? void 0 : _document$getElementB10.offsetParent) !== null && g !== 36) {
                inventory.turret = g - 16;
            }
        }
        inventory.spawnpad = 36;
    };

    // Override WebSocket's send method
    document.msgpack = window.msgpack;
    WebSocket.prototype.oldSend = WebSocket.prototype.send;
    WebSocket.prototype.send = function (event) {
        ws || (document.ws = this, ws = this, document.ws.addEventListener("message", hookWS));
        this.oldSend(event);
    };

    window.myPlayer = myPlayer;
    window.place = place;
    window.inventory = inventory;
})();

const popupHTML = `
        <div id="modern-popup-overlay">
            <div id="modern-popup-container">
                <div id="modern-popup-header">
                    <h2>Bruh Utility Script</h2>
                    <button id="modern-popup-close">&times;</button>
                </div>
                <div id="modern-popup-content">
                    <p>Cool shit will go here</p>
                    <p>yurrr</p>
                </div>
            </div>
        </div>
    `;

const popupCSS = `
        #modern-popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        }

        #modern-popup-container {
            background: linear-gradient(135deg, #1e1e1e, #3c1a2b, #f06292);
            color: #ffffff;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 500px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            transform: scale(0.95);
            transition: transform 0.3s ease-in-out;
        }

        #modern-popup-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 25px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        #modern-popup-header h2 {
            margin: 0;
            font-size: 1.5em;
            font-weight: 600;
        }

        #modern-popup-close {
            background: transparent;
            border: none;
            color: #ffffff;
            font-size: 2em;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }

        #modern-popup-close:hover {
            color: #f06292;
        }

        #modern-popup-content {
            padding: 25px;
            line-height: 1.6;
        }
    `;

document.body.insertAdjacentHTML('beforeend', popupHTML);
GM_addStyle(popupCSS);

const popupOverlay = document.getElementById('modern-popup-overlay');
const popupContainer = document.getElementById('modern-popup-container');
const closeButton = document.getElementById('modern-popup-close');

function showPopup() {
    popupOverlay.style.display = 'flex';
    setTimeout(() => {
        popupOverlay.style.opacity = '1';
        popupContainer.style.transform = 'scale(1)';
    }, 10);
}

function hidePopup() {
    popupOverlay.style.opacity = '0';
    popupContainer.style.transform = 'scale(0.95)';
    setTimeout(() => {
        popupOverlay.style.display = 'none';
    }, 300);
}

document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        if (popupOverlay.style.display === 'flex') {
            hidePopup();
        } else {
            showPopup();
        }
    }
});

closeButton.addEventListener('click', hidePopup);

popupOverlay.addEventListener('click', function(event) {
    if (event.target === popupOverlay) {
        hidePopup();
    }
});

let applied = false;

const style = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

        :root {
            --apple-green: #f06292;
            --apple-green-dark: #689F38;
            --apple-red: #e74c3c;
            --card-bg: rgba(35, 35, 35, 0.75);
            --text-light: #ecf0f1;
            --border-light: rgba(255, 255, 255, 0.2);
        }



        #menuContainer {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            padding: 20px;
            box-sizing: border-box;
        }

        #adCard, #promoImgHolder, #wideAdCard { display: none !important; }

        #newShit {
            display: flex;
            flex-direction: column;
            align-items: center; /* This horizontally centers the flex items (the cards) */
            gap: 25px;
            width: 100%;
            max-width: 500px;
            animation: fadeIn 0.8s ease-in-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Set cards to take the full width of the column for a uniform look */
        .menuCard, #gameName {
             width: 100%;
             box-sizing: border-box;
        }

        .menuCard {
            background: var(--card-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--border-light);
            border-radius: 16px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            color: var(--text-light);
            padding: 25px;
        }

        #gameName {
            font-size: 5em;
            font-weight: 700;
            text-align: center;
            background: linear-gradient(45deg, var(--apple-red), var(--apple-green));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 25px rgba(0,0,0,0.4);
            padding: 10px 0;
        }

        .menuHeader {
            font-size: 1.5em;
            font-weight: 600;
            color: var(--apple-red);
            border-bottom: 2px solid var(--apple-red);
            padding-bottom: 8px;
            margin-bottom: 15px;
        }

        #nameInput {
            background-color: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-light);
            border-radius: 8px;
            color: var(--text-light);
            font-size: 1.2em;
            padding: 14px;
            text-align: center;
        }
        #nameInput:focus {
            outline: none;
            border-color: var(--apple-green);
            box-shadow: 0 0 10px var(--apple-green);
        }

        #enterGame {
            background: linear-gradient(45deg, var(--apple-green-dark), var(--apple-green));
            border: none;
            border-radius: 8px;
            font-size: 1.6em;
            font-weight: 600;
            padding: 16px;
            transition: all 0.3s ease;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            color: white;
        }
        #enterGame:not(.disabled):hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(139, 195, 74, 0.4);
        }
        #enterGame.disabled {
            background: #576574;
            cursor: not-allowed;
        }

        #serverBrowser select {
            width: 100%; padding: 12px; background-color: rgba(0, 0, 0, 0.3);
            color: var(--text-light); border: 1px solid var(--border-light); border-radius: 8px;
        }

        .skinColorItem {
            border-radius: 50%; transition: all 0.2s ease; border: 3px solid transparent;
            box-shadow: 0 2px 5px rgba(0,0,0,0.5);
        }
        .skinColorItem.activeSkin, .skinColorItem:hover {
            transform: scale(1.2); border-color: var(--apple-green);
        }
    `;

function add(css) {
    const head = document.head || document.getElementsByTagName('head')[0];
    if (head) {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    }
}

function apply(intervalId) {
    if (applied) {
        clearInterval(intervalId);
        return;
    }

    document.getElementById("gameName").innerHTML = "Bruh Utilities";

    const linksContainer2 = document.getElementById('linksContainer2');
    linksContainer2.style.visibility = 'hidden';

    const partyButton = document.getElementById('partyButton');
    partyButton.style.visibility = 'hidden';


    const joinPartyButton = document.getElementById('joinPartyButton');
    joinPartyButton.style.visibility = 'hidden';

    const guideCard = document.getElementById('guideCard');
    if (!guideCard) return;
    add(style);

    const serverCard = document.createElement('div');
    serverCard.className = 'menuCard';
    serverCard.id = 'serverCard';

    const headers = guideCard.getElementsByClassName('menuHeader');
    const serverBrowser = document.getElementById('serverBrowser');
    const altServer = document.getElementById('altServer');
    let serverHeader = null;

    for (const header of headers) {
        if (header.textContent.trim() === 'Servers') {
            serverHeader = header;
            break;
        }
    }

    if (serverHeader && serverBrowser && altServer) {
        serverCard.appendChild(serverHeader);
        serverCard.appendChild(serverBrowser);
        serverCard.appendChild(altServer);
    }

    for (const header of Array.from(headers)) {
        const text = header.textContent.trim();
        if (text === 'How To Play' || text === 'Controls') {
            if (header.nextElementSibling) {
                header.nextElementSibling.style.display = 'none';
            }
            header.style.display = 'none';
        }
    }

    const newShit = document.createElement('div');
    newShit.id = 'newShit';

    const gameName = document.getElementById('gameName');
    const setupCard = document.getElementById('setupCard');

    if (gameName) newShit.appendChild(gameName);
    if (setupCard) newShit.appendChild(setupCard);
    if (serverCard.hasChildNodes()) newShit.appendChild(serverCard);
    newShit.appendChild(guideCard);

    const menuContainer = document.getElementById('menuContainer');
    const menuCardHolder = document.getElementById('menuCardHolder');
    const rightCardHolder = document.getElementById('rightCardHolder');

    if (menuContainer && menuCardHolder && rightCardHolder) {
        menuContainer.innerHTML = '';
        menuContainer.appendChild(newShit);
    }

    const showPing = document.getElementById('showPing');
    if (showPing && !showPing.checked) {
        showPing.click();
    }

    applied = true;
    clearInterval(intervalId);
}

const check = setInterval(() => {
    const mainMenu = document.getElementById('mainMenu');
    if (mainMenu && mainMenu.style.display === 'block') {
        apply(check);
    }
}, 100);

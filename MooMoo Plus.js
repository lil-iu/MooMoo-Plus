// ==UserScript==
// @name         MooMoo Plus
// @description  hey thats pretty cool
// @author       Liliu
// @version      1
// @match        *://*.moomoo.io/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    (function(originalWebSocket) {
        window.WebSocket = function(url, protocols) {
            const ws = new originalWebSocket(url, protocols);

            ws.addEventListener('message', function(event) {
                console.log('WebSocket Message Received:', event.data);
            });

            ws.addEventListener('open', function(event) {
                console.log('WebSocket Connection Established.');
            });

            ws.addEventListener('close', function(event) {
                console.log('WebSocket Connection Closed.');
            });

            ws.addEventListener('error', function(event) {
                console.error('WebSocket Error:', event);
            });

            return ws;
        };
    })(window.WebSocket);

    let applied = false;

    const style = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

        :root {
            --apple-green: #8BC34A;
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

        document.getElementById("gameName").innerHTML = "MooMoo Plus";

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

})();
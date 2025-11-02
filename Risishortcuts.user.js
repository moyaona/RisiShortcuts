// ==UserScript==
// @name         Risishortcuts
// @namespace    RisishortcutsJVC
// @version      1.0
// @description  Raccourci :texte: pour insérer un sticker Risibank.
// @author       moyaona
// @match        https://www.jeuxvideo.com/forums/*
// @match        https://www.jeuxvideo.com/recherche/forums/*
// @match        https://www.jeuxvideo.com/messages-prives/*
// @match        https://risibank.fr/embed*
// @downloadURL   https://github.com/moyaona/RisiShortcuts/raw/refs/heads/main/Risishortcuts.user.js
// @updateURL     https://github.com/moyaona/RisiShortcuts/raw/refs/heads/main/Risishortcuts.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @icon         https://image.noelshack.com/fichiers/2025/44/7/1762109438-risishortcut-script.png
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'risishortcuts_data_v2';

    if (window.location.hostname === 'www.jeuxvideo.com') {

                const jvcSmileyCodes = new Set([
            ')', '-)', 'hap', '-)))', 'content', 'oui', 'cool', 'rire', '-D', 'rire2',
            'o))', 'ok', 'sournois', 'gni', 'merci', 'rechercher', 'gne', 'hs', 'cimer',
            'siffle', 'snif', 'snif2', 'ouch', 'ouch2', 'p)', '(', '-(', '-((', 'nonnon',
            'non2', 'nah', 'non', 'hum', 'play', 'svp', 'hello', 'lol', 'banzai', 'ddb',
            'opps', 'gba', 'bravo', 'pacg', 'pacd', '-p', 'peur', 'coeur', 'fou', 'fier',
            'sarcastic', 'doute', 'malade', 'ange', 'desole', 'sors', 'up', 'dpdr', 'bave',
            'pave', 'g)', 'd)', 'cd', 'cute', 'noel', 'question', 'mort', 'sleep', 'honte',
            'monoeil', 'rouge', 'fete', 'diable', 'spoiler', 'salut', 'bye', 'dehors', 'pf',
            'objection'
        ]);

        GM_addStyle(`
            #rs-menu-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.2); z-index: 10000; display: none; }
            #rs-menu-modal {
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: rgba(47, 49, 54, 0.3);
                -webkit-backdrop-filter: blur(16px);
                backdrop-filter: blur(16px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: #dcddde;
                width: 90%; max-width: 550px; padding: 20px;
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                font-family: Arial, sans-serif;
            }
            #rs-menu-modal h3 { margin-top: 0; border-bottom: 1px solid #444; padding-bottom: 10px; }
            .rs-close-btn { position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; color: #8e9297; cursor: pointer; padding: 0; line-height: 1; transition: color 0.2s, transform 0.1s; }
            .rs-close-btn:hover { color: #fff; }
            .rs-close-btn:active { transform: scale(0.9); }
            #rs-notification { background: #40444b; padding: 10px; border-radius: 5px; margin-bottom: 15px; text-align: center; font-weight: bold; display: none; transition: opacity 0.3s; }
            #rs-notification.success { background: #22a55b; color: white; }
            #rs-notification.error { background: #f04747; color: white; }
            #rs-shortcuts-list { list-style: none; padding: 0; margin: 0; max-height: 45vh; overflow-y: auto; }
            #rs-shortcuts-list li { display: grid; grid-template-columns: 50px auto 1fr auto 95px; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid #40444b; }
            #rs-shortcuts-list li span.colon { font-size: 1.2em; color: #8e9297; }
            #rs-shortcuts-list .rs-buttons { display: flex; gap: 5px; }
            #rs-shortcuts-list img { width: 50px; height: auto; background: #40444b; border-radius: 4px; }
            #rs-shortcuts-list input { background: #40444b; border: 1px solid #222; color: white; padding: 8px; border-radius: 3px; width: 100%; text-align: center; }
            #rs-menu-modal button { background: #5865f2; border: none; color: white; padding: 8px 12px; cursor: pointer; transition: background 0.2s, transform 0.1s; border-radius: 3px; }
            #rs-menu-modal button:active { transform: scale(0.96) translateY(1px); }
            .rs-save-btn { background: #22a55b !important; } .rs-save-btn:hover { background: #1a8448 !important; }
            .rs-remove-btn { background: #f04747 !important; } .rs-remove-btn:hover { background: #c03939 !important; }
            #rs-add-sticker-btn { width: 100%; margin-top: 15px; padding: 12px; font-weight: bold; background: #5865f2; }
            #rs-add-sticker-btn:hover { background: #4752c4; }
            #rs-selection-mode-notice { position: fixed; top: 100px; left: 50%; transform: translateX(-50%); background-color: #f7734a; color: white; padding: 10px 20px; border-radius: 5px; z-index: 9999; font-weight: bold; display: none; }
        `);

        document.body.insertAdjacentHTML('beforeend', `
            <div id="rs-selection-mode-notice">Cliquez sur '+' pour ajouter le sticker.</div>
            <div id="rs-menu-overlay">
                <div id="rs-menu-modal">
                    <button id="rs-close-btn" class="rs-close-btn">&times;</button>
                    <h3>Configuration RisiShortcuts</h3>
                    <div id="rs-notification"></div>
                    <ul id="rs-shortcuts-list"></ul>
                    <button id="rs-add-sticker-btn">AJOUTER UN STICKER</button>
                </div>
            </div>
        `);

        const overlay = document.getElementById('rs-menu-overlay');
        const listElement = document.getElementById('rs-shortcuts-list');
        const addStickerBtn = document.getElementById('rs-add-sticker-btn');
        const closeBtn = document.getElementById('rs-close-btn');
        const selectionNotice = document.getElementById('rs-selection-mode-notice');
        const notification = document.getElementById('rs-notification');
        let notificationTimeout;

        function showNotification(message, type = 'success', duration = 2500) {
            clearTimeout(notificationTimeout);
            notification.textContent = message;
            notification.className = type;
            notification.style.display = 'block';
            notificationTimeout = setTimeout(() => {
                notification.style.display = 'none';
            }, duration);
        }

        const getShortcuts = () => GM_getValue(STORAGE_KEY, {});
        const saveShortcuts = (shortcuts) => GM_setValue(STORAGE_KEY, shortcuts);

        function renderList() {
            const shortcuts = getShortcuts();
            listElement.innerHTML = '';
            const sortedCodes = Object.keys(shortcuts).sort((a, b) => {
                if (a.startsWith('sticker_') && !b.startsWith('sticker_')) return -1;
                if (!a.startsWith('sticker_') && b.startsWith('sticker_')) return 1;
                return a.localeCompare(b);
            });
            for (const code of sortedCodes) {
                const data = shortcuts[code];
                const li = document.createElement('li');
                li.dataset.code = code;
                li.innerHTML = `
                    <img src="${data.thumbUrl}" alt="${code}">
                    <span class="colon">:</span>
                    <input type="text" value="${code.startsWith('sticker_') ? '' : code}" placeholder="code...">
                    <span class="colon">:</span>
                    <div class="rs-buttons">
                        <button class="rs-save-btn" title="Sauvegarder">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.828a2 2 0 0 0-.586-1.414l-1.828-1.828A2 2 0 0 0 16.172 4H15M8 4v4a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4M8 4h7M7 17v-3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3"/></svg>
                        </button>
                        <button class="rs-remove-btn" title="Supprimer">✕</button>
                    </div>
                `;
                listElement.appendChild(li);
            }
        }

        function openMenu() { renderList(); overlay.style.display = 'block'; }
        function closeMenu() { stopSelectionMode(); overlay.style.display = 'none'; }

        function startSelectionMode() {
            const iframe = document.querySelector('#risibank-container iframe');
            if (!iframe) { showNotification("L'interface Risibank doit être visible.", 'error'); return; }
            closeMenu();
            selectionNotice.style.display = 'block';
            iframe.contentWindow.postMessage({ type: 'RS_START_SELECTION' }, 'https://risibank.fr');
        }

        function stopSelectionMode() {
            const iframe = document.querySelector('#risibank-container iframe');
            selectionNotice.style.display = 'none';
            if (iframe) { iframe.contentWindow.postMessage({ type: 'RS_STOP_SELECTION' }, 'https://risibank.fr'); }
        }

        listElement.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;
            const li = button.closest('li');
            if (!li) return;

            if (button.classList.contains('rs-save-btn')) {
                const input = li.querySelector('input');
                const oldCode = li.dataset.code;
                const newCode = input.value.trim();
                const shortcuts = getShortcuts();

                if (jvcSmileyCodes.has(newCode)) {
                    if (!confirm(`Le code ":${newCode}:" est déjà utilisé par un smiley JVC.\n\nVotre sticker remplacera ce smiley. Voulez-vous continuer ?`)) {
                        return;
                    }
                }

                const invalidCharsRegex = /[^\p{L}0-9_()+-]/gu;
                const invalidChars = newCode.match(invalidCharsRegex);
                if (invalidChars) {
                    const uniqueInvalidChars = [...new Set(invalidChars)];
                    showNotification(`Caractères non autorisés : ${uniqueInvalidChars.join(' ')}`, 'error', 4000);
                    return;
                }
                if (!newCode) { showNotification("Le code ne peut pas être vide.", 'error'); return; }
                if (shortcuts[newCode] && oldCode !== newCode) {
                    showNotification("Ce code est déjà utilisé.", 'error');
                    input.value = oldCode.startsWith('sticker_') ? '' : oldCode;
                    return;
                }
                const data = shortcuts[oldCode];
                delete shortcuts[oldCode];
                shortcuts[newCode] = data;
                saveShortcuts(shortcuts);
                li.dataset.code = newCode;
                li.querySelector('img').alt = newCode;
                input.value = newCode;
                showNotification(`Raccourci ':${newCode}:' sauvegardé !`, 'success');
            }
            if (button.classList.contains('rs-remove-btn')) {
                if (confirm("Voulez-vous vraiment supprimer ce sticker ?")) {
                    const code = li.dataset.code;
                    const shortcuts = getShortcuts();
                    delete shortcuts[code];
                    saveShortcuts(shortcuts);
                    li.remove();
                    showNotification('Raccourci supprimé.', 'success');
                }
            }
        });

        addStickerBtn.onclick = startSelectionMode;
        overlay.onclick = (e) => { if (e.target === overlay) closeMenu(); };
        closeBtn.onclick = closeMenu;

        window.addEventListener('message', (event) => {
            if (event.origin !== 'https://risibank.fr' || event.data.type !== 'RS_STICKER_SELECTED') return;
            const { fullUrl, thumbUrl } = event.data.payload;
            const shortcuts = getShortcuts();
            const existingCode = Object.keys(shortcuts).find(c => shortcuts[c].fullUrl === fullUrl);
            openMenu();
            if (existingCode) {
                showNotification(`Ce sticker est déjà enregistré : ':${existingCode}:'.`, 'error');
            } else {
                const tempCode = `sticker_${Date.now()}`;
                shortcuts[tempCode] = { fullUrl, thumbUrl };
                saveShortcuts(shortcuts);
                renderList();
                showNotification('Sticker ajouté ! Définissez son code et sauvegardez.', 'success', 15000);
            }
            stopSelectionMode();
            listElement.scrollTop = 0;
        });

        function setReactInputValue(element, value) {
            const proto = Object.getPrototypeOf(element);
            const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
            setter.call(element, value);
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }

        function escapeRegExp(string) {

            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        }



        function handleTextAreaInput(e) {

            const textarea = e.target;

            const originalText = textarea.value;

            const shortcuts = getShortcuts();

            const userCodes = Object.keys(shortcuts);



            let newText = originalText;

            let replacementMade = false;



            // On parcourt chaque code enregistré par l'utilisateur

            for (const code of userCodes) {

                const fullPattern = `:${code}:`;

                // On crée une expression régulière pour trouver toutes les occurrences de ce code spécifique

                const regex = new RegExp(escapeRegExp(fullPattern), 'g');



                if (newText.includes(fullPattern)) {

                    newText = newText.replace(regex, shortcuts[code].fullUrl + ' ');

                    replacementMade = true;

                }

            }



            // On met à jour la zone de texte uniquement si un remplacement a eu lieu

            if (replacementMade) {

                setReactInputValue(textarea, newText);

                setTimeout(() => {

                    textarea.selectionStart = textarea.selectionEnd = newText.length;

                }, 0);

            }

        }

        const observer = new MutationObserver(() => {
            const risibankOptionsBtn = document.querySelector('.risibank-open-options');
            if (risibankOptionsBtn && !document.getElementById('rs-open-menu-btn')) {
                const menuBtn = document.createElement('button');
                menuBtn.id = 'rs-open-menu-btn'; menuBtn.type = 'button'; menuBtn.title = 'Configurer RisiShortcuts';
                menuBtn.className = 'buttonsEditor__button';
                menuBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.5 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-2zM12 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zM2 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zM1.5 8a.5.5 0 0 1 .5-.5h12a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-12a.5.5 0 0 1-.5-.5v-4z"/></svg>`;
                menuBtn.onclick = openMenu;
                risibankOptionsBtn.parentNode.appendChild(menuBtn);
            }
            const textarea = document.querySelector('.messageEditor__edit');
            if (textarea && !textarea.dataset.risishortcut) {
                textarea.dataset.risishortcut = 'true';
                textarea.addEventListener('input', handleTextAreaInput);
            }
            if(risibankOptionsBtn && textarea) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (window.location.hostname === 'risibank.fr' && window.location.pathname.startsWith('/embed')) {
        GM_addStyle(`
            .shaking-element { position: relative; }
            .rs-add-icon {
                position: absolute; bottom: 2px; right: 2px; width: 22px; height: 22px;
                background-color: #f04747; color: white; border-radius: 50%;
                border: 2px solid white; cursor: pointer; z-index: 10;
                display: flex; align-items: center; justify-content: center;
                font-size: 22px; font-weight: bold; line-height: 1; padding: 0;
                padding-bottom: 4px; box-sizing: border-box;
            }
        `);
        let iframeObserver = null;

        function addPlusIcons() {
            document.querySelectorAll('.shaking-element').forEach(container => {
                if (container.querySelector('.rs-add-icon')) return;
                const icon = document.createElement('div');
                icon.className = 'rs-add-icon'; icon.textContent = '+';
                icon.onclick = (e) => {
                    e.preventDefault(); e.stopPropagation();
                    if (container.__vue__ && container.__vue__.media && container.__vue__.media.source_url) {
                        const fullUrl = container.__vue__.media.source_url;
                        const thumbUrl = container.querySelector('img').src;
                        window.parent.postMessage({ type: 'RS_STICKER_SELECTED', payload: { fullUrl, thumbUrl } }, 'https://www.jeuxvideo.com');
                    }
                };
                container.appendChild(icon);
            });
        }
        function removePlusIcons() { document.querySelectorAll('.rs-add-icon').forEach(icon => icon.remove()); }

        window.addEventListener('message', (event) => {
            if (event.origin !== 'https://www.jeuxvideo.com' || !event.data.type) return;
            switch (event.data.type) {
                case 'RS_START_SELECTION':
                    addPlusIcons();
                    iframeObserver = new MutationObserver(addPlusIcons);
                    iframeObserver.observe(document.body, { childList: true, subtree: true });
                    break;
                case 'RS_STOP_SELECTION':
                    if (iframeObserver) iframeObserver.disconnect();
                    removePlusIcons();
                    break;
            }
        });
    }
})();

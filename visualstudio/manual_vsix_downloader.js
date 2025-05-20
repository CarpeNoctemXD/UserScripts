// ==UserScript==
// @name         VS Code Extension (VSIX) Downloader - with Version Selector
// @namespace    https://github.com/CarpeNoctemXD
// @version      0.4.7
// @description  Adds a version selector to download any VSIX version from the Marketplace.
// @author       CarpeNoctemXD <https://github.com/CarpeNoctemXD>
// @match        https://marketplace.visualstudio.com/items?itemName=*
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://marketplace.visualstudio.com
// @updateURL    https://github.com/CarpeNoctemXD/UserScripts/raw/main/visualstudio/manual_vsix_downloader.js
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    async function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const itemName = urlParams.get('itemName');
        if (!itemName || !itemName.includes('.')) return;

        const [publisher, extension] = itemName.split('.');

        const button = document.createElement('button');
        button.textContent = 'Download VSIX (Select Version)';
        button.style.cssText = `
            position: fixed;
            top: 40px;
            right: 20px;
            background: #0078d4;
            color: white;
            border: none;
            padding: 10px 18px;
            border-radius: 5px;
            font-size: 14px;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        `;

        button.addEventListener('click', async () => {
            window.location.hash = 'version-history';

            // Wait for version history table to load
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Collect all versions and dates
            const rows = document.querySelectorAll('.version-history-table-body .version-history-container-row');
            if (!rows || rows.length === 0) {
                showPopupMessage('Failed to retrieve version history.', true);
                return;
            }

            const versions = [];
            rows.forEach(row => {
                const versionEl = row.querySelector('.version-history-container-column:nth-child(1)');
                const dateEl = row.querySelector('.version-history-container-column:nth-child(3)');

                if (versionEl && dateEl) {
                    const version = versionEl.textContent.trim();
                    const dateText = dateEl.textContent.trim();
                    versions.push({ version, dateText });
                }
            });

            if (versions.length === 0) {
                showPopupMessage('No versions found.', true);
                return;
            }

            // Create popup overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.45);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
                opacity: 0;
                transition: opacity 0.25s ease;
            `;
            setTimeout(() => { overlay.style.opacity = '1'; }, 10);

            // Popup container
            const popup = document.createElement('div');
            popup.style.cssText = `
                background: #fff;
                border-radius: 12px;
                padding: 26px 22px 18px 22px;
                max-height: 70vh;
                overflow-y: auto;
                width: 340px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.22);
                font-family: 'Segoe UI', Arial, sans-serif;
                position: relative;
                animation: fadeInPopup 0.3s;
            `;

            // Close button
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            closeBtn.title = 'Close';
            closeBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 14px;
                background: none;
                border: none;
                color: #888;
                font-size: 22px;
                cursor: pointer;
                padding: 0;
                line-height: 1;
                transition: color 0.2s;
            `;
            closeBtn.addEventListener('mouseenter', () => closeBtn.style.color = '#d32f2f');
            closeBtn.addEventListener('mouseleave', () => closeBtn.style.color = '#888');
            closeBtn.addEventListener('click', () => document.body.removeChild(overlay));
            popup.appendChild(closeBtn);

            const title = document.createElement('h3');
            title.textContent = `Select version to download (${itemName})`;
            title.style.cssText = 'margin-top:0;margin-bottom:18px;font-size:18px;font-weight:600;color:#222;letter-spacing:0.2px;';
            popup.appendChild(title);

            // Version list
            versions.forEach(({ version, dateText }, idx) => {
                const btn = document.createElement('button');
                if (idx === 0) {
                    btn.style.cssText = `
                        display: flex;
                        align-items: center;
                        justify-content: flex-start;
                        width: 100%;
                        margin: 10px 0 28px 0;
                        padding: 20px 32px 20px 18px;
                        background: linear-gradient(90deg, #8e24aa 0%, #7c4dff 100%);
                        color: #fff;
                        border: 3.5px solid #7c4dff;
                        border-radius: 14px;
                        cursor: pointer;
                        text-align: left;
                        font-size: 17px;
                        font-family: inherit;
                        font-weight: bold;
                        box-shadow: 0 8px 32px rgba(124,77,255,0.18);
                        position: relative;
                        transition: background 0.18s, box-shadow 0.18s, border 0.18s;
                        outline: none;
                        gap: 0;
                        overflow: hidden;
                    `;
                    // Use a span for the text to ensure left alignment and no overlap
                    const textSpan = document.createElement('span');
                    textSpan.textContent = `${version} — ${dateText}`;
                    textSpan.style.cssText = 'flex:1; text-align:left; white-space:normal; word-break:break-word; z-index:1;';
                    btn.textContent = '';
                    btn.appendChild(textSpan);
                    const latestTag = document.createElement('span');
                    latestTag.textContent = 'Latest';
                    latestTag.style.cssText = 'background:#fff;color:#7c4dff;font-size:14px;padding:2.5px 12px;border-radius:16px;position:absolute;top:16px;right:24px;letter-spacing:0.5px;font-weight:bold;box-shadow:0 2px 8px rgba(124,77,255,0.18);border:2px solid #7c4dff;z-index:10;';
                    btn.appendChild(latestTag);
                } else {
                    btn.style.cssText = `
                        display: flex;
                        align-items: center;
                        width: 100%;
                        margin: 6px 0;
                        padding: 11px 14px;
                        background: #0078d4;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        text-align: left;
                        font-size: 16px;
                        font-family: inherit;
                        font-weight: normal;
                        box-shadow: none;
                        position: relative;
                        transition: background 0.18s, box-shadow 0.18s, border 0.18s;
                        outline: none;
                    `;
                    const textSpan = document.createElement('span');
                    textSpan.textContent = `${version} — ${dateText}`;
                    textSpan.style.cssText = 'flex:1; text-align:left; white-space:normal; word-break:break-word;';
                    btn.textContent = '';
                    btn.appendChild(textSpan);
                }
                btn.addEventListener('mouseenter', () => {
                    if (idx === 0) {
                        btn.style.background = 'linear-gradient(90deg, #7c4dff 0%, #8e24aa 100%)';
                    } else {
                        btn.style.background = '#005fa3';
                    }
                });
                btn.addEventListener('mouseleave', () => {
                    if (idx === 0) {
                        btn.style.background = 'linear-gradient(90deg, #8e24aa 0%, #7c4dff 100%)';
                    } else {
                        btn.style.background = '#0078d4';
                    }
                });
                btn.addEventListener('focus', () => btn.style.boxShadow = idx === 0 ? '0 0 0 5px #b39ddb' : '0 0 0 2px #90caf9');
                btn.addEventListener('blur', () => btn.style.boxShadow = idx === 0 ? '0 8px 32px rgba(124,77,255,0.18)' : 'none');
                btn.addEventListener('click', () => {
                    const downloadUrl = `https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${publisher}/vsextensions/${extension}/${version}/vspackage`;
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.download = `${itemName}-${version}.vsix`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    document.body.removeChild(overlay);
                    showPopupMessage(`VSIX for version ${version} grabbed!`);
                });
                popup.appendChild(btn);
            });

            // Custom version input
            const customDiv = document.createElement('div');
            customDiv.style.cssText = 'margin-top: 20px; text-align: left;';
            const customLabel = document.createElement('label');
            customLabel.textContent = 'Custom version:';
            customLabel.style.cssText = 'display: block; margin-bottom: 4px; font-size: 13px; color: #444;';
            const customInputWrap = document.createElement('div');
            customInputWrap.style.cssText = 'display: flex; gap: 8px; align-items: center;';
            const customInput = document.createElement('input');
            customInput.type = 'text';
            customInput.placeholder = 'e.g. 1.2.3';
            customInput.style.cssText = 'flex:1; padding: 7px 10px; font-size: 15px; border: 1px solid #bbb; border-radius: 4px;';
            const customBtn = document.createElement('button');
            customBtn.textContent = 'Download';
            customBtn.style.cssText = 'padding: 7px 14px; background: #0078d4; color: white; border: none; border-radius: 4px; font-size: 15px; cursor: pointer; transition: background 0.18s;';
            customBtn.addEventListener('mouseenter', () => customBtn.style.background = '#005fa3');
            customBtn.addEventListener('mouseleave', () => customBtn.style.background = '#0078d4');
            customBtn.addEventListener('click', () => {
                const customVersion = customInput.value.trim();
                if (!customVersion) {
                    showPopupMessage('Please enter a version number.', true);
                    return;
                }
                const downloadUrl = `https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${publisher}/vsextensions/${extension}/${customVersion}/vspackage`;
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `${itemName}-${customVersion}.vsix`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                document.body.removeChild(overlay);
                showPopupMessage(`VSIX for version ${customVersion} grabbed!`);
            });
            customInputWrap.appendChild(customInput);
            customInputWrap.appendChild(customBtn);
            customDiv.appendChild(customLabel);
            customDiv.appendChild(customInputWrap);
            popup.appendChild(customDiv);

            // Close on overlay click (outside popup)
            overlay.addEventListener('click', e => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                }
            });

            overlay.appendChild(popup);
            document.body.appendChild(overlay);
        });

        document.body.appendChild(button);
    }

    // Helper: show popup message
    function showPopupMessage(message, isError = false) {
        const msgDiv = document.createElement('div');
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            position: fixed;
            top: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: ${isError ? '#d32f2f' : '#388e3c'};
            color: white;
            padding: 14px 28px;
            border-radius: 6px;
            font-size: 16px;
            z-index: 10010;
            box-shadow: 0 2px 8px rgba(0,0,0,0.18);
            opacity: 0.97;
            animation: fadeInPopup 0.3s;
        `;
        document.body.appendChild(msgDiv);
        setTimeout(() => {
            msgDiv.remove();
        }, 2200);
    }

    // Add fade-in animation for popup
    const style = document.createElement('style');
    style.textContent = `
    @keyframes fadeInPopup {
        from { opacity: 0; transform: scale(0.97); }
        to { opacity: 1; transform: scale(1); }
    }
    `;
    document.head.appendChild(style);

    init();
})();

// ==UserScript==
// @name         Hex Color Preview
// @name:el      Προεπισκόπηση Χρωμάτων HEX
// @description  Adds automatic highlighting and live previews of HEX color codes throughout ChatGPT conversations — including normal text and code blocks. The script detects and replaces hex values (e.g. #ff00ff, #09f) with visually styled spans showing the corresponding background color and readable contrast text. Fully streaming-aware and optimized for ChatGPT's dynamic DOM updates.
// @description:el  Προσθέτει αυτόματη επισήμανση και προεπισκόπηση χρωμάτων HEX σε όλη τη συνομιλία στο ChatGPT — τόσο σε κανονικό κείμενο όσο και μέσα σε μπλοκ κώδικα. Ανιχνεύει και αντικαθιστά τιμές HEX (π.χ. #ff00ff, #09f) με εμφανή πλαίσια που δείχνουν το πραγματικό χρώμα και προσαρμοσμένο χρώμα κειμένου για ευκρίνεια. Απόλυτα συμβατό με τη ροή απαντήσεων του ChatGPT (streaming).
// @version      1.0.0
// @namespace    https://github.com/CarpeNoctemXD/UserScripts
// @author       CarpeNoctemXD
// @updateURL    https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/chatgpt/chatgpt-hex_color_preview.user.js
// @downloadURL  https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/chatgpt/chatgpt-hex_color_preview.user.js
// @match        https://chatgpt.com/g/*
// @run-at       document-idle
// @grant        none
// @icon         https://chatgpt.com/favicon.ico
// @license      MIT
// ==/UserScript==

/* Changelog
------------------------------------------------------------
- 1.0.0 - 2025-10-30
    - Initial release
------------------------------------------------------------
*/

(() => {
    'use strict';

    // === [1] Inject custom CSS styles for the highlighted spans ===
    const style = document.createElement('style');
    style.textContent = `
        /* General style for color-highlighted text */
        .color-span {
            padding: 0 4px;
            border-radius: 3px;
            font-family: monospace;
            border: 1px solid rgba(255,255,255,0.3);
            white-space: pre-wrap;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        /* Prevent nested spans from adding padding or borders again */
        .color-span > .color-span {
            padding: 0 !important;
            border: none !important;
        }

        /* Subtle hover effect for better visibility */
        .color-span:hover {
            transform: scale(1.08);
            box-shadow: 0 0 5px rgba(255,255,255,0.6);
        }
    `;
    document.head.appendChild(style);

    // === [2] Globals ===
    const doneMessages = new Set(); // Keep track of processed assistant messages
    const hexRegex = /#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})(?![0-9A-Fa-f])/g; // Match #RGB or #RRGGBB (not followed by extra hex chars)

    // === [3] Helper: Determine whether to use white or black text for readability ===
    function getContrastColor(hex) {
        // Convert shorthand (#abc) to full form (#aabbcc)
        if (hex.length === 4) {
            hex = '#' + [...hex.slice(1)].map(c => c + c).join('');
        }
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        // Calculate brightness using the YIQ formula
        return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#000' : '#fff';
    }

    // === [4] Highlight normal text nodes safely (outside code blocks) ===
    function highlightTextNode(node) {
        const text = node.textContent;
        if (!hexRegex.test(text)) return;

        // Reset regex index before reusing
        hexRegex.lastIndex = 0;

        const frag = document.createDocumentFragment();
        let last = 0, match;

        // Split text into chunks and wrap detected HEX values
        while ((match = hexRegex.exec(text))) {
            if (match.index > last) frag.appendChild(document.createTextNode(text.slice(last, match.index)));

            const color = match[0];
            const contrast = getContrastColor(color);

            const span = document.createElement('span');
            span.textContent = color;
            span.className = 'color-span';
            span.style.backgroundColor = color;
            span.style.color = contrast;
            span.style.borderColor = contrast;

            frag.appendChild(span);
            last = match.index + color.length;
        }

        // Add remaining text after last match
        if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));

        // Replace original node with new fragment
        node.parentNode.replaceChild(frag, node);
    }

    // === [5] Highlight HEX values inside code blocks (preserving syntax highlighting) ===
    function highlightInCodeBlock(codeEl) {
        // Avoid reprocessing already styled code
        if (codeEl.dataset.hexProcessed) return;
        codeEl.dataset.hexProcessed = "true";

        // Replace in innerHTML instead of text nodes, preserving syntax markup
        codeEl.innerHTML = codeEl.innerHTML.replace(hexRegex, match => {
            const color = match;
            const contrast = getContrastColor(color);
            return `<span class="color-span" style="background:${color};color:${contrast};border-color:${contrast}">${color}</span>`;
        });
    }

    // === [6] Recursively traverse the DOM for new or modified nodes ===
    function traverseAndMark(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            // Skip text inside color spans or code/pre elements
            if (!node.parentNode.classList.contains('color-span') &&
                !node.parentNode.closest('code, pre')) {
                highlightTextNode(node);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'CODE') {
                highlightInCodeBlock(node);
                return;
            }
            if (!['SCRIPT', 'STYLE'].includes(node.tagName)) {
                for (const child of node.childNodes) traverseAndMark(child);
            }
        }
    }

    // === [7] Wait until ChatGPT finishes streaming a message ===
    async function waitForStreaming(message) {
        const streaming = message.querySelector('div[class*="result-streaming"]');
        if (streaming) {
            await new Promise(r => setTimeout(r, 100));
            return waitForStreaming(message); // Keep checking recursively
        }
        return message;
    }

    // === [8] Process a ChatGPT message when it's ready ===
    async function processMessage(message) {
        if (doneMessages.has(message)) return;
        await waitForStreaming(message);
        traverseAndMark(message);
        doneMessages.add(message);
    }

    // === [9] Observe DOM mutations for new messages (dynamic updates) ===
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (!(node instanceof HTMLElement)) continue;

                // Direct assistant message node
                if (node.dataset?.messageAuthorRole === 'assistant') {
                    processMessage(node);
                } else {
                    // Search within nested nodes
                    node.querySelectorAll('div[data-message-author-role="assistant"]').forEach(processMessage);
                }
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // === [10] Initial run on already loaded messages ===
    document.querySelectorAll('div[data-message-author-role="assistant"]').forEach(processMessage);
})();

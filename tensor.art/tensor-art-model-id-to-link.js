// ==UserScript==
// @name         Tensor.art Model ID to links
// @name:el      Tensor.art Μοντέλα ID σε συνδέσμους
// @description  Adds model links under all 18-digit model IDs on tensor.art
// @description:el  Προσθέτει συνδέσμους μοντέλου κάτω από όλα τα 18-ψήφια ID μοντέλου στο tensor.art
// @namespace    https://github.com/CarpeNoctemXD/UserScripts
// @version      1.1.0.2
// @author       CarpeNoctemXD
// @match        https://tensor.art/*
// @icon         https://tensor.art/favicon.ico
// @updateURL    https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/tensor.art/tensor-art-model-id-to-link.js
// @downloadURL  https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/tensor.art/tensor-art-model-id-to-link.js
// @license      MIT
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const idRegex = /\b\d{18}\b/g;
    let enabled = false;
    const seen = new Set();

    function linkifyModelIds() {
        if (!enabled) return;

        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const matches = node.textContent.match(idRegex);
            if (!matches) continue;

            matches.forEach((id) => {
                if (seen.has(id)) return;
                seen.add(id);

                const parent = node.parentNode;
                const link = document.createElement('a');
                link.href = `https://tensor.art/models/${id}`;
                link.textContent = `🔗 Open Model ${id}`;
                link.target = '_blank';
                link.style.display = 'block';
                link.style.color = '#0077cc';
                link.style.marginTop = '4px';

                parent.insertAdjacentElement('afterend', link);
            });
        }
    }

    function createToggleButton() {
        const button = document.createElement('button');
        button.textContent = '▶️ Show Model Links';
        button.style.position = 'fixed';
        button.style.top = '10px';
        button.style.right = '10px';
        button.style.zIndex = '9999';
        button.style.padding = '8px 12px';
        button.style.background = '#222';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        document.body.appendChild(button);

        button.addEventListener('click', () => {
            enabled = !enabled;
            button.textContent = enabled ? '✅ Model Linker ON' : '🚫 Model Linker OFF';
            if (enabled) linkifyModelIds();
        });
    }

    const observer = new MutationObserver(() => {
        if (enabled) linkifyModelIds();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('load', () => {
        createToggleButton();
    });
})();

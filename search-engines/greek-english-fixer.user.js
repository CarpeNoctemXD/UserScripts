// ==UserScript==
// @name         Polyglot Keyboard Fixer - Greek/English Layout Switcher
// @name:el      Πολύγλωσσος Διορθωτής Πληκτρολογίου - Εναλλαγή Ελληνικού/Αγγλικού Πληκτρολογίου
// @namespace    https://github.com/CarpeNoctemXD/UserScripts
// @version      1.0.1
// @description  🔤 Intelligent keyboard layout corrector with elegant UI. Fixes accidental Greek/English typos in search queries with style!
// @description:el 🔤 Έξυπνος διορθωτής πληκτρολογίου. Διορθώνει αυτόματα λάθη ελληνικού/αγγλικού πληκτρολογίου στις αναζητήσεις!
// @author       CarpeNoctemXD
// @match        https://www.google.*/search?q=*
// @match        https://duckduckgo.com/?q=*
// @match        https://www.bing.com/search?q=*
// @grant        none
// @icon         data:image/png;base64,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
// @updateURL    https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/search-engines/greek-english-fixer.user.js
// @downloadURL  https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/search-engines/greek-english-fixer.user.js
// @license      MIT
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Enhanced Greek ↔ English keyboard layout map
    const grToEn = {
        'α':'a','β':'b','γ':'g','δ':'d','ε':'e','ζ':'z','η':'h','θ':'u',
        'ι':'i','κ':'k','λ':'l','μ':'m','ν':'n','ξ':'j','ο':'o','π':'p',
        'ρ':'r','σ':'s','ς':'w','τ':'t','υ':'y','φ':'f','χ':'x','ψ':'c','ω':'v',
        'Α':'A','Β':'B','Γ':'G','Δ':'D','Ε':'E','Ζ':'Z','Η':'H','Θ':'U',
        'Ι':'I','Κ':'K','Λ':'L','Μ':'M','Ν':'N','Ξ':'J','Ο':'O','Π':'P',
        'Ρ':'R','Σ':'S','Τ':'T','Υ':'Y','Φ':'F','Χ':'X','Ψ':'C','Ω':'V',
        ';':'q',':':'Q','΄':'\'','"':'"','½':'%','£':'$','€':'@'
    };

    const enToGr = {};
    for (let [g, e] of Object.entries(grToEn)) enToGr[e] = g;

    function greekToEnglish(text) {
        return text.split('').map(c => grToEn[c] || c).join('');
    }

    function englishToGreek(text) {
        return text.split('').map(c => enToGr[c] || c).join('');
    }

    function detectLayout(text) {
        if (!text) return 'unknown';

        const greekChars = (text.match(/[α-ωΑ-Ω]/g) || []).length;
        const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
        const totalLetters = greekChars + englishChars;

        if (totalLetters === 0) return 'unknown';

        const greekRatio = greekChars / totalLetters;
        const englishRatio = englishChars / totalLetters;

        if (greekRatio > 0.7) return 'greek';
        if (englishRatio > 0.7) return 'english';
        return 'mixed';
    }

    function getConversionDirection(text) {
        const layout = detectLayout(text);
        switch(layout) {
            case 'greek': return { from: 'greek', to: 'english', fromFlag: '🇬🇷', toFlag: '🇺🇸' };
            case 'english': return { from: 'english', to: 'greek', fromFlag: '🇺🇸', toFlag: '🇬🇷' };
            default: return { from: 'unknown', to: 'unknown', fromFlag: '🔤', toFlag: '🔤' };
        }
    }

    function transformText(text) {
        const direction = getConversionDirection(text);
        let convertedText = text;

        switch(direction.from) {
            case 'greek': convertedText = greekToEnglish(text); break;
            case 'english': convertedText = englishToGreek(text); break;
            default: return null;
        }

        return {
            text: convertedText,
            from: direction.from,
            to: direction.to,
            fromFlag: direction.fromFlag,
            toFlag: direction.toFlag
        };
    }

    function updateButtonVisuals(btn, direction) {
        const icon = btn.querySelector('.swap-icon');
        const text = btn.querySelector('.swap-text');

        if (direction.from === 'unknown') {
            icon.textContent = '🔤';
            text.textContent = 'Detecting...';
            btn.title = 'Polyglot Keyboard Fixer - Enter text to detect layout';
            btn.style.background = 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)';
            btn.style.opacity = '0.7';
        } else {
            icon.innerHTML = `${direction.fromFlag}→${direction.toFlag}`;
            text.textContent = `${direction.from === 'greek' ? 'Greek' : 'English'} to ${direction.to === 'greek' ? 'Greek' : 'English'}`;
            btn.title = `Polyglot Keyboard Fixer - Convert from ${direction.from} to ${direction.to} keyboard layout`;
            btn.style.opacity = '1';

            if (direction.from === 'greek') {
                btn.style.background = 'linear-gradient(135deg, #0D5EAF 0%, #1E88E5 100%)'; // Greek blue
            } else {
                btn.style.background = 'linear-gradient(135deg, #B22234 0%, #3C3B6E 100%)'; // US flag colors
            }
        }
    }

    function createFancyButton() {
        const btn = document.createElement('button');
        btn.innerHTML = `
            <span class="swap-icon">🔤</span>
            <span class="swap-text">Detecting...</span>
        `;
        btn.id = 'polyglot-swap-btn';
        btn.title = 'Polyglot Keyboard Fixer - Enter text to detect layout';

        // Advanced CSS styling
        btn.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-left: 10px;
            padding: 10px 16px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            border: none;
            border-radius: 25px;
            background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
            color: white;
            transition: all 0.3s ease;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            position: relative;
            overflow: hidden;
            min-width: 140px;
            justify-content: center;
            font-family: system-ui, -apple-system, sans-serif;
            opacity: 0.7;
        `;

        // Hover effects
        btn.addEventListener('mouseenter', function() {
            if (this.style.opacity !== '0.7') {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
            }
        });

        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
        });

        // Ripple effect
        btn.addEventListener('click', function(e) {
            if (this.style.opacity === '0.7') return; // Don't animate if disabled

            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
            `;

            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });

        return btn;
    }

    function findSearchInput() {
        const selectors = [
            'textarea[name="q"]',
            'input[name="q"]',
            'input[name="p"]',
            'input#search',
            'input#search-input',
            'input[type="search"]',
            '[aria-label*="search" i]',
            '[placeholder*="search" i]'
        ];

        for (const selector of selectors) {
            const input = document.querySelector(selector);
            if (input && input.offsetWidth > 0) return input;
        }
        return null;
    }

    function setupInputMonitoring(input, btn) {
        let checkTimeout;

        const checkInput = () => {
            clearTimeout(checkTimeout);
            checkTimeout = setTimeout(() => {
                const text = input.value.trim();
                const direction = getConversionDirection(text);
                updateButtonVisuals(btn, direction);
            }, 300);
        };

        // Monitor input changes
        input.addEventListener('input', checkInput);
        input.addEventListener('paste', checkInput);
        input.addEventListener('cut', checkInput);

        // Initial check
        checkInput();
    }

    function addSwapButton() {
        const input = findSearchInput();
        if (!input) return;

        // Avoid duplicate buttons
        if (document.querySelector('#polyglot-swap-btn')) return;

        const btn = createFancyButton();

        // Position button next to input
        const inputContainer = input.closest('form, div') || input.parentElement;
        if (inputContainer) {
            inputContainer.style.position = 'relative';
            inputContainer.appendChild(btn);
        } else {
            input.insertAdjacentElement('afterend', btn);
        }

        // Set up input monitoring for dynamic updates
        setupInputMonitoring(input, btn);

        btn.addEventListener('click', () => {
            let text = input.value.trim();
            if (!text) return;

            const result = transformText(text);
            if (result && result.text !== text) {
                // Update input
                input.value = result.text;

                // Update button to show new direction (reverse)
                const newDirection = getConversionDirection(result.text);
                updateButtonVisuals(btn, newDirection);

                // Submit search after a brief delay
                setTimeout(() => {
                    const form = input.closest('form');
                    if (form) {
                        form.submit();
                    } else {
                        // Build new URL for SPA search engines
                        const url = new URL(window.location.href);
                        if (url.searchParams.has('q')) {
                            url.searchParams.set('q', result.text);
                        } else if (url.searchParams.has('p')) {
                            url.searchParams.set('p', result.text);
                        }
                        window.location.href = url.toString();
                    }
                }, 300);
            }
            // No conversion needed - just do nothing silently
        });
    }

    // Enhanced initialization with retry logic
    function init() {
        let attempts = 0;
        const maxAttempts = 5;

        const tryInit = () => {
            if (findSearchInput()) {
                addSwapButton();
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(tryInit, 500);
            }
        };

        tryInit();
    }

    // Add CSS animations
    if (!document.getElementById('polyglot-styles')) {
        const styles = document.createElement('style');
        styles.id = 'polyglot-styles';
        styles.textContent = `
            @keyframes ripple {
                to { transform: scale(2); opacity: 0; }
            }
            #polyglot-swap-btn .swap-icon {
                font-size: 16px;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
            }
        `;
        document.head.appendChild(styles);
    }

    // Initial load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Enhanced MutationObserver for dynamic content
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) {
                        if (node.querySelector &&
                            (node.querySelector('input[name="q"], textarea[name="q"], input[type="search"]') ||
                             node.matches && node.matches('input[name="q"], textarea[name="q"], input[type="search"]'))) {
                            setTimeout(init, 100);
                            break;
                        }
                    }
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
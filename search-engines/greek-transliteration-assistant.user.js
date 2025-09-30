// ==UserScript==
// @name         Greek Transliteration Assistant
// @name:el      Βοηθός Μεταγραφής Ελληνικών
// @namespace    https://github.com/CarpeNoctemXD/UserScripts
// @version      1.1.14
// @description  Adds a discreet elegant button to swap Greek/English keyboard layout queries
// @description:el Προσθέτει ένα διακριτικό κουμπί για εναλλαγή διατάξεων πληκτρολογίου
// @author       CarpeNoctemXD
// @match        https://www.google.*/*
// @match        https://duckduckgo.com/*
// @match        https://*bing.com/search?q=*
// @match        https://search.yahoo.com/*
// @match        https://*.youtube.com/*
// @match        https://stackoverflow.com/*
// @match        https://*.stackexchange.com/*
// @match        https://github.com/*
// @match        https://gitlab.com/*
// @match        https://www.reddit.com/*
// @match        https://old.reddit.com/*
// @match        https://www.quora.com/*
// @match        https://*.pinterest.com/*
// @match        https://www.deviantart.com/
// @match        https://www.tumblr.com/*
// @match        https://www.facebook.com/*
// @match        https://twitter.com/*
// @match        https://x.com/*
// @match        https://instagram.com/*
// @match        https://www.startpage.com/*
// @match        https://www.ecosia.org/*
// @match        https://*.archive.org/*
// @match        https://archive.org/*
// @match        https://*.wikipedia.org/*
// @match        https://search.brave.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/search-engines/greek-transliteration-assistant.user.js
// @downloadURL  https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/search-engines/greek-transliteration-assistant.user.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAllSURBVHhe7Zp/cFxVFcc/5yVpNmmaZptUk7ShBYukqaWAgIIwGKxaRgR0BsQpAqP8/jGowDAOMgOOAzij8sMBigz0R9o/mDJMyyAKDGhRodgfNElLSdqkTWh+bDY/d/MDkt13/ePe9/L2dd+2RVrbJN/J3d133rn3nvO955x732alvXmLwoESEHOpxBUfEp+lz/8LPlst94ZjvJJDO+IM4uBw+nxW+Of6X+GzVRNwtIw/AWClOH+4bPsJE3X4fY8U/rk+Z1hHbHg6/aOZAkcLxo/xGjBJkUrA4azi4eicCDhoF5ikmCJgwoT0Z4TeBbxtkkFHgLcdTzgGCzJVA/yC4wrHICKPbwKOAaYI8AsmG4IJOAYV+HhAMAGTBMEEHIMKfDwgmIBJgmACRKFQmL8TuCm/ZymQ9qat6TVEUbe1nv17msZFlqCUUXd7KRDxXAMCAjiqONnkvVamn1fug3K6ir7Q1/5BUzR9nwERvn/VFe5Ufkh78xYVlO/rnl1N7X92UDG/ggQ2IsKu7fUsqFxAKC8PgK7OKJ+ODFMx/yRELGwUrXv3U1BYQMnsEpQlKBQtjc0UhosIz56lB1eKxp0fUX7SXAoLC9056z+oZUHllwnlhbCBZCLBhzt2suSrS7BFEKA70sXI0AgnnTIfJZqUfQ1NFBWHKSo24wuMfjrK7h27WLlxDWSlf9YJjgCgZsUqlK245rbr0VMr7vzJbdz/8K8prShHBN7c+DodrQe49vYbwNJDPfXIk5y2uJKll35HW6Lgid/8nrPOP5sLl15kQlN44Pb7uPqG5Sw+czGYGe5Yfgu/evQByivKUQLDA3Huuu4OnntpFZKt1//tV96guaGJG++5zVgqPPbg7zi/+gLO/eZ5iHE02hHh3pvuZlUGAoJrgA8iajywRP8DxckvhaBSzg2eiZR58USuGGf1u/7kqiuj5JWKmdMjG59dXzmR79wXI0YYT9s0yEyA0qRZNmADtiDKRpQgtm5KLydig9hi9BSWI1PKPVOJKwPL1kaLUmAr7bnjhFLgjKcEpSxQCjF22N7xnDFMf62jUApsceZOs/rGqOAUEEXN06vZvOldZswsRNC5HI10ES6eRXZONijF8OAwyUSCGUWFxnihv7efabk5hArytVMKBnr7yM0LkZefp2umDT3RHgoKC8gNTdMrbEM0EiVcMovs7CwQsG1Fd2c3s8tmu7V2ZHCYsdExCsMztalAf48ePz8/X/MokBhL0B2N8sKGGiQgBTISsPaZ1fRGe1l62TK9AqJJsJM2f3joUe647xfkTc8HpRiKD/Ls48/wywfu1YQD7S0HeP2Vv/DTO2/RQwJ7djew5Z3N/Pima8EUtbrttTTtbuSKa650t473/vFvYrEY373sEtNT8fZf32JaTjYXLL0IzIL87aVXKCn9Audc8HWTZiaMUPT39fPnPz7Dyo01iJU+2LP9AhdKF5xwcZjKJQux3OyCZMJGxKKy6jSmF80AoK+nF0ssFp5ehVhad1pONqHcXC0z3UdGRti1rZ6qJYvchI1Gu4i0RVi42OiJoumjPVjZltYzqNtSRyiUQ9UZVaAEG9j81j8pLS9L0XPQ1RFxq0wQ0tOCNsJEL1m2/6Yh2QuHfVN0lJOTStCmjsOJJI8EhafIGphNBdBj6iXxnjn0dTrzHCjLVMaAh7vgCDDM9UZ7qP+g1pinB7GTerxddbsITc8HFIMDcZJJm/rtda5ee0sbn3zyKTu31ev0U7B/bzODQ4PUb691Z2pr+Zj4wAD122pNmio62zoYjMWp37bD1YtGusjOzaFuWy1iamZvTw+Sk0X91tqDnOzv6RsvrgEIrgHAuhWr2fzOe8wsnmW2AdHN2RKVIhaLkxxLUBQO65wWXdxCuSEKCqe7Y0U6IsycVcS03GlaoIS2j9son1NGVpaFLWAnknQcaGfuvAp3ocdGRunr6+OLpaWI6MgaGhxi9JNRwsVhsARRSh+4FCmhmUwk6Ww7wMoNNYHnAE2Aw5xPoWbFKlCw/NbrUmqAF6+99Cp90W6W33o9mLV/6uEnWHTWV6he9i2jJTz08/u56rqrqTxzEYKQTCS5+crreWzln5hRVARAvD/GPT+7ixXrnzdkCo27G1jz9Cp+++QjTm3jrVffpLlxDzfe7RyE0qOrI8J9N9/Dyg2rAwnQNUClv5kSGmlzSG/EytEV/cnNb7ePL8ONXKnUSqDH0Hpi3t164tFRZA5rBykqafwjYxF0gkl5TXdcNWa4BxBP8+o418YBt5B5HNJWOnr2uNn+cZ0igj7o6F6++Xwt/YNTKgJrgFKKdc+uZsf7H1A2t0ynvtderUW0q5ux0QRlFaXuGbx1fyvTZ+RTUlJixoK9jU2UlpVSUDhDO6qSfFi/m1OrKsnJzgIRxsbG2PthAwtPX+Q+YQ4ODdL5cScLFp4KSmEDfdFuhoeHmTuvYnyT8/ko6Iehht17WLlhDZit2Y9AAgDWrFhFe0sbX7voPHcLevH5tVzyg+9RGA4D0NK0n4adH/Hty5dpG0Q7nGKYy5qfRb9RXlMcRbOOAvsaGtjX2MLFly5FsFBi88aG16hcXMW8U04+6LE8Hovx8tr1vLBxTeBJMMM2qDGnYg7Vy6rdo+r6tS9yzoXnUVYxB1BsfXcrnR0dVF9Sncahzxe5oRz6++JUL7sYRBPz/jvvUXXGYs7+xrkHzd7VEeHldesPknuRuQaIfrFwFsO7asrT/AebowlBRJst2Iitc93vpPOg5B5BA5B19103PegXOqjduoOh+CClc8uJDcSI98fZ9ObfqVxUxVhijNhAjNam/bQ2t3DKaV8i3h8jNpCmBcmPsDXv2UdnaxvzTz2ZWH+Mgf4BtvxrC8WzZ5GbFyLu049Gunh/07tc/qMfBhKRsQbUPLeGTa+9DWKlVj+d5J7ToW2CKcPJO0DswHvbb5DeNLRUKRsELCx3F1AKEPOffqfYmT5KEjy/3nwhkgYZCdC7mA5xB47L44mgzJchogkwo3kTxflsp6SQAy0TzanRO/i+H5by6xkLPN4YerACdgA4xHeCkwEZi+CEhgmVyUuAweT7kZSzPxq/J18E+B78Jh8BPhz5j6UnGFIjYKKQ4fXjED5NpUDKLuDfEdwnihMMmXzyIfNPZQO+KptIOL5/KnsMMFUD/IKMSJcmJziOjIAJmCZHRsAExBQBfsFkwxQBfsGERpodbHIRkGYH+y8vxL344KN/lwAAAABJRU5ErkJggg==
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    /**
     * GREEK TO ENGLISH KEYBOARD LAYOUT MAPPING
     * Maps Greek characters to their English keyboard equivalents
     * Includes support for accented characters and punctuation
     */
    const grToEn = {
        // Lowercase Greek letters
        'α':'a','ά':'a','β':'b','γ':'g','δ':'d','ε':'e','έ':'e','ζ':'z','η':'h','ή':'h',
        'θ':'u','ι':'i','ί':'i','ϊ':'i','ΐ':'i','κ':'k','λ':'l','μ':'m','ν':'n','ξ':'j',
        'ο':'o','ό':'o','π':'p','ρ':'r','σ':'s','ς':'s','τ':'t','υ':'y','ύ':'y','ϋ':'y','ΰ':'y',
        'φ':'f','χ':'x','ψ':'c','ω':'v','ώ':'v',

        // Uppercase Greek letters
        'Α':'A','Ά':'A','Β':'B','Γ':'G','Δ':'D','Ε':'E','Έ':'E','Ζ':'Z','Η':'H','Ή':'H',
        'Θ':'U','Ι':'I','Ί':'I','Ϊ':'I','Κ':'K','Λ':'L','Μ':'M','Ν':'N','Ξ':'J','Ο':'O','Ό':'O',
        'Π':'P','Ρ':'R','Σ':'S','Τ':'T','Υ':'Y','Ύ':'Y','Ϋ':'Y','Φ':'F','Χ':'X','Ψ':'C','Ω':'V','Ώ':'V',

        // Punctuation and symbols
        ';':"'",':':'"','΄':"'",'’':"'",'`':"'",

        // Numbers (remain unchanged)
        '1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9','0':'0'
    };

    /**
     * ENGLISH TO GREEK KEYBOARD LAYOUT MAPPING
     * Reverse mapping for converting English keyboard input to Greek characters
     */
    const enToGr = {
        // Lowercase English to Greek
        'a':'α','b':'β','c':'ψ','d':'δ','e':'ε','f':'φ','g':'γ','h':'η','i':'ι','j':'ξ',
        'k':'κ','l':'λ','m':'μ','n':'ν','o':'ο','p':'π','q':';','r':'ρ','s':'σ','t':'τ',
        'u':'θ','v':'ω','w':'ς','x':'χ','y':'υ','z':'ζ',

        // Uppercase English to Greek
        'A':'Α','B':'Β','C':'Ψ','D':'Δ','E':'Ε','F':'Φ','G':'Γ','H':'Η','I':'Ι','J':'Ξ',
        'K':'Κ','L':'Λ','M':'Μ','N':'Ν','O':'Ο','P':'Π','Q':':','R':'Ρ','S':'Σ','T':'Τ',
        'U':'Θ','V':'Ω','W':'Σ','X':'Χ','Y':'Υ','Z':'Ζ',

        // Punctuation mapping
        "'":'΄','"':'"',';':',',':':'.'
    };

    /**
     * MATERIAL DESIGN COLOR SCHEMES
     * Solid colors for better visual consistency across platforms
     */
    const colorSchemes = [
        { bg: '#3f51b5', hover: '#303f9f', text: '#fff' }, // Indigo
        { bg: '#e91e63', hover: '#c2185b', text: '#fff' }, // Pink
        { bg: '#2196f3', hover: '#1976d2', text: '#fff' }, // Blue
        { bg: '#4caf50', hover: '#388e3c', text: '#fff' }, // Green
        { bg: '#ff9800', hover: '#f57c00', text: '#fff' }, // Orange
        { bg: '#f44336', hover: '#d32f2f', text: '#fff' }, // Red
        { bg: '#9c27b0', hover: '#7b1fa2', text: '#fff' }, // Purple
        { bg: '#009688', hover: '#00796b', text: '#fff' }, // Teal
        { bg: '#00bcd4', hover: '#0097a7', text: '#fff' }, // Cyan
        { bg: '#ffc107', hover: '#ffa000', text: '#333' }, // Amber
        { bg: '#795548', hover: '#5d4037', text: '#fff' }, // Brown
        { bg: '#607d8b', hover: '#455a64', text: '#fff' }, // Blue Grey
        { bg: '#9e9e9e', hover: '#616161', text: '#fff' }  // Grey
    ];

    /**
     * SITE-SPECIFIC BUTTON POSITION OFFSETS
     * Right position adjustments to avoid UI conflicts
     * All values are in pixels, default is 0px
     */
    const siteOffsets = {
        // Search Engines
        'google.com': '-2px',
        'bing.com': '120px',
        'duckduckgo.com': '96px',
        'search.yahoo.com': '45px',
        'search.brave.com': '86px',
        'www.startpage.com': '45px',
        'www.ecosia.org': '45px',

        // Video Platforms
        'youtube.com': '8px',

        // Developer Platforms
        'stackoverflow.com': '8px',
        'stackexchange.com': '8px',
        'github.com': '8px',
        'gitlab.com': '8px',

        // Social Media
        'reddit.com': '8px',
        'old.reddit.com': '8px',
        'quora.com': '8px',
        'pinterest.com': '8px',
        'tumblr.com': '8px',
        'facebook.com': '8px',
        'twitter.com': '8px',
        'x.com': '8px',
        'instagram.com': '8px',

        // Art & Creative
        'deviantart.com': '8px',

        // Knowledge & Archives
        'wikipedia.org': '8px',
        'archive.org': '8px'
    };

    // Global state
    let currentColorScheme = null;

    /**
     * Detects the primary language of the input text
     * @param {string} text - The text to analyze
     * @returns {string} - 'greek', 'english', or 'mixed'
     */
    function detectLanguage(text) {
        if (!text || typeof text !== 'string') return 'unknown';

        // Count Greek and English characters
        const greekCount = (text.match(/[α-ωΑ-Ωάέήίόύώϊϋΐΰ]/g) || []).length;
        const englishCount = (text.match(/[a-zA-Z]/g) || []).length;

        // Analyze word composition for better accuracy
        const words = text.split(/\s+/).filter(word => word.length > 1);
        const greekWords = words.filter(word => /^[α-ωΑ-Ωάέήίόύώϊϋΐΰ]+$/.test(word));
        const englishWords = words.filter(word => /^[a-zA-Z]+$/.test(word));

        // Determine primary language based on word count and character distribution
        if (greekWords.length > englishWords.length || (greekCount > englishCount && greekCount > 2)) {
            return 'greek';
        } else if (englishWords.length > greekWords.length || (englishCount > greekCount && englishCount > 2)) {
            return 'english';
        }

        return 'mixed';
    }

    /**
     * Transforms text between Greek and English keyboard layouts
     * @param {string} text - The text to transform
     * @returns {string|null} - Transformed text or null if no conversion needed
     */
    function transformText(text) {
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return null;
        }

        const currentLanguage = detectLanguage(text);

        if (currentLanguage === 'greek') {
            return text.split('').map(c => grToEn[c] || c).join('');
        } else if (currentLanguage === 'english') {
            return text.split('').map(c => enToGr[c] || c).join('');
        }

        return null;
    }

    /**
     * Finds the search input element on the page
     * @returns {HTMLElement|null} - The search input element or null if not found
     */
    function findSearchInput() {
        const selectors = [
            // Major search engines
            'textarea[name="q"]', 'input[name="q"]', 'input[type="search"]',
            'input[name="p"]', 'input#sb_form_q',

            // YouTube and video platforms
            'input#search', 'input[name="search_query"]',

            // Developer platforms
            'input[name="q"]', 'input[data-test-selector="search-box"]',

            // Social media platforms
            'input[name="q"]', 'input[placeholder*="search" i]',
            'input[data-testid="SearchBox_Search_Input"]',
            'input[role="combobox"]',

            // Privacy-focused search engines
            'input[name="query"]',

            // Generic fallbacks (catch-all for any site with search)
            'input[aria-label*="search" i]', 'input[title*="search" i]',
            '.search-input', '.search-box', '[role="search"] input'
        ];

        for (const selector of selectors) {
            try {
                const inputs = document.querySelectorAll(selector);
                for (const input of inputs) {
                    // Check if element is visible and has reasonable width
                    if (input.offsetParent !== null &&
                        input.offsetWidth > 100 &&
                        input.getBoundingClientRect().height > 10) {
                        return input;
                    }
                }
            } catch (error) {
                console.debug('Greek Transliteration Assistant: Selector error', selector, error);
            }
        }
        return null;
    }

    /**
     * Creates the elegant swap button element
     * @returns {HTMLButtonElement} - The configured button element
     */
    function createElegantButton() {
        const btn = document.createElement('button');
        btn.id = 'swap-layout-btn';
        btn.innerHTML = '⌨';
        btn.title = 'Switch Greek/English layout (Ctrl+Shift+L)';
        btn.setAttribute('aria-label', 'Switch between Greek and English keyboard layout');
        btn.setAttribute('type', 'button'); // Prevent form submission

        // Choose and store color scheme
        currentColorScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];

        // Calculate button position based on current site
        const rightPosition = calculateButtonPosition();

        // Apply elegant styling
        Object.assign(btn.style, {
            position: 'absolute',
            right: rightPosition,
            top: '50%',
            transform: 'translateY(-50%)',
            border: 'none',
            background: currentColorScheme.bg,
            color: currentColorScheme.text,
            borderRadius: '16px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            fontWeight: '600',
            zIndex: '100',
            opacity: '0.9',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        });

        // Store color scheme for toast consistency
        btn.dataset.colorScheme = JSON.stringify(currentColorScheme);

        // Add interactive effects
        setupButtonInteractions(btn);

        return btn;
    }

    /**
     * Calculates the optimal button position based on current website
     * @returns {string} - CSS right position value
     */
    function calculateButtonPosition() {
        const hostname = window.location.hostname;

        // Find matching site offset
        for (const [site, offset] of Object.entries(siteOffsets)) {
            if (hostname.includes(site)) {
                return offset;
            }
        }

        // Default position for unspecified sites
        return '0px';
    }

    /**
     * Sets up hover and click interactions for the button
     * @param {HTMLButtonElement} btn - The button element
     */
    function setupButtonInteractions(btn) {
        btn.addEventListener('mouseover', () => {
            btn.style.background = currentColorScheme.hover;
            btn.style.opacity = '1';
            btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
            btn.style.transform = 'translateY(-50%) scale(1.05)';
        });

        btn.addEventListener('mouseout', () => {
            btn.style.background = currentColorScheme.bg;
            btn.style.opacity = '0.9';
            btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
            btn.style.transform = 'translateY(-50%) scale(1)';
        });

        btn.addEventListener('mousedown', () => {
            btn.style.transform = 'translateY(-50%) scale(0.95)';
        });

        btn.addEventListener('mouseup', () => {
            btn.style.transform = 'translateY(-50%) scale(1.05)';
        });
    }

    /**
     * Shows a toast notification with the current color scheme
     * @param {string} message - The message to display
     * @param {number} duration - How long to show the toast in ms (default: 2800)
     */
    function showToast(message, duration = 2800) {
        // Remove any existing toast first
        const existingToast = document.getElementById('greek-transliteration-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.id = 'greek-transliteration-toast';
        toast.textContent = message;

        // Get current color scheme
        const colors = getCurrentColorScheme();

        // Style the toast to match the button
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: colors.bg,
            color: colors.text,
            padding: '12px 20px',
            borderRadius: '24px',
            fontSize: '14px',
            fontWeight: '600',
            zIndex: '10000',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'translateX(100%)',
            opacity: '0',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${colors.text === '#333' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        });

        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        // Animate out and remove
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 400);
        }, duration);
    }

    /**
     * Gets the current color scheme from button or global state
     * @returns {Object} - Color scheme object
     */
    function getCurrentColorScheme() {
        try {
            const button = document.querySelector('#swap-layout-btn');
            if (button && button.dataset.colorScheme) {
                return JSON.parse(button.dataset.colorScheme);
            }
        } catch (error) {
            console.debug('Greek Transliteration Assistant: Error parsing color scheme', error);
        }
        return currentColorScheme || colorSchemes[0]; // Fallback to first scheme
    }

    /**
     * Performs the search text transformation and updates the page
     * ONLY called by explicit user action (button click or Ctrl+Shift+L)
     */
    function performSearchSwap() {
        const input = findSearchInput();
        if (!input) {
            showToast('No search field found');
            return;
        }

        const currentText = input.value.trim();
        if (!currentText) {
            showToast('Please enter some text first');
            return;
        }

        const currentLanguage = detectLanguage(currentText);
        const converted = transformText(currentText);

        if (converted && converted !== currentText) {
            input.value = converted;

            // Determine appropriate toast message
            const newLanguage = detectLanguage(converted);
            const toastMessage = getToastMessage(currentLanguage, newLanguage);

            // Update URL for search engines if needed
            const shouldReload = updateSearchURL(converted);

            // Show feedback
            showToast(toastMessage);

            // Handle page reload for search results
            if (shouldReload) {
                setTimeout(() => {
                    window.location.href = new URL(window.location.href).toString();
                }, 600);
            }

            // Trigger events for dynamic search pages
            triggerInputEvents(input);
        } else {
            showToast('No layout change detected');
        }
    }

    /**
     * Generates appropriate toast message based on language change
     * @param {string} fromLang - Original language
     * @param {string} toLang - New language
     * @returns {string} - Toast message
     */
    function getToastMessage(fromLang, toLang) {
        if (toLang === 'greek') return '✓ Swapped to Greek';
        if (toLang === 'english') return '✓ Swapped to English';
        return '✓ Layout switched';
    }

    /**
     * Updates search URL parameters if applicable
     * @param {string} convertedText - The converted search text
     * @returns {boolean} - Whether a page reload is needed
     */
    function updateSearchURL(convertedText) {
        try {
            const url = new URL(window.location.href);
            const searchParams = ['q', 'p', 'query', 'search', 'search_query'];
            let paramUpdated = false;

            for (const param of searchParams) {
                if (url.searchParams.has(param)) {
                    url.searchParams.set(param, convertedText);
                    paramUpdated = true;
                }
            }

            return paramUpdated && (url.pathname.includes('/search') || url.search);
        } catch (error) {
            console.debug('Greek Transliteration Assistant: URL update error', error);
            return false;
        }
    }

    /**
     * Triggers input events for dynamic search pages
     * @param {HTMLElement} input - The input element
     */
    function triggerInputEvents(input) {
        try {
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            // Some sites use specific events
            input.dispatchEvent(new Event('keyup', { bubbles: true }));
        } catch (error) {
            console.debug('Greek Transliteration Assistant: Event trigger error', error);
        }
    }

    /**
     * Adds the swap button to the search input
     */
    function addSwapButton() {
        try {
            const input = findSearchInput();
            if (!input) return;

            // Remove existing button to avoid duplicates
            const existingBtn = document.querySelector('#swap-layout-btn');
            if (existingBtn) existingBtn.remove();

            // Find appropriate container and position button
            const container = input.closest('form, div, label, .search-box, [role="search"]') || input.parentElement;
            if (container && container.style) {
                container.style.position = 'relative';

                const btn = createElegantButton();
                container.appendChild(btn);

                // ONLY attach click event - no automatic behavior
                btn.addEventListener('click', performSearchSwap);
            }
        } catch (error) {
            console.debug('Greek Transliteration Assistant: Button placement error', error);
        }
    }

    /**
     * Initializes the script - ONLY sets up manual triggers
     */
    function init() {
        // Initial button placement
        setTimeout(addSwapButton, 150);

        // Keyboard shortcut (Ctrl+Shift+L) - ONLY manual trigger
        document.addEventListener('keydown', (e) => {
            // Only trigger if specifically Ctrl+Shift+L AND not in an input/textarea
            if (e.ctrlKey && e.shiftKey && e.key === 'L' && !e.target.tagName.match(/INPUT|TEXTAREA/)) {
                e.preventDefault();
                performSearchSwap();
            }
        });

        // Handle Single Page Application navigation - ONLY adds button, no auto-conversion
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                setTimeout(addSwapButton, 400);
            }
        }).observe(document, { subtree: true, childList: true });
    }

    // Main execution - ONLY sets up manual triggers
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Watch for dynamic content changes - ONLY adds button, no auto-conversion
    const observer = new MutationObserver(() => {
        if (!document.querySelector('#swap-layout-btn')) {
            setTimeout(addSwapButton, 100);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
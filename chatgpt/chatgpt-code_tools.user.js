// ==UserScript==
// @name         ChatGPT Code Tools
// @name:el      Εργαλεία Κώδικα για το ChatGPT
// @namespace    https://github.com/CarpeNoctemXD/UserScripts
// @version      1.1.12
// @description  Adds functionality to ChatGPT code blocks, including options to save or copy code snippets.
// @description:el Προσθέτει λειτουργικότητα στα μπλοκ κώδικα του ChatGPT, συμπεριλαμβανομένων επιλογών για αποθήκευση ή αντιγραφή αποσπασμάτων κώδικα.
// @author       CarpeNoctemXD
// @match        *://chatgpt.com/*
// @match        *://chat.openai.com/*
// @icon         https://chatgpt.com/favicon.ico
// @grant        none
// @license      MIT
// @downloadURL  https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/chatgpt/chatgpt-code_tools.user.js
// @updateURL    https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/chatgpt/chatgpt-code_tools.user.js
// ==/UserScript==

(function () {
    'use strict';

    const SCRIPT_VERSION = '1.1.11';

    // Function to check for updates
    const updateCheck = () => {
        fetch('https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/main/chatgpt/chatgpt_code_tools.js?t=' + Date.now(), {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache' }
        })
        .then(response => response.text())
        .then(data => {
            const latestVerMatch = /@version\s+(.*)/.exec(data);
            if (latestVerMatch) {
                const latestVer = latestVerMatch[1];
                const currentSubVers = SCRIPT_VERSION.split('.').map(Number);
                const latestSubVers = latestVer.split('.').map(Number);

                let isOutdated = false;
                for (let i = 0; i < Math.max(currentSubVers.length, latestSubVers.length); i++) {
                    if ((latestSubVers[i] || 0) > (currentSubVers[i] || 0)) {
                        isOutdated = true;
                        break;
                    } else if ((latestSubVers[i] || 0) < (currentSubVers[i] || 0)) {
                        break;
                    }
                }

                if (isOutdated) {
                    alert(`Update available! 🚀\nA new version (v${latestVer}) is available! Click OK to download the update.`);
                    window.open('https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/main/chatgpt/chatgpt_code_tools.js?t=' + Date.now(), '_blank');
                } else {
                    console.log('Your script is up-to-date.');
                }
            }
        })
        .catch(err => console.error('Failed to check for updates:', err));
    };

    // Function to get MIME type based on file extension
    const getMimeType = (filename) => {
        const ext = filename.split('.').pop();
        switch (ext) {
            case 'py': return 'text/x-python';
            case 'js': return 'application/javascript';
            case 'html': return 'text/html';
            case 'css': return 'text/css';
            case 'java': return 'text/x-java-source';
            case 'cs': return 'text/x-csharp';
            case 'cpp': return 'text/x-c++src';
            case 'json': return 'application/json';
            case 'rb': return 'text/x-ruby';
            case 'pl': return 'text/x-perl';
            case 'swift': return 'text/x-swift';
            case 'kt': return 'text/x-kotlin';
            case 'go': return 'text/x-go';
            case 'ts': return 'application/typescript';
            case 'dart': return 'application/dart';
            case 'sql': return 'application/sql';
            case 'sh': return 'application/x-shellscript';
            case 'ps1': return 'application/powershell';
            case 'xml': return 'application/xml';
            case 'yaml': return 'application/x-yaml';
            case 'toml': return 'application/toml';
            case 'ini': return 'text/plain';
            case 'csv': return 'text/csv';
            case 'md': return 'text/markdown';
            case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            case 'bat': return 'application/x-batch';
            default: return 'text/plain';
        }
    };

    // Function to determine file extension based on the code block's language
    const getFileExtension = (languageClass) => {
        if (!languageClass) return 'txt'; // Default to .txt if no class is found

        if (languageClass.includes('language-python')) return 'py';
        if (languageClass.includes('language-javascript') || languageClass.includes('language-js')) return 'js';
        if (languageClass.includes('language-html')) return 'html';
        if (languageClass.includes('language-css')) return 'css';
        if (languageClass.includes('language-java')) return 'java';
        if (languageClass.includes('language-csharp')) return 'cs';
        if (languageClass.includes('language-cpp')) return 'cpp';
        if (languageClass.includes('language-json')) return 'json';
        if (languageClass.includes('language-ruby')) return 'rb';
        if (languageClass.includes('language-perl')) return 'pl';
        if (languageClass.includes('language-swift')) return 'swift';
        if (languageClass.includes('language-kotlin')) return 'kt';
        if (languageClass.includes('language-go')) return 'go';
        if (languageClass.includes('language-typescript')) return 'ts';
        if (languageClass.includes('language-dart')) return 'dart';
        if (languageClass.includes('language-sql')) return 'sql';
        if (languageClass.includes('language-shell') || languageClass.includes('language-bash') || languageClass.includes('language-sh')) return 'sh';
        if (languageClass.includes('language-powershell') || languageClass.includes('language-ps1')) return 'ps1';
        if (languageClass.includes('language-xml')) return 'xml';
        if (languageClass.includes('language-yaml')) return 'yaml';
        if (languageClass.includes('language-toml')) return 'toml';
        if (languageClass.includes('language-ini')) return 'ini';
        if (languageClass.includes('language-csv')) return 'csv';
        if (languageClass.includes('language-markdown') || languageClass.includes('language-md')) return 'md';
        if (languageClass.includes('language-xlsx')) return 'xlsx';
        if (languageClass.includes('language-bat') || languageClass.includes('language-batch')) return 'bat';

        return 'txt'; // Default to .txt if no matching language is found
    };

    // Function to download the text as a file
    const downloadFile = (text, filename, button) => {
        const blob = new Blob([text], { type: getMimeType(filename) });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setButtonState(button, 'working', 'download');
    };

    // Function to copy text to the clipboard
    const copyToClipboard = (text, button) => {
        navigator.clipboard.writeText(text).then(() => {
            setButtonState(button, 'working', 'copy');
        }).catch((err) => {
            console.error('Failed to copy code: ', err);
            setButtonState(button, 'error', 'copy');
        });
    };

    // Function to set the button state and color
    const setButtonState = (button, state, type) => {
        switch (state) {
            case 'working':
                button.textContent = type === 'download' ? 'Saving...' : 'Copied!';
                button.style.backgroundColor = 'green';
                break;
            case 'error':
                button.textContent = type === 'download' ? 'Could not download' : 'Could not copy';
                button.style.backgroundColor = 'red';
                break;
            case 'standby':
            default:
                button.textContent = button.dataset.defaultText || 'Unknown';
                button.style.backgroundColor = '#007bff'; // Blue
                break;
        }
        button.style.color = 'white';

        // Revert the button to standby after 5 seconds
        if (state === 'working' || state === 'error') {
            setTimeout(() => {
                setButtonState(button, 'standby', type);
            }, 5000); // 5 seconds
        }
    };

    // Function to add save and copy buttons to a code block
    const addButtonsToCodeBlock = (codeBlock) => {
        // Ensure existing buttons are not duplicated
        if (codeBlock.querySelector('.code-buttons-wrapper')) return;

        const wrapper = document.createElement('div');
        wrapper.classList.add('code-buttons-wrapper');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'flex';
        wrapper.style.justifyContent = 'flex-start';
        wrapper.style.gap = '8px';
        wrapper.style.marginTop = '8px';

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Code';
        styleButton(saveButton);

        saveButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const codeElement = codeBlock.querySelector('code');
            if (codeElement) {
                const text = codeElement.textContent;
                const languageClass = codeElement.className;
                const extension = getFileExtension(languageClass);
                downloadFile(text, `code.${extension}`, saveButton);
            }
        });

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy Code';
        styleButton(copyButton);

        copyButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const codeElement = codeBlock.querySelector('code');
            if (codeElement) {
                const text = codeElement.textContent;
                copyToClipboard(text, copyButton);
            }
        });

        // Set default text for buttons
        saveButton.dataset.defaultText = 'Save Code';
        copyButton.dataset.defaultText = 'Copy Code';

        codeBlock.parentNode.insertBefore(wrapper, codeBlock.nextSibling);
        wrapper.appendChild(saveButton);
        wrapper.appendChild(copyButton);
    };

    // Function to style the buttons
    const styleButton = (button) => {
        Object.assign(button.style, {
            display: 'inline-block',
            padding: '8px',
            background: '#007bff', // Default standby color
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
        });

        button.addEventListener('mouseover', () => {
            if (button.textContent === 'Saving...' || button.textContent === 'Copied!' || button.textContent === 'Could not download' || button.textContent === 'Could not copy') {
                button.style.backgroundColor = button.textContent.includes('Could not') ? 'darkred' : 'darkgreen';
            } else {
                button.style.backgroundColor = '#0056b3'; // Darker blue for standby
            }
        });

        button.addEventListener('mouseout', () => {
            if (button.textContent === 'Saving...' || button.textContent === 'Copied!' || button.textContent === 'Could not download' || button.textContent === 'Could not copy') {
                button.style.backgroundColor = button.textContent.includes('Could not') ? 'red' : 'green';
            } else {
                button.style.backgroundColor = '#007bff'; // Default blue for standby
            }
        });
    };

    // Function to observe code blocks and add buttons
    const observeCodeBlocks = () => {
        const codeBlocks = document.querySelectorAll('pre:not(.processed)');
        codeBlocks.forEach(block => {
            addButtonsToCodeBlock(block);
            block.classList.add('processed');
        });
    };

    // Mutation observer to detect new code blocks added dynamically
    const observer = new MutationObserver(observeCodeBlocks);
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial call to process existing code blocks
    observeCodeBlocks();

})();

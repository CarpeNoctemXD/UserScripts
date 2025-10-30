// ==UserScript==
// @name         VSIX Manual Downloader
// @name:el      Λήψη VSIX Χειροκίνητα
// @namespace    https://github.com/CarpeNoctemXD/UserScripts
// @version      1.0.0
// @description  Manual downloader for specific versions of VSCode (VSIX) extensions from the Marketplace.
// @description:el  Επιλογή και λήψη συγκεκριμένης έκδοσης για επεκτάσεις του VSCode (VSIX) από το Marketplace.
// @author       CarpeNoctemXD
// @match        https://marketplace.visualstudio.com/items?itemName=*
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://marketplace.visualstudio.com
// @updateURL    https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/visualstudio/vs-marketplace-manual_vsix_downloader.user.js
// @downloadURL  https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/visualstudio/vs-marketplace-manual_vsix_downloader.user.js
// @license      MIT
// ==/UserScript==

/* Changelog
------------------------------------------------------------
- 1.0.0 - 2025-10-30
    - Added: Major UI redesign 
    - Fixed: Toast notifications 

- 0.9.0 - 2025-05-20
    - Initial release
------------------------------------------------------------
*/

(function () {
    'use strict';

    class VSIXDownloader {
        constructor() {
            this.publisher = null;
            this.extension = null;
            this.itemName = null;
            this.cachedVersions = null;
            this.selectedVersions = new Set();
            this.isDarkMode = this.detectDarkMode();
            this.toastQueue = [];
            this.isShowingToast = false;
            this.init();
        }

        init() {
            this.parseUrlParams();
            if (this.isValidPage()) {
                this.injectStyles();
                this.injectFloatingButton();
            }
        }

        detectDarkMode() {
            return document.documentElement.getAttribute('data-theme') === 'dark' ||
                   document.body.classList.contains('vscode-dark') ||
                   window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        parseUrlParams() {
            const urlParams = new URLSearchParams(window.location.search);
            this.itemName = urlParams.get('itemName');
            if (this.itemName?.includes('.')) {
                [this.publisher, this.extension] = this.itemName.split('.');
            }
        }

        isValidPage() {
            return this.publisher && this.extension;
        }

        injectStyles() {
            const style = document.createElement('style');
            style.textContent = `
                :root {
                    --midnight-blue: #191970ff;
                    --oxford-blue: #002147ff;
                    --indigo-dye: #10467dff;
                    --red-pantone: #ef233cff;
                    --spring-green: #00fa9aff;
                    --cool-gray: #8d99aeff;
                    --rich-black: #000317ff;
                    --rich-black-2: #0b1020ff;
                    --rich-black-3: #151c28ff;
                    --ghost-white: #f8f8ffff;

                    --primary: var(--midnight-blue);
                    --secondary: var(--oxford-blue);
                    --tertiary: var(--indigo-dye);
                    --accent-1: var(--red-pantone);
                    --accent-2: var(--spring-green);
                    --accent-3: var(--cool-gray);
                    --bg-1: var(--rich-black);
                    --bg-2: var(--rich-black-2);
                    --bg-3: var(--rich-black-3);
                    --neutral: var(--ghost-white);

                    --text-xs: 11px;
                    --text-sm: 12px;
                    --text-base: 13px;
                    --text-lg: 15px;
                    --text-xl: 16px;

                    --space-1: 4px;
                    --space-2: 8px;
                    --space-3: 12px;
                    --space-4: 16px;
                    --space-5: 20px;

                    --radius-sm: 4px;
                    --radius-md: 6px;
                    --radius-lg: 8px;
                    --radius-xl: 12px;

                    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
                    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
                    --shadow-lg: 0 6px 20px rgba(0, 0, 0, 0.5);
                    --shadow-accent: 0 4px 15px rgba(0, 250, 154, 0.4);

                    --transition-fast: 0.2s ease;
                    --transition-base: 0.3s ease;
                    --transition-smooth: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes vsixFadeIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                @keyframes vsixSlideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }

                @keyframes vsixSlideOut {
                    from { transform: translateX(0); }
                    to { transform: translateX(100%); }
                }

                @keyframes vsixSpin {
                    to { transform: rotate(360deg); }
                }

                @keyframes vsixBounce {
                    0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
                    40%, 43% { transform: translate3d(0,-8px,0); }
                    70% { transform: translate3d(0,-4px,0); }
                    90% { transform: translate3d(0,-2px,0); }
                }

                .vsix-floating-btn {
                    position: fixed;
                    bottom: var(--space-5);
                    right: var(--space-5);
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, var(--accent-2), var(--tertiary));
                    border: none;
                    border-radius: 50%;
                    color: var(--neutral);
                    cursor: pointer;
                    box-shadow: var(--shadow-lg);
                    z-index: 10000;
                    transition: var(--transition-smooth);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    backdrop-filter: blur(10px);
                    border: 1px solid var(--tertiary);
                }

                .vsix-floating-btn:hover {
                    transform: translateY(-2px) scale(1.05);
                    box-shadow: var(--shadow-accent);
                    animation: vsixBounce 1s ease;
                }

                .vsix-floating-btn:active {
                    transform: translateY(0) scale(0.95);
                }

                .vsix-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(8px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10001;
                    opacity: 0;
                    transition: opacity var(--transition-base);
                    padding: var(--space-5);
                }

                .vsix-overlay.active {
                    opacity: 1;
                }

                .vsix-card {
                    background: linear-gradient(135deg, var(--bg-2), var(--bg-3));
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-lg);
                    width: 90%;
                    max-width: 500px;
                    max-height: 85vh;
                    overflow: hidden;
                    animation: vsixFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid var(--tertiary);
                    backdrop-filter: blur(10px);
                }

                .vsix-header {
                    padding: var(--space-5);
                    border-bottom: 1px solid var(--tertiary);
                    background: linear-gradient(135deg, var(--bg-2), var(--bg-3));
                    position: relative;
                    overflow: hidden;
                }

                .vsix-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, var(--accent-2), var(--tertiary));
                }

                .vsix-title {
                    font-size: var(--text-xl);
                    font-weight: 700;
                    margin: 0 0 var(--space-2) 0;
                    color: var(--neutral);
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                }

                .vsix-subtitle {
                    font-size: var(--text-sm);
                    color: var(--accent-3);
                    margin: 0;
                }

                .vsix-search-section {
                    padding: var(--space-4) var(--space-5);
                    border-bottom: 1px solid var(--tertiary);
                    background: var(--bg-2);
                }

                .vsix-search {
                    width: 100%;
                    padding: var(--space-3) var(--space-4);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: var(--radius-md);
                    font-size: var(--text-base);
                    background: linear-gradient(135deg, var(--bg-2), var(--bg-3));
                    color: var(--neutral);
                    transition: var(--transition-base);
                }

                .vsix-search:focus {
                    outline: none;
                    border-color: var(--accent-2);
                    box-shadow: 0 0 0 3px rgba(0, 250, 154, 0.15);
                }

                .vsix-list {
                    max-height: 400px;
                    overflow-y: auto;
                    padding: var(--space-2);
                }

                .vsix-list::-webkit-scrollbar {
                    width: 6px;
                }

                .vsix-list::-webkit-scrollbar-track {
                    background: var(--bg-2);
                    border-radius: var(--radius-sm);
                }

                .vsix-list::-webkit-scrollbar-thumb {
                    background: var(--tertiary);
                    border-radius: var(--radius-sm);
                }

                .vsix-list::-webkit-scrollbar-thumb:hover {
                    background: var(--accent-2);
                }

                .vsix-version-item {
                    display: flex;
                    align-items: center;
                    padding: var(--space-4);
                    margin: var(--space-1) 0;
                    border-radius: var(--radius-lg);
                    border: 1px solid transparent;
                    transition: var(--transition-smooth);
                    cursor: pointer;
                    background: linear-gradient(135deg, var(--bg-2), var(--bg-3));
                }

                .vsix-version-item:hover {
                    background: rgba(16, 70, 125, 0.1);
                    border-color: var(--tertiary);
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-sm);
                }

                .vsix-version-item.selected {
                    background: rgba(0, 250, 154, 0.15);
                    border-color: var(--accent-2);
                }

                .vsix-version-item.latest {
                    background: linear-gradient(135deg, rgba(108,92,231,0.1), rgba(0,120,212,0.1));
                    border: 1px solid rgba(108,92,231,0.3);
                }

                .vsix-version-item.latest.selected {
                    background: linear-gradient(135deg, rgba(0, 250, 154, 0.25), rgba(108,92,231,0.15));
                    border-color: var(--accent-2);
                }

                .vsix-checkbox {
                    width: 18px;
                    height: 18px;
                    margin-right: var(--space-3);
                    cursor: pointer;
                    accent-color: var(--accent-2);
                }

                .vsix-version-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-1);
                }

                .vsix-version-number {
                    font-weight: 600;
                    font-size: var(--text-base);
                    color: var(--neutral);
                }

                .vsix-version-date {
                    font-size: var(--text-xs);
                    color: var(--accent-3);
                }

                .vsix-badge-latest {
                    background: linear-gradient(135deg, var(--accent-2), var(--tertiary));
                    color: var(--neutral);
                    padding: var(--space-1) var(--space-2);
                    border-radius: 10px;
                    font-size: var(--text-xs);
                    font-weight: 600;
                    margin-left: var(--space-2);
                }

                .vsix-batch-section {
                    padding: var(--space-4) var(--space-5);
                    border-top: 1px solid var(--tertiary);
                    background: var(--bg-2);
                }

                .vsix-selected-count {
                    font-size: var(--text-sm);
                    margin-bottom: var(--space-3);
                    color: var(--neutral);
                }

                .vsix-batch-buttons {
                    display: flex;
                    gap: var(--space-2);
                }

                .vsix-btn {
                    flex: 1;
                    padding: var(--space-3) var(--space-4);
                    border: none;
                    border-radius: var(--radius-md);
                    font-size: var(--text-sm);
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition-smooth);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-2);
                }

                .vsix-btn-primary {
                    background: linear-gradient(135deg, var(--accent-2), var(--tertiary));
                    color: var(--neutral);
                }

                .vsix-btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-accent);
                }

                .vsix-btn-secondary {
                    background: linear-gradient(135deg, var(--bg-2), var(--tertiary));
                    color: var(--neutral);
                }

                .vsix-btn-secondary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }

                .vsix-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .vsix-custom-section {
                    padding: var(--space-4) var(--space-5);
                    border-top: 1px solid var(--tertiary);
                }

                .vsix-input-group {
                    display: flex;
                    gap: var(--space-2);
                }

                .vsix-input {
                    flex: 1;
                    padding: var(--space-3) var(--space-3);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: var(--radius-md);
                    font-size: var(--text-base);
                    background: linear-gradient(135deg, var(--bg-2), var(--bg-3));
                    color: var(--neutral);
                    transition: var(--transition-base);
                }

                .vsix-input:focus {
                    outline: none;
                    border-color: var(--accent-2);
                    box-shadow: 0 0 0 3px rgba(0, 250, 154, 0.15);
                }

                .vsix-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: var(--space-5);
                    color: var(--accent-3);
                    flex-direction: column;
                    gap: var(--space-3);
                }

                .vsix-spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid var(--bg-2);
                    border-top: 3px solid var(--accent-2);
                    border-radius: 50%;
                    animation: vsixSpin 1s linear infinite;
                }

                .vsix-empty {
                    text-align: center;
                    padding: var(--space-5) var(--space-4);
                    color: var(--accent-3);
                }

                .vsix-empty-icon {
                    font-size: 48px;
                    margin-bottom: var(--space-4);
                    opacity: 0.5;
                }

                /* Improved Toast Notifications */
                .vsix-toast {
                    position: fixed;
                    top: var(--space-5);
                    right: var(--space-5);
                    padding: var(--space-3) var(--space-4);
                    border-radius: var(--radius-lg);
                    color: var(--bg-1);
                    font-weight: 600;
                    z-index: 10002;
                    animation: vsixSlideIn var(--transition-fast);
                    box-shadow: var(--shadow-lg);
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    max-width: 300px;
                    backdrop-filter: blur(10px);
                    border: 1px solid;
                    font-size: var(--text-sm);
                }

                .vsix-toast.success {
                    background: linear-gradient(135deg, var(--accent-2), #00cc88);
                    border-color: var(--accent-2);
                    color: var(--bg-1);
                }

                .vsix-toast.error {
                    background: linear-gradient(135deg, var(--accent-1), #cc3344);
                    border-color: var(--accent-1);
                    color: var(--neutral);
                }

                .vsix-toast.sliding-out {
                    animation: vsixSlideOut var(--transition-fast) forwards;
                }

                .vsix-close-btn {
                    position: absolute;
                    top: var(--space-4);
                    right: var(--space-4);
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: var(--accent-3);
                    cursor: pointer;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: var(--transition-base);
                }

                .vsix-close-btn:hover {
                    background: rgba(255,255,255,0.1);
                    color: var(--neutral);
                }

                @media (max-width: 768px) {
                    .vsix-card {
                        width: 95%;
                        margin: 0;
                    }

                    .vsix-floating-btn {
                        bottom: var(--space-4);
                        right: var(--space-4);
                    }

                    .vsix-toast {
                        right: var(--space-2);
                        left: var(--space-2);
                        max-width: none;
                    }
                }

                .vsix-btn:focus,
                .vsix-input:focus,
                .vsix-search:focus {
                    outline: none;
                }

                .vsix-btn:focus-visible {
                    outline: 2px solid var(--accent-2);
                    outline-offset: 2px;
                }

                .vsix-version-item:focus-visible {
                    outline: 2px solid var(--accent-2);
                    outline-offset: 2px;
                }
            `;
            document.head.appendChild(style);
        }

        createToast(message, type = 'success') {
            // Add to queue
            this.toastQueue.push({ message, type });
            
            // If no toast is currently showing, show the next one
            if (!this.isShowingToast) {
                this.showNextToast();
            }
        }

        showNextToast() {
            if (this.toastQueue.length === 0) {
                this.isShowingToast = false;
                return;
            }

            this.isShowingToast = true;
            const { message, type } = this.toastQueue.shift();

            const toast = document.createElement('div');
            toast.className = `vsix-toast ${type}`;
            
            const icon = document.createElement('span');
            icon.textContent = type === 'success' ? '✓' : '✕';
            icon.style.fontWeight = 'bold';
            
            const text = document.createElement('span');
            text.textContent = message;

            toast.appendChild(icon);
            toast.appendChild(text);

            document.body.appendChild(toast);

            // Auto remove after 3 seconds
            setTimeout(() => {
                toast.classList.add('sliding-out');
                setTimeout(() => {
                    toast.remove();
                    this.showNextToast();
                }, 300);
            }, 3000);
        }

        injectFloatingButton() {
            const button = document.createElement('button');
            button.className = 'vsix-floating-btn';
            button.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
            `;
            button.title = 'Download VSIX Versions';
            button.setAttribute('aria-label', 'Open VSIX version downloader');

            button.addEventListener('click', () => this.showVersionSelector());
            document.body.appendChild(button);
        }

        async showVersionSelector() {
            const overlay = this.createOverlay();
            document.body.appendChild(overlay);

            try {
                const versions = await this.getVersions();
                this.showVersionList(overlay, versions);
            } catch (error) {
                this.showErrorState(overlay, error.message);
            }
        }

        createOverlay() {
            const overlay = document.createElement('div');
            overlay.className = 'vsix-overlay';
            overlay.innerHTML = `
                <div class="vsix-card">
                    <div class="vsix-loading">
                        <div class="vsix-spinner"></div>
                        <div>Loading versions...</div>
                    </div>
                </div>
            `;

            setTimeout(() => overlay.classList.add('active'), 10);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.closeOverlay(overlay);
            });

            return overlay;
        }

        closeOverlay(overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }

        showVersionList(overlay, versions) {
            overlay.innerHTML = `
                <div class="vsix-card">
                    <div class="vsix-header">
                        <h2 class="vsix-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                            </svg>
                            Download VSIX
                        </h2>
                        <p class="vsix-subtitle">${this.itemName}</p>
                        <button class="vsix-close-btn" title="Close" aria-label="Close dialog">×</button>
                    </div>

                    <div class="vsix-search-section">
                        <input type="text" class="vsix-search" placeholder="Search versions..." id="vsix-search" aria-label="Search versions">
                    </div>

                    <div class="vsix-list" id="vsix-list">
                        ${versions.length === 0 ? this.createEmptyState() : ''}
                        ${versions.map((version, index) => this.createVersionItem(version, index === 0)).join('')}
                    </div>

                    <div class="vsix-batch-section" id="vsix-batch-section" style="display: none;">
                        <div class="vsix-selected-count" id="vsix-selected-count">Selected: 0 versions</div>
                        <div class="vsix-batch-buttons">
                            <button class="vsix-btn vsix-btn-primary" id="vsix-batch-download">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                                </svg>
                                Download Selected
                            </button>
                            <button class="vsix-btn vsix-btn-secondary" id="vsix-batch-clear">Clear</button>
                        </div>
                    </div>

                    <div class="vsix-custom-section">
                        <div class="vsix-input-group">
                            <input type="text" class="vsix-input" placeholder="Enter custom version (e.g., 1.2.3)" id="vsix-custom-input" aria-label="Custom version input">
                            <button class="vsix-btn vsix-btn-primary" id="vsix-custom-download">Download</button>
                        </div>
                    </div>
                </div>
            `;

            this.setupEventListeners(overlay);
        }

        showErrorState(overlay, message) {
            overlay.innerHTML = `
                <div class="vsix-card">
                    <div class="vsix-empty">
                        <div class="vsix-empty-icon">⚠</div>
                        <h3>Unable to Load Versions</h3>
                        <p>${message}</p>
                        <button class="vsix-btn vsix-btn-primary" id="vsix-close-error">Close</button>
                    </div>
                </div>
            `;

            overlay.querySelector('#vsix-close-error').addEventListener('click', () => {
                this.closeOverlay(overlay);
            });
        }

        createVersionItem(versionData, isLatest) {
            const { version, dateText } = versionData;
            const latestClass = isLatest ? 'latest' : '';

            return `
                <div class="vsix-version-item ${latestClass}" data-version="${version}">
                    <input type="checkbox" class="vsix-checkbox" aria-label="Select version ${version}">
                    <div class="vsix-version-content">
                        <div class="vsix-version-number">
                            ${version}
                            ${isLatest ? '<span class="vsix-badge-latest">Latest</span>' : ''}
                        </div>
                        <div class="vsix-version-date">${dateText}</div>
                    </div>
                </div>
            `;
        }

        createEmptyState() {
            return `
                <div class="vsix-empty">
                    <div class="vsix-empty-icon">📦</div>
                    <h3>No Versions Found</h3>
                    <p>Unable to load version history from this page.</p>
                </div>
            `;
        }

        setupEventListeners(overlay) {
            const card = overlay.querySelector('.vsix-card');

            card.querySelector('.vsix-close-btn').addEventListener('click', () => this.closeOverlay(overlay));

            card.querySelector('#vsix-search').addEventListener('input', (e) => this.filterVersions(e.target.value));

            card.querySelectorAll('.vsix-version-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (e.target.type !== 'checkbox') {
                        const checkbox = item.querySelector('.vsix-checkbox');
                        checkbox.checked = !checkbox.checked;
                        this.handleCheckboxChange(checkbox, item);
                    }
                });
            });

            card.querySelectorAll('.vsix-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    this.handleCheckboxChange(e.target, e.target.closest('.vsix-version-item'));
                });
            });

            card.querySelector('#vsix-batch-download').addEventListener('click', () => this.downloadSelectedVersions());
            card.querySelector('#vsix-batch-clear').addEventListener('click', () => this.clearSelection(card));
            card.querySelector('#vsix-custom-download').addEventListener('click', () => this.handleCustomDownload(card));

            card.querySelector('#vsix-custom-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') card.querySelector('#vsix-custom-download').click();
            });
        }

        handleCheckboxChange(checkbox, item) {
            const version = item.dataset.version;
            checkbox.checked ? this.selectedVersions.add(version) : this.selectedVersions.delete(version);
            item.classList.toggle('selected', checkbox.checked);
            this.updateBatchUI(item.closest('.vsix-card'));
        }

        clearSelection(card) {
            this.selectedVersions.clear();
            this.updateBatchUI(card);
        }

        handleCustomDownload(card) {
            const customInput = card.querySelector('#vsix-custom-input');
            const version = customInput.value.trim();
            if (version) {
                this.downloadVersion(version);
                customInput.value = '';
            } else {
                this.createToast('Please enter a version number', 'error');
            }
        }

        filterVersions(searchTerm) {
            const items = document.querySelectorAll('.vsix-version-item');
            const term = searchTerm.toLowerCase();

            items.forEach(item => {
                const version = item.dataset.version.toLowerCase();
                const date = item.querySelector('.vsix-version-date').textContent.toLowerCase();
                const matches = version.includes(term) || date.includes(term);
                item.style.display = matches ? 'flex' : 'none';
            });
        }

        updateBatchUI(card) {
            const batchSection = card.querySelector('#vsix-batch-section');
            const selectedCount = card.querySelector('#vsix-selected-count');
            const batchDownloadBtn = card.querySelector('#vsix-batch-download');

            selectedCount.textContent = `Selected: ${this.selectedVersions.size} version(s)`;
            batchSection.style.display = this.selectedVersions.size > 0 ? 'block' : 'none';
            batchDownloadBtn.disabled = this.selectedVersions.size === 0;

            card.querySelectorAll('.vsix-checkbox').forEach(checkbox => {
                const version = checkbox.closest('.vsix-version-item').dataset.version;
                checkbox.checked = this.selectedVersions.has(version);
                checkbox.closest('.vsix-version-item').classList.toggle('selected', checkbox.checked);
            });
        }

        async getVersions() {
            if (this.cachedVersions) return this.cachedVersions;

            window.location.hash = 'version-history';
            await new Promise(resolve => setTimeout(resolve, 1000));

            const versions = this.extractVersionsFromDOM();
            if (versions.length === 0) throw new Error('No version history found on this page');

            this.cachedVersions = versions;
            return versions;
        }

        extractVersionsFromDOM() {
            const versions = [];
            const selectors = [
                '.version-history-table-body .version-history-container-row',
                '.version-history-row',
                '[data-bi-id="version-history-row"]',
                '.version-table tbody tr'
            ];

            let rows = [];
            for (const selector of selectors) {
                rows = document.querySelectorAll(selector);
                if (rows.length > 0) break;
            }

            if (rows.length === 0) {
                const tables = document.querySelectorAll('table');
                for (const table of tables) {
                    const rows = table.querySelectorAll('tr');
                    for (const row of rows) {
                        const cells = row.querySelectorAll('td');
                        if (cells.length >= 2) {
                            const versionCell = cells[0];
                            const dateCell = cells[2] || cells[1];
                            if (versionCell && dateCell) {
                                const version = versionCell.textContent.trim();
                                const dateText = dateCell.textContent.trim();
                                if (version && /^\d+\.\d+\.\d+/.test(version)) {
                                    versions.push({ version, dateText });
                                }
                            }
                        }
                    }
                }
            } else {
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    const versionCell = cells[0];
                    const dateCell = cells[2] || cells[1];

                    if (versionCell && dateCell) {
                        const version = versionCell.textContent.trim();
                        const dateText = dateCell.textContent.trim();
                        versions.push({ version, dateText });
                    }
                });
            }

            return versions;
        }

        constructDownloadUrl(version) {
            return `https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${this.publisher}/vsextensions/${this.extension}/${version}/vspackage`;
        }

        downloadVersion(version) {
            try {
                const downloadUrl = this.constructDownloadUrl(version);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `${this.itemName}-${version}.vsix`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                this.createToast(`Downloaded ${version}`, 'success');
            } catch (error) {
                this.createToast(`Failed to download ${version}`, 'error');
                console.error('Download error:', error);
            }
        }

        async downloadSelectedVersions() {
            if (this.selectedVersions.size === 0) {
                this.createToast('Please select at least one version', 'error');
                return;
            }

            const versions = Array.from(this.selectedVersions);
            
            // Show batch download started notification
            this.createToast(`Starting download of ${versions.length} version(s)...`, 'success');
            
            for (let i = 0; i < versions.length; i++) {
                this.downloadVersion(versions[i]);
                if (i < versions.length - 1) await new Promise(resolve => setTimeout(resolve, 500));
            }

            this.selectedVersions.clear();
            const card = document.querySelector('.vsix-card');
            if (card) this.updateBatchUI(card);
        }
    }

    new VSIXDownloader();
})();
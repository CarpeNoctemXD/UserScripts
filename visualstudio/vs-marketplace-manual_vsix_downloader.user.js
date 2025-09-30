// ==UserScript==
// @name         VS Code Extension (VSIX) Manual Downloader
// @name:el      Λήψη Επεκτάσεων VS Code (VSIX) Χειροκίνητα 
// @namespace    https://github.com/CarpeNoctemXD/UserScripts
// @version      0.9.0
// @description  Enhanced version selector with modern UI for downloading VSIX files from Marketplace.
// @description:el  Βελτιωμένος επιλογέας έκδοσης με μοντέρνο UI για λήψη VSIX αρχείων από το Marketplace.
// @author       CarpeNoctemXD
// @match        https://marketplace.visualstudio.com/items?itemName=*
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://marketplace.visualstudio.com
// @updateURL    https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/visualstudio/vs-marketplace-manual_vsix_downloader.user.js
// @downloadURL  https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/visualstudio/vs-marketplace-manual_vsix_downloader.user.js
// @license      MIT
// ==/UserScript==

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
                /* Modern Design System */
                :root {
                    --vsix-primary: #0078d4;
                    --vsix-primary-dark: #106ebe;
                    --vsix-secondary: #6c5ce7;
                    --vsix-success: #00b894;
                    --vsix-warning: #fdcb6e;
                    --vsix-error: #d63031;
                    --vsix-surface: #ffffff;
                    --vsix-surface-dark: #1e1e1e;
                    --vsix-text: #2d3436;
                    --vsix-text-dark: #ffffff;
                    --vsix-border: #e0e0e0;
                    --vsix-border-dark: #404040;
                    --vsix-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    --vsix-shadow-dark: 0 8px 32px rgba(0,0,0,0.3);
                    --vsix-radius: 12px;
                    --vsix-radius-sm: 8px;
                    --vsix-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* Animations */
                @keyframes vsixFadeIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                @keyframes vsixSlideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
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

                /* Floating Action Button */
                .vsix-floating-btn {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, var(--vsix-primary), var(--vsix-secondary));
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    box-shadow: var(--vsix-shadow);
                    z-index: 10000;
                    transition: var(--vsix-transition);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    backdrop-filter: blur(10px);
                }

                .vsix-floating-btn:hover {
                    transform: translateY(-2px) scale(1.05);
                    box-shadow: 0 12px 40px rgba(0,120,212,0.3);
                    animation: vsixBounce 1s ease;
                }

                .vsix-floating-btn:active {
                    transform: translateY(0) scale(0.95);
                }

                .vsix-floating-btn.dark {
                    background: linear-gradient(135deg, #4a90e2, #7c4dff);
                }

                /* Enhanced Overlay */
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
                    transition: opacity 0.3s ease;
                    padding: 20px;
                }

                .vsix-overlay.active {
                    opacity: 1;
                }

                /* Modern Card Design */
                .vsix-card {
                    background: var(--vsix-surface);
                    border-radius: var(--vsix-radius);
                    box-shadow: var(--vsix-shadow);
                    width: 90%;
                    max-width: 500px;
                    max-height: 85vh;
                    overflow: hidden;
                    animation: vsixFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid var(--vsix-border);
                }

                .vsix-card.dark {
                    background: var(--vsix-surface-dark);
                    box-shadow: var(--vsix-shadow-dark);
                    border-color: var(--vsix-border-dark);
                    color: var(--vsix-text-dark);
                }

                /* Card Header */
                .vsix-header {
                    padding: 24px;
                    border-bottom: 1px solid var(--vsix-border);
                    background: linear-gradient(135deg, #f8f9fa, #ffffff);
                    position: relative;
                    overflow: hidden;
                }

                .vsix-header.dark {
                    background: linear-gradient(135deg, #2d3436, #1e1e1e);
                    border-bottom-color: var(--vsix-border-dark);
                }

                .vsix-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, var(--vsix-primary), var(--vsix-secondary));
                }

                .vsix-title {
                    font-size: 20px;
                    font-weight: 700;
                    margin: 0 0 8px 0;
                    color: var(--vsix-text);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .vsix-title.dark {
                    color: var(--vsix-text-dark);
                }

                .vsix-subtitle {
                    font-size: 14px;
                    color: #666;
                    margin: 0;
                }

                .vsix-subtitle.dark {
                    color: #aaa;
                }

                /* Search and Filters */
                .vsix-search-section {
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--vsix-border);
                    background: #fafafa;
                }

                .vsix-search-section.dark {
                    background: #252525;
                    border-bottom-color: var(--vsix-border-dark);
                }

                .vsix-search {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid var(--vsix-border);
                    border-radius: var(--vsix-radius-sm);
                    font-size: 14px;
                    background: var(--vsix-surface);
                    color: var(--vsix-text);
                    transition: var(--vsix-transition);
                }

                .vsix-search:focus {
                    outline: none;
                    border-color: var(--vsix-primary);
                    box-shadow: 0 0 0 3px rgba(0,120,212,0.1);
                }

                .vsix-search.dark {
                    background: var(--vsix-surface-dark);
                    border-color: var(--vsix-border-dark);
                    color: var(--vsix-text-dark);
                }

                /* Version List */
                .vsix-list {
                    max-height: 400px;
                    overflow-y: auto;
                    padding: 8px;
                }

                .vsix-list::-webkit-scrollbar {
                    width: 6px;
                }

                .vsix-list::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }

                .vsix-list::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 3px;
                }

                .vsix-list::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }

                .vsix-version-item {
                    display: flex;
                    align-items: center;
                    padding: 16px;
                    margin: 4px 0;
                    border-radius: var(--vsix-radius-sm);
                    border: 1px solid transparent;
                    transition: var(--vsix-transition);
                    cursor: pointer;
                    background: var(--vsix-surface);
                }

                .vsix-version-item:hover {
                    background: #f8f9fa;
                    border-color: var(--vsix-border);
                    transform: translateX(4px);
                }

                .vsix-version-item.dark {
                    background: var(--vsix-surface-dark);
                }

                .vsix-version-item.dark:hover {
                    background: #2a2a2a;
                    border-color: var(--vsix-border-dark);
                }

                .vsix-version-item.selected {
                    background: rgba(0,120,212,0.1);
                    border-color: var(--vsix-primary);
                }

                .vsix-version-item.latest {
                    background: linear-gradient(135deg, rgba(108,92,231,0.1), rgba(0,120,212,0.1));
                    border: 1px solid rgba(108,92,231,0.3);
                }

                .vsix-checkbox {
                    width: 18px;
                    height: 18px;
                    margin-right: 12px;
                    cursor: pointer;
                    accent-color: var(--vsix-primary);
                }

                .vsix-version-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .vsix-version-number {
                    font-weight: 600;
                    font-size: 14px;
                    color: var(--vsix-text);
                }

                .vsix-version-number.dark {
                    color: var(--vsix-text-dark);
                }

                .vsix-version-date {
                    font-size: 12px;
                    color: #666;
                }

                .vsix-version-date.dark {
                    color: #aaa;
                }

                .vsix-badge-latest {
                    background: linear-gradient(135deg, var(--vsix-secondary), var(--vsix-primary));
                    color: white;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: 600;
                    margin-left: 8px;
                }

                /* Batch Controls */
                .vsix-batch-section {
                    padding: 16px 24px;
                    border-top: 1px solid var(--vsix-border);
                    background: #fafafa;
                }

                .vsix-batch-section.dark {
                    background: #252525;
                    border-top-color: var(--vsix-border-dark);
                }

                .vsix-selected-count {
                    font-size: 14px;
                    margin-bottom: 12px;
                    color: var(--vsix-text);
                }

                .vsix-selected-count.dark {
                    color: var(--vsix-text-dark);
                }

                .vsix-batch-buttons {
                    display: flex;
                    gap: 8px;
                }

                .vsix-btn {
                    flex: 1;
                    padding: 10px 16px;
                    border: none;
                    border-radius: var(--vsix-radius-sm);
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--vsix-transition);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }

                .vsix-btn-primary {
                    background: var(--vsix-primary);
                    color: white;
                }

                .vsix-btn-primary:hover {
                    background: var(--vsix-primary-dark);
                    transform: translateY(-1px);
                }

                .vsix-btn-secondary {
                    background: #6c757d;
                    color: white;
                }

                .vsix-btn-secondary:hover {
                    background: #5a6268;
                    transform: translateY(-1px);
                }

                .vsix-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                /* Custom Version Input */
                .vsix-custom-section {
                    padding: 16px 24px;
                    border-top: 1px solid var(--vsix-border);
                }

                .vsix-custom-section.dark {
                    border-top-color: var(--vsix-border-dark);
                }

                .vsix-input-group {
                    display: flex;
                    gap: 8px;
                }

                .vsix-input {
                    flex: 1;
                    padding: 10px 12px;
                    border: 1px solid var(--vsix-border);
                    border-radius: var(--vsix-radius-sm);
                    font-size: 14px;
                    background: var(--vsix-surface);
                    color: var(--vsix-text);
                    transition: var(--vsix-transition);
                }

                .vsix-input:focus {
                    outline: none;
                    border-color: var(--vsix-primary);
                    box-shadow: 0 0 0 3px rgba(0,120,212,0.1);
                }

                .vsix-input.dark {
                    background: var(--vsix-surface-dark);
                    border-color: var(--vsix-border-dark);
                    color: var(--vsix-text-dark);
                }

                /* Loading States */
                .vsix-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    color: #666;
                    flex-direction: column;
                    gap: 12px;
                }

                .vsix-loading.dark {
                    color: #aaa;
                }

                .vsix-spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid var(--vsix-primary);
                    border-radius: 50%;
                    animation: vsixSpin 1s linear infinite;
                }

                /* Empty State */
                .vsix-empty {
                    text-align: center;
                    padding: 40px 20px;
                    color: #666;
                }

                .vsix-empty.dark {
                    color: #aaa;
                }

                .vsix-empty-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }

                /* Toast Notifications */
                .vsix-toast {
                    position: fixed;
                    top: 24px;
                    right: 24px;
                    padding: 16px 20px;
                    border-radius: var(--vsix-radius);
                    color: white;
                    font-weight: 600;
                    z-index: 10002;
                    animation: vsixSlideIn 0.3s ease;
                    box-shadow: var(--vsix-shadow);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    max-width: 300px;
                }

                .vsix-toast.success {
                    background: var(--vsix-success);
                }

                .vsix-toast.error {
                    background: var(--vsix-error);
                }

                /* Close button */
                .vsix-close-btn {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #666;
                    cursor: pointer;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: var(--vsix-transition);
                }

                .vsix-close-btn:hover {
                    background: rgba(0,0,0,0.1);
                    color: #333;
                }

                .vsix-close-btn.dark {
                    color: #aaa;
                }

                .vsix-close-btn.dark:hover {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .vsix-card {
                        width: 95%;
                        margin: 0;
                    }

                    .vsix-floating-btn {
                        bottom: 16px;
                        right: 16px;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        createToast(message, type = 'success') {
            const toast = document.createElement('div');
            toast.className = `vsix-toast ${type}`;
            toast.textContent = message;

            const icon = document.createElement('span');
            icon.textContent = type === 'success' ? '✓' : '✕';
            toast.insertBefore(icon, toast.firstChild);

            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.animation = 'vsixSlideIn 0.3s ease reverse';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, 3000);
        }

        injectFloatingButton() {
            const button = document.createElement('button');
            button.className = `vsix-floating-btn ${this.isDarkMode ? 'dark' : ''}`;
            button.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
            `;
            button.title = 'Download VSIX Versions';

            button.addEventListener('click', () => {
                this.showVersionSelector();
            });

            document.body.appendChild(button);
            this.floatingButton = button;
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
            overlay.className = `vsix-overlay ${this.isDarkMode ? 'dark' : ''}`;

            // Show loading state initially
            overlay.innerHTML = `
                <div class="vsix-card ${this.isDarkMode ? 'dark' : ''}">
                    <div class="vsix-loading ${this.isDarkMode ? 'dark' : ''}">
                        <div class="vsix-spinner"></div>
                        <div>Loading versions...</div>
                    </div>
                </div>
            `;

            setTimeout(() => overlay.classList.add('active'), 10);

            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeOverlay(overlay);
                }
            });

            return overlay;
        }

        closeOverlay(overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }

        showVersionList(overlay, versions) {
            const themeClass = this.isDarkMode ? 'dark' : '';

            overlay.innerHTML = `
                <div class="vsix-card ${themeClass}">
                    <div class="vsix-header ${themeClass}">
                        <h2 class="vsix-title ${themeClass}">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                            </svg>
                            Download VSIX
                        </h2>
                        <p class="vsix-subtitle ${themeClass}">${this.itemName}</p>
                        <button class="vsix-close-btn ${themeClass}" title="Close">×</button>
                    </div>

                    <div class="vsix-search-section ${themeClass}">
                        <input type="text" class="vsix-search ${themeClass}" placeholder="Search versions..." id="vsix-search">
                    </div>

                    <div class="vsix-list" id="vsix-list">
                        ${versions.length === 0 ? this.createEmptyState() : ''}
                        ${versions.map((version, index) => this.createVersionItem(version, index === 0)).join('')}
                    </div>

                    <div class="vsix-batch-section ${themeClass}" id="vsix-batch-section" style="display: none;">
                        <div class="vsix-selected-count ${themeClass}" id="vsix-selected-count">
                            Selected: 0 versions
                        </div>
                        <div class="vsix-batch-buttons">
                            <button class="vsix-btn vsix-btn-primary" id="vsix-batch-download">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                                </svg>
                                Download Selected
                            </button>
                            <button class="vsix-btn vsix-btn-secondary" id="vsix-batch-clear">
                                Clear
                            </button>
                        </div>
                    </div>

                    <div class="vsix-custom-section ${themeClass}">
                        <div class="vsix-input-group">
                            <input type="text" class="vsix-input ${themeClass}" placeholder="Enter custom version (e.g., 1.2.3)" id="vsix-custom-input">
                            <button class="vsix-btn vsix-btn-primary" id="vsix-custom-download">
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            `;

            this.setupEventListeners(overlay);
        }

        showErrorState(overlay, message) {
            const themeClass = this.isDarkMode ? 'dark' : '';
            overlay.innerHTML = `
                <div class="vsix-card ${themeClass}">
                    <div class="vsix-empty ${themeClass}">
                        <div class="vsix-empty-icon">⚠</div>
                        <h3>Unable to Load Versions</h3>
                        <p>${message}</p>
                        <button class="vsix-btn vsix-btn-primary" id="vsix-close-error">
                            Close
                        </button>
                    </div>
                </div>
            `;

            overlay.querySelector('#vsix-close-error').addEventListener('click', () => {
                this.closeOverlay(overlay);
            });
        }

        createVersionItem(versionData, isLatest) {
            const { version, dateText } = versionData;
            const themeClass = this.isDarkMode ? 'dark' : '';
            const latestClass = isLatest ? 'latest' : '';

            return `
                <div class="vsix-version-item ${themeClass} ${latestClass}" data-version="${version}">
                    <input type="checkbox" class="vsix-checkbox">
                    <div class="vsix-version-content">
                        <div class="vsix-version-number ${themeClass}">
                            ${version}
                            ${isLatest ? '<span class="vsix-badge-latest">Latest</span>' : ''}
                        </div>
                        <div class="vsix-version-date ${themeClass}">${dateText}</div>
                    </div>
                </div>
            `;
        }

        createEmptyState() {
            return `
                <div class="vsix-empty ${this.isDarkMode ? 'dark' : ''}">
                    <div class="vsix-empty-icon">📦</div>
                    <h3>No Versions Found</h3>
                    <p>Unable to load version history from this page.</p>
                </div>
            `;
        }

        setupEventListeners(overlay) {
            const card = overlay.querySelector('.vsix-card');

            // Close button
            const closeBtn = card.querySelector('.vsix-close-btn');
            closeBtn.addEventListener('click', () => {
                this.closeOverlay(overlay);
            });

            // Search functionality
            const searchInput = card.querySelector('#vsix-search');
            searchInput.addEventListener('input', (e) => {
                this.filterVersions(e.target.value);
            });

            // Version item clicks
            card.querySelectorAll('.vsix-version-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (e.target.type !== 'checkbox') {
                        const checkbox = item.querySelector('.vsix-checkbox');
                        checkbox.checked = !checkbox.checked;
                        this.handleCheckboxChange(checkbox, item);
                    }
                });
            });

            // Checkbox changes
            card.querySelectorAll('.vsix-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    this.handleCheckboxChange(e.target, e.target.closest('.vsix-version-item'));
                });
            });

            // Batch download
            card.querySelector('#vsix-batch-download').addEventListener('click', () => {
                this.downloadSelectedVersions();
            });

            // Batch clear
            card.querySelector('#vsix-batch-clear').addEventListener('click', () => {
                this.selectedVersions.clear();
                this.updateBatchUI(card);
            });

            // Custom download
            card.querySelector('#vsix-custom-download').addEventListener('click', () => {
                const customInput = card.querySelector('#vsix-custom-input');
                const version = customInput.value.trim();
                if (version) {
                    this.downloadVersion(version);
                    customInput.value = '';
                } else {
                    this.createToast('Please enter a version number', 'error');
                }
            });

            // Enter key for custom input
            card.querySelector('#vsix-custom-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    card.querySelector('#vsix-custom-download').click();
                }
            });
        }

        handleCheckboxChange(checkbox, item) {
            const version = item.dataset.version;
            if (checkbox.checked) {
                this.selectedVersions.add(version);
            } else {
                this.selectedVersions.delete(version);
            }
            item.classList.toggle('selected', checkbox.checked);
            this.updateBatchUI(item.closest('.vsix-card'));
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

            // Update all checkboxes to reflect current selection
            card.querySelectorAll('.vsix-checkbox').forEach(checkbox => {
                const version = checkbox.closest('.vsix-version-item').dataset.version;
                checkbox.checked = this.selectedVersions.has(version);
                checkbox.closest('.vsix-version-item').classList.toggle('selected', checkbox.checked);
            });
        }

        async getVersions() {
            if (this.cachedVersions) return this.cachedVersions;

            // Navigate to version history section
            window.location.hash = 'version-history';

            // Wait for page to potentially update
            await new Promise(resolve => setTimeout(resolve, 1000));

            const versions = this.extractVersionsFromDOM();

            if (versions.length === 0) {
                throw new Error('No version history found on this page');
            }

            this.cachedVersions = versions;
            return versions;
        }

        extractVersionsFromDOM() {
            const versions = [];

            // Try multiple possible selectors for version history
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
                // Fallback: look for any table-like structure with versions
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
                // Use the found rows
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
                document.body.removeChild(link);
                this.createToast(`Downloaded version ${version}`, 'success');
            } catch (error) {
                this.createToast(`Failed to download version ${version}`, 'error');
                console.error('Download error:', error);
            }
        }

        async downloadSelectedVersions() {
            if (this.selectedVersions.size === 0) {
                this.createToast('Please select at least one version', 'error');
                return;
            }

            const versions = Array.from(this.selectedVersions);
            for (let i = 0; i < versions.length; i++) {
                this.downloadVersion(versions[i]);
                if (i < versions.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }

            this.createToast(`Downloaded ${versions.length} version(s)`, 'success');
            this.selectedVersions.clear();

            const card = document.querySelector('.vsix-card');
            if (card) {
                this.updateBatchUI(card);
            }
        }
    }

    // Initialize the enhanced downloader
    new VSIXDownloader();
})();
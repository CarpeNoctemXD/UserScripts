// ==UserScript==
// @name         Tensor.art Model ID to Links Enhanced
// @name:el      Tensor.art Βελτιωμένοι Σύνδεσμοι Μοντέλων
// @description  Adds model links with previews for actual model IDs on tensor.art. Features draggable GUI and model name previews.
// @description:el  Προσθέτει συνδέσμους μοντέλου με προεπισκόπηση για πραγματικά ID μοντέλων στο tensor.art. Με μετακινήσιμο GUI και προεπισκοπήσεις ονομάτων μοντέλων.
// @namespace    https://github.com/CarpeNoctemXD/UserScripts
// @version      1.2.2
// @author       CarpeNoctemXD
// @match        https://tensor.art/*
// @icon         https://tensor.art/favicon.ico
// @updateURL    https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/tensor.art/tensor_art-model_id_to_link.user.js
// @downloadURL  https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/tensor.art/tensor_art-model_id_to_link.user.js
// @license      MIT
// @grant        GM_xmlhttpRequest
// @connect      tensor.art
// ==/UserScript==

(function () {
    'use strict';

    let enabled = false;
    const seen = new Set();
    const modelCache = new Map();

    // More specific patterns to find actual model IDs
    const idPatterns = [
        /\b\d{18}\b/g, // 18-digit numbers
        /model[s]?[\/\-](\d{18})\b/gi, // model/123456789012345678 or models-123456789012345678
        /id[=:](\d{18})\b/gi // id=123456789012345678 or id:123456789012345678
    ];

    // Model preview manager
    const previewManager = {
        async fetchModelInfo(modelId) {
            if (modelCache.has(modelId)) {
                return modelCache.get(modelId);
            }

            return new Promise((resolve) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: `https://tensor.art/models/${modelId}`,
                    onload: function (response) {
                        try {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(response.responseText, 'text/html');

                            // Try multiple selectors to find the model name
                            let modelName = 'Unknown Model';

                            // Try meta tags first
                            const metaTitle = doc.querySelector('meta[property="og:title"]');
                            if (metaTitle) {
                                modelName = metaTitle.getAttribute('content').replace('Tensor.Art - ', '').trim();
                            }

                            // Try page title
                            if (modelName === 'Unknown Model') {
                                const title = doc.querySelector('title');
                                if (title && title.textContent) {
                                    modelName = title.textContent.replace('Tensor.Art - ', '').trim();
                                }
                            }

                            // Try heading
                            if (modelName === 'Unknown Model') {
                                const heading = doc.querySelector('h1, h2, .model-title, [class*="title"]');
                                if (heading) {
                                    modelName = heading.textContent.trim();
                                }
                            }

                            // Clean up the name
                            if (modelName.length > 60) {
                                modelName = modelName.substring(0, 57) + '...';
                            }

                            const modelInfo = {
                                name: modelName || `Model ${modelId}`,
                                url: `https://tensor.art/models/${modelId}`,
                                fetched: true,
                                valid: true
                            };

                            modelCache.set(modelId, modelInfo);
                            resolve(modelInfo);
                        } catch (error) {
                            console.log('Error parsing model page:', error);
                            const fallbackInfo = {
                                name: `Model ${modelId}`,
                                url: `https://tensor.art/models/${modelId}`,
                                fetched: false,
                                valid: false
                            };
                            modelCache.set(modelId, fallbackInfo);
                            resolve(fallbackInfo);
                        }
                    },
                    onerror: function (error) {
                        console.log('Error fetching model page:', error);
                        const fallbackInfo = {
                            name: `Model ${modelId}`,
                            url: `https://tensor.art/models/${modelId}`,
                            fetched: false,
                            valid: false
                        };
                        modelCache.set(modelId, fallbackInfo);
                        resolve(fallbackInfo);
                    },
                    timeout: 8000
                });
            });
        },

        async createPreviewElement(modelId, originalElement) {
            const modelInfo = await this.fetchModelInfo(modelId);

            const previewContainer = document.createElement('div');
            previewContainer.className = 'tensor-art-model-preview';
            previewContainer.style.cssText = `
                display: flex;
                align-items: center;
                margin: 12px 0;
                padding: 12px 16px;
                background: ${modelInfo.valid ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)'};
                border-radius: 10px;
                border-left: 4px solid ${modelInfo.valid ? '#10b981' : '#f59e0b'};
                gap: 12px;
                flex-wrap: wrap;
                max-width: 500px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                backdrop-filter: blur(10px);
                border: 1px solid ${modelInfo.valid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'};
            `;

            const link = document.createElement('a');
            link.href = modelInfo.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.cssText = `
                display: flex;
                align-items: center;
                gap: 12px;
                text-decoration: none;
                color: ${modelInfo.valid ? '#10b981' : '#f59e0b'};
                font-weight: 600;
                flex: 1;
                min-width: 250px;
                transition: all 0.2s ease;
            `;

            const icon = document.createElement('span');
            icon.textContent = modelInfo.valid ? '🤖' : '❓';
            icon.style.fontSize = '18px';
            icon.style.filter = 'brightness(1.2)';

            const textContainer = document.createElement('div');
            textContainer.style.display = 'flex';
            textContainer.style.flexDirection = 'column';
            textContainer.style.gap = '4px';
            textContainer.style.flex = '1';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = modelInfo.name;
            nameSpan.style.fontSize = '15px';
            nameSpan.style.fontWeight = '700';
            nameSpan.style.lineHeight = '1.3';
            nameSpan.style.color = modelInfo.valid ? '#10b981' : '#f59e0b';
            nameSpan.style.textShadow = '0 1px 2px rgba(0,0,0,0.1)';

            const idSpan = document.createElement('span');
            idSpan.textContent = `ID: ${modelId}`;
            idSpan.style.fontSize = '12px';
            idSpan.style.color = modelInfo.valid ? '#a7f3d0' : '#fde68a';
            idSpan.style.fontFamily = 'monospace, "Courier New", Courier';
            idSpan.style.opacity = '0.9';
            idSpan.style.fontWeight = '500';

            textContainer.appendChild(nameSpan);
            textContainer.appendChild(idSpan);

            link.appendChild(icon);
            link.appendChild(textContainer);
            previewContainer.appendChild(link);

            // Add copy ID button
            const copyButton = document.createElement('button');
            copyButton.innerHTML = '📋';
            copyButton.title = 'Copy Model ID';
            copyButton.style.cssText = `
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 6px;
                padding: 8px 12px;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s ease;
                color: #ffffff;
                backdrop-filter: blur(5px);
            `;

            copyButton.addEventListener('mouseenter', () => {
                copyButton.style.background = 'rgba(255, 255, 255, 0.4)';
                copyButton.style.transform = 'scale(1.05)';
            });

            copyButton.addEventListener('mouseleave', () => {
                copyButton.style.background = 'rgba(255, 255, 255, 0.2)';
                copyButton.style.transform = 'scale(1)';
            });

            copyButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                navigator.clipboard.writeText(modelId).then(() => {
                    const originalText = copyButton.innerHTML;
                    copyButton.innerHTML = '✅';
                    copyButton.style.background = 'rgba(16, 185, 129, 0.3)';
                    copyButton.style.borderColor = '#10b981';
                    setTimeout(() => {
                        copyButton.innerHTML = originalText;
                        copyButton.style.background = 'rgba(255, 255, 255, 0.2)';
                        copyButton.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }, 1500);
                });
            });

            previewContainer.appendChild(copyButton);

            return previewContainer;
        }
    };

    function findModelIds(text) {
        const matches = new Set();

        idPatterns.forEach(pattern => {
            const found = text.match(pattern);
            if (found) {
                found.forEach(match => {
                    // Extract the pure ID from different pattern matches
                    let id = match;
                    if (match.includes('/') || match.includes('-') || match.includes('=') || match.includes(':')) {
                        const idMatch = match.match(/\d{18}/);
                        if (idMatch) id = idMatch[0];
                    }

                    // Validate it's a reasonable model ID (not starting with many zeros, etc.)
                    if (id && !id.startsWith('000000') && parseInt(id) > 100000000000000000) {
                        matches.add(id);
                    }
                });
            }
        });

        return Array.from(matches);
    }

    function linkifyModelIds() {
        if (!enabled) return;

        console.log('Searching for model IDs...');

        // Look for model IDs in specific contexts where they're more likely to be actual models
        const selectors = [
            'p', 'div', 'span', 'li', 'td', 'pre', 'code',
            '[class*="model"]', '[class*="id"]', '[class*="content"]',
            '.message', '.post', '.comment', '.text'
        ];

        let foundCount = 0;

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                // Skip if this element already contains our preview
                if (element.querySelector('.tensor-art-model-preview')) return;

                const text = element.textContent;
                const modelIds = findModelIds(text);

                modelIds.forEach(async (modelId) => {
                    if (seen.has(modelId)) return;
                    seen.add(modelId);
                    foundCount++;

                    try {
                        const previewElement = await previewManager.createPreviewElement(modelId, element);

                        // Insert after the element containing the ID
                        element.insertAdjacentElement('afterend', previewElement);

                        // Update status
                        updateStatus();
                    } catch (error) {
                        console.error('Error creating preview for model', modelId, error);
                    }
                });
            });
        });

        if (foundCount > 0) {
            console.log(`Found ${foundCount} new model IDs`);
        }
    }

    function createControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'tensor-art-control-panel';
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: #1a1a1a;
            color: white;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.6);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-width: 280px;
            user-select: none;
            cursor: move;
            border: 1px solid #333;
            backdrop-filter: blur(10px);
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #333;
        `;

        const title = document.createElement('h3');
        title.textContent = 'Model Linker';
        title.style.margin = '0';
        title.style.fontSize = '16px';
        title.style.fontWeight = '700';
        title.style.color = '#10b981';
        title.style.textShadow = '0 1px 2px rgba(0,0,0,0.5)';

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            background: rgba(255,255,255,0.1);
            border: none;
            color: #ccc;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            width: 26px;
            height: 26px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            font-weight: bold;
        `;
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255,255,255,0.2)';
            closeBtn.style.color = '#fff';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(255,255,255,0.1)';
            closeBtn.style.color = '#ccc';
        });
        closeBtn.addEventListener('click', () => {
            panel.style.display = 'none';
            showHideBtn.style.display = 'block';
        });

        header.appendChild(title);
        header.appendChild(closeBtn);

        // Controls
        const controls = document.createElement('div');
        controls.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;

        // Toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'tensor-art-toggle';
        toggleBtn.innerHTML = '🚫 Model Linker OFF';
        toggleBtn.style.cssText = `
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white;
            border: none;
            padding: 12px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 700;
            font-size: 14px;
            transition: all 0.2s;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
        `;

        toggleBtn.addEventListener('click', () => {
            enabled = !enabled;
            if (enabled) {
                toggleBtn.innerHTML = '✅ Model Linker ON';
                toggleBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                linkifyModelIds();
            } else {
                toggleBtn.innerHTML = '🚫 Model Linker OFF';
                toggleBtn.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
            }
        });

        // Status
        const status = document.createElement('div');
        status.id = 'tensor-art-status';
        status.innerHTML = `Models found: <span style="color: #60a5fa; font-weight: 600">0</span> | Valid: <span style="color: #10b981; font-weight: 600">0</span>`;
        status.style.fontSize = '13px';
        status.style.color = '#e5e7eb';
        status.style.fontWeight = '500';

        // Action buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 8px;
            margin-top: 8px;
        `;

        const clearCacheBtn = document.createElement('button');
        clearCacheBtn.innerHTML = '🔄 Clear Cache';
        clearCacheBtn.style.cssText = `
            background: rgba(255,255,255,0.1);
            color: #e5e7eb;
            border: 1px solid rgba(255,255,255,0.2);
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            flex: 1;
            transition: all 0.2s;
            font-weight: 600;
        `;

        const rescanBtn = document.createElement('button');
        rescanBtn.innerHTML = '🔍 Rescan';
        rescanBtn.style.cssText = `
            background: rgba(255,255,255,0.1);
            color: #e5e7eb;
            border: 1px solid rgba(255,255,255,0.2);
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            flex: 1;
            transition: all 0.2s;
            font-weight: 600;
        `;

        clearCacheBtn.addEventListener('mouseenter', () => {
            clearCacheBtn.style.background = 'rgba(255,255,255,0.2)';
            clearCacheBtn.style.transform = 'translateY(-1px)';
        });

        clearCacheBtn.addEventListener('mouseleave', () => {
            clearCacheBtn.style.background = 'rgba(255,255,255,0.1)';
            clearCacheBtn.style.transform = 'translateY(0)';
        });

        rescanBtn.addEventListener('mouseenter', () => {
            rescanBtn.style.background = 'rgba(255,255,255,0.2)';
            rescanBtn.style.transform = 'translateY(-1px)';
        });

        rescanBtn.addEventListener('mouseleave', () => {
            rescanBtn.style.background = 'rgba(255,255,255,0.1)';
            rescanBtn.style.transform = 'translateY(0)';
        });

        clearCacheBtn.addEventListener('click', () => {
            modelCache.clear();
            seen.clear();
            updateStatus();
            document.querySelectorAll('.tensor-art-model-preview').forEach(el => el.remove());
            if (enabled) linkifyModelIds();
        });

        rescanBtn.addEventListener('click', () => {
            if (enabled) linkifyModelIds();
        });

        buttonContainer.appendChild(clearCacheBtn);
        buttonContainer.appendChild(rescanBtn);

        controls.appendChild(toggleBtn);
        controls.appendChild(status);
        controls.appendChild(buttonContainer);

        panel.appendChild(header);
        panel.appendChild(controls);
        document.body.appendChild(panel);

        // Make panel draggable
        makeDraggable(panel);

        // Add show/hide toggle
        const showHideBtn = document.createElement('button');
        showHideBtn.innerHTML = '⚙️';
        showHideBtn.id = 'tensor-art-toggle-panel';
        showHideBtn.title = 'Show Control Panel';
        showHideBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            border-radius: 50%;
            width: 46px;
            height: 46px;
            cursor: pointer;
            font-size: 18px;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            transition: all 0.3s ease;
            display: none;
            border: 2px solid rgba(255,255,255,0.2);
        `;

        showHideBtn.addEventListener('mouseenter', () => {
            showHideBtn.style.transform = 'scale(1.1) rotate(90deg)';
            showHideBtn.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.6)';
        });

        showHideBtn.addEventListener('mouseleave', () => {
            showHideBtn.style.transform = 'scale(1) rotate(0deg)';
            showHideBtn.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
        });

        showHideBtn.addEventListener('click', () => {
            panel.style.display = 'block';
            showHideBtn.style.display = 'none';
        });

        document.body.appendChild(showHideBtn);

        return { panel, showHideBtn };
    }

    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            if (e.target.tagName === 'BUTTON') return;

            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.right = "unset";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function updateStatus() {
        const status = document.getElementById('tensor-art-status');
        if (status) {
            const validModels = Array.from(modelCache.values()).filter(m => m.valid).length;
            status.innerHTML = `Models found: <span style="color: #60a5fa; font-weight: 600">${seen.size}</span> | Valid: <span style="color: #10b981; font-weight: 600">${validModels}</span>`;
        }
    }

    const observer = new MutationObserver(() => {
        if (enabled) {
            setTimeout(linkifyModelIds, 500);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initialize
    const { panel, showHideBtn } = createControlPanel();

    // Add styles for better integration
    const style = document.createElement('style');
    style.textContent = `
        .tensor-art-model-preview {
            transition: all 0.3s ease !important;
        }

        .tensor-art-model-preview:hover {
            transform: translateX(4px) !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
            border-color: rgba(16, 185, 129, 0.6) !important;
        }

        .tensor-art-model-preview a:hover {
            filter: brightness(1.2) !important;
            transform: translateX(2px) !important;
        }

        #tensor-art-control-panel button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        }
    `;
    document.head.appendChild(style);

    // Hide panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && e.target.id !== 'tensor-art-toggle-panel') {
            panel.style.display = 'none';
            showHideBtn.style.display = 'block';
        }
    });

    console.log('Tensor.art Model Linker Enhanced loaded');
})();
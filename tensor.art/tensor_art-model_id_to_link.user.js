// ==UserScript==
// @name         Tensor.art Model ID to Links Enhanced
// @name:el      Tensor.art Βελτιωμένοι Σύνδεσμοι Μοντέλων
// @description  Adds model links with previews for actual model IDs on tensor.art. Features draggable GUI and model name previews.
// @description:el  Προσθέτει συνδέσμους μοντέλου με προεπισκόπηση για πραγματικά ID μοντέλων στο tensor.art. Με μετακινήσιμο GUI και προεπισκοπήσεις ονομάτων μοντέλων.
// @namespace    https://github.com/CarpeNoctemXD/UserScripts
// @version      1.3.3
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

    // Color palette based on design guidelines
    const colors = {
        primary: '#191970',
        secondary: '#002147',
        tertiary: '#10467d',
        accent1: '#ef233c',
        accent2: '#00fa9a',
        accent3: '#8d99ae',
        bg1: '#000317',
        bg2: '#0b1020',
        bg3: '#151c28',
        neutral: '#f8f8ff'
    };

    let enabled = false;
    const seen = new Set();
    const modelCache = new Map();
    let currentSnapPosition = 0; // 0: top-right, 1: top-left, 2: bottom-right, 3: bottom-left

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
                background: ${modelInfo.valid ? 
                    `linear-gradient(135deg, ${colors.bg2}, ${colors.bg3})` : 
                    `linear-gradient(135deg, ${colors.bg2}, ${colors.bg3})`};
                border-radius: 10px;
                border-left: 4px solid ${modelInfo.valid ? colors.accent2 : colors.accent3};
                gap: 12px;
                flex-wrap: wrap;
                max-width: 500px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                backdrop-filter: blur(10px);
                border: 1px solid ${modelInfo.valid ? 
                    `rgba(0, 250, 154, 0.3)` : 
                    `rgba(141, 153, 174, 0.3)`};
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
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
                color: ${modelInfo.valid ? colors.accent2 : colors.accent3};
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
            nameSpan.style.color = modelInfo.valid ? colors.accent2 : colors.accent3;
            nameSpan.style.textShadow = '0 1px 2px rgba(0,0,0,0.3)';

            const idSpan = document.createElement('span');
            idSpan.textContent = `ID: ${modelId}`;
            idSpan.style.fontSize = '12px';
            idSpan.style.color = modelInfo.valid ? 
                'rgba(0, 250, 154, 0.8)' : 
                'rgba(141, 153, 174, 0.8)';
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
                background: linear-gradient(135deg, ${colors.bg2}, ${colors.tertiary});
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                padding: 8px 12px;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s ease;
                color: ${colors.neutral};
                backdrop-filter: blur(5px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            `;

            copyButton.addEventListener('mouseenter', () => {
                copyButton.style.background = `linear-gradient(135deg, ${colors.tertiary}, ${colors.secondary})`;
                copyButton.style.transform = 'scale(1.05)';
                copyButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
            });

            copyButton.addEventListener('mouseleave', () => {
                copyButton.style.background = `linear-gradient(135deg, ${colors.bg2}, ${colors.tertiary})`;
                copyButton.style.transform = 'scale(1)';
                copyButton.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
            });

            copyButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                navigator.clipboard.writeText(modelId).then(() => {
                    const originalText = copyButton.innerHTML;
                    copyButton.innerHTML = '✅';
                    copyButton.style.background = `linear-gradient(135deg, ${colors.accent2}, ${colors.tertiary})`;
                    copyButton.style.borderColor = colors.accent2;
                    setTimeout(() => {
                        copyButton.innerHTML = originalText;
                        copyButton.style.background = `linear-gradient(135deg, ${colors.bg2}, ${colors.tertiary})`;
                        copyButton.style.borderColor = 'rgba(255, 255, 255, 0.2)';
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

    function snapToPosition(panel, position) {
        const padding = 20;
        const panelWidth = panel.offsetWidth;
        const panelHeight = panel.offsetHeight;
        
        switch(position) {
            case 0: // Top-right
                panel.style.top = `${padding}px`;
                panel.style.right = `${padding}px`;
                panel.style.left = 'unset';
                panel.style.bottom = 'unset';
                break;
            case 1: // Top-left
                panel.style.top = `${padding}px`;
                panel.style.left = `${padding}px`;
                panel.style.right = 'unset';
                panel.style.bottom = 'unset';
                break;
            case 2: // Bottom-right
                panel.style.bottom = `${padding}px`;
                panel.style.right = `${padding}px`;
                panel.style.top = 'unset';
                panel.style.left = 'unset';
                break;
            case 3: // Bottom-left
                panel.style.bottom = `${padding}px`;
                panel.style.left = `${padding}px`;
                panel.style.top = 'unset';
                panel.style.right = 'unset';
                break;
        }
        
        currentSnapPosition = position;
    }

    function createControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'tensor-art-control-panel';
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: linear-gradient(135deg, ${colors.bg1}, ${colors.bg2});
            color: ${colors.neutral};
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.8);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-width: 280px;
            user-select: none;
            border: 1px solid ${colors.tertiary};
            backdrop-filter: blur(10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid ${colors.tertiary};
        `;

        const title = document.createElement('h3');
        title.textContent = 'Model Linker';
        title.style.margin = '0';
        title.style.fontSize = '16px';
        title.style.fontWeight = '700';
        title.style.color = colors.accent2;
        title.style.textShadow = '0 1px 2px rgba(0,0,0,0.5)';

        const headerButtons = document.createElement('div');
        headerButtons.style.cssText = `
            display: flex;
            gap: 6px;
            align-items: center;
        `;

        // Move button
        const moveBtn = document.createElement('button');
        moveBtn.innerHTML = '↦';
        moveBtn.title = 'Move to next corner';
        moveBtn.style.cssText = `
            background: linear-gradient(135deg, ${colors.bg2}, ${colors.tertiary});
            border: 1px solid rgba(255,255,255,0.2);
            color: ${colors.neutral};
            font-size: 16px;
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
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        `;

        moveBtn.addEventListener('mouseenter', () => {
            moveBtn.style.background = `linear-gradient(135deg, ${colors.tertiary}, ${colors.secondary})`;
            moveBtn.style.transform = 'scale(1.1)';
        });

        moveBtn.addEventListener('mouseleave', () => {
            moveBtn.style.background = `linear-gradient(135deg, ${colors.bg2}, ${colors.tertiary})`;
            moveBtn.style.transform = 'scale(1)';
        });

        moveBtn.addEventListener('click', () => {
            const nextPosition = (currentSnapPosition + 1) % 4;
            snapToPosition(panel, nextPosition);
        });

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.title = 'Close panel';
        closeBtn.style.cssText = `
            background: linear-gradient(135deg, ${colors.bg2}, ${colors.tertiary});
            border: 1px solid rgba(255,255,255,0.2);
            color: ${colors.neutral};
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
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        `;

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = `linear-gradient(135deg, ${colors.accent1}, #b91c1c)`;
            closeBtn.style.transform = 'scale(1.1)';
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = `linear-gradient(135deg, ${colors.bg2}, ${colors.tertiary})`;
            closeBtn.style.transform = 'scale(1)';
        });

        closeBtn.addEventListener('click', () => {
            panel.style.display = 'none';
            showHideBtn.style.display = 'block';
        });

        headerButtons.appendChild(moveBtn);
        headerButtons.appendChild(closeBtn);

        header.appendChild(title);
        header.appendChild(headerButtons);

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
            background: linear-gradient(135deg, ${colors.accent1}, #b91c1c);
            color: ${colors.neutral};
            border: none;
            padding: 14px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 700;
            font-size: 14px;
            transition: all 0.3s ease;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            position: relative;
            overflow: hidden;
            border: 2px solid transparent;
        `;

        // Add a subtle inner shadow for better contrast
        const toggleGlow = document.createElement('div');
        toggleGlow.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 6px;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 
                        inset 0 -1px 0 rgba(0,0,0,0.3);
            pointer-events: none;
        `;
        toggleBtn.appendChild(toggleGlow);

        toggleBtn.addEventListener('click', () => {
            enabled = !enabled;
            if (enabled) {
                toggleBtn.innerHTML = '✅ Model Linker ON';
                toggleBtn.style.background = `linear-gradient(135deg, ${colors.accent2}, #00c982)`;
                toggleBtn.style.color = colors.bg1;
                toggleBtn.style.border = '2px solid rgba(0, 250, 154, 0.3)';
                linkifyModelIds();
            } else {
                toggleBtn.innerHTML = '🚫 Model Linker OFF';
                toggleBtn.style.background = `linear-gradient(135deg, ${colors.accent1}, #b91c1c)`;
                toggleBtn.style.color = colors.neutral;
                toggleBtn.style.border = '2px solid transparent';
            }
        });

        toggleBtn.addEventListener('mouseenter', () => {
            toggleBtn.style.transform = 'translateY(-2px)';
            toggleBtn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.5)';
        });

        toggleBtn.addEventListener('mouseleave', () => {
            toggleBtn.style.transform = 'translateY(0)';
            toggleBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
        });

        // Status
        const status = document.createElement('div');
        status.id = 'tensor-art-status';
        status.innerHTML = `Models found: <span style="color: ${colors.accent3}; font-weight: 600">0</span> | Valid: <span style="color: ${colors.accent2}; font-weight: 600">0</span>`;
        status.style.cssText = `
            font-size: 13px;
            color: ${colors.neutral};
            font-weight: 500;
            background: rgba(16, 70, 125, 0.15);
            padding: 12px;
            border-radius: 8px;
            border: 1px solid rgba(16, 70, 125, 0.3);
            text-align: center;
        `;

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
            background: linear-gradient(135deg, ${colors.bg2}, ${colors.tertiary});
            color: ${colors.neutral};
            border: 1px solid rgba(255,255,255,0.2);
            padding: 10px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            flex: 1;
            transition: all 0.2s;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        `;

        const rescanBtn = document.createElement('button');
        rescanBtn.innerHTML = '🔍 Rescan';
        rescanBtn.style.cssText = `
            background: linear-gradient(135deg, ${colors.bg2}, ${colors.tertiary});
            color: ${colors.neutral};
            border: 1px solid rgba(255,255,255,0.2);
            padding: 10px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            flex: 1;
            transition: all 0.2s;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        `;

        clearCacheBtn.addEventListener('mouseenter', () => {
            clearCacheBtn.style.background = `linear-gradient(135deg, ${colors.tertiary}, ${colors.secondary})`;
            clearCacheBtn.style.transform = 'translateY(-2px)';
            clearCacheBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
        });

        clearCacheBtn.addEventListener('mouseleave', () => {
            clearCacheBtn.style.background = `linear-gradient(135deg, ${colors.bg2}, ${colors.tertiary})`;
            clearCacheBtn.style.transform = 'translateY(0)';
            clearCacheBtn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        });

        rescanBtn.addEventListener('mouseenter', () => {
            rescanBtn.style.background = `linear-gradient(135deg, ${colors.tertiary}, ${colors.secondary})`;
            rescanBtn.style.transform = 'translateY(-2px)';
            rescanBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
        });

        rescanBtn.addEventListener('mouseleave', () => {
            rescanBtn.style.background = `linear-gradient(135deg, ${colors.bg2}, ${colors.tertiary})`;
            rescanBtn.style.transform = 'translateY(0)';
            rescanBtn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
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

        // Add show/hide toggle
        const showHideBtn = document.createElement('button');
        showHideBtn.innerHTML = '🔗';
        showHideBtn.id = 'tensor-art-toggle-panel';
        showHideBtn.title = 'Show Model Linker';
        showHideBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            background: linear-gradient(135deg, ${colors.accent2}, ${colors.tertiary});
            color: ${colors.bg1};
            border: none;
            border-radius: 8px;
            width: 44px;
            height: 44px;
            cursor: pointer;
            font-size: 18px;
            box-shadow: 0 4px 15px rgba(0, 250, 154, 0.4);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: none;
            font-weight: bold;
            backdrop-filter: blur(10px);
        `;

        // Add inner glow for better appearance
        const buttonGlow = document.createElement('div');
        buttonGlow.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 6px;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 
                        inset 0 -1px 0 rgba(0,0,0,0.2);
            pointer-events: none;
        `;
        showHideBtn.appendChild(buttonGlow);

        showHideBtn.addEventListener('mouseenter', () => {
            showHideBtn.style.transform = 'scale(1.15) rotate(90deg)';
            showHideBtn.style.boxShadow = '0 6px 25px rgba(0, 250, 154, 0.6)';
            showHideBtn.style.background = `linear-gradient(135deg, ${colors.accent2}, #00e695)`;
        });

        showHideBtn.addEventListener('mouseleave', () => {
            showHideBtn.style.transform = 'scale(1) rotate(0deg)';
            showHideBtn.style.boxShadow = '0 4px 15px rgba(0, 250, 154, 0.4)';
            showHideBtn.style.background = `linear-gradient(135deg, ${colors.accent2}, ${colors.tertiary})`;
        });

        showHideBtn.addEventListener('click', () => {
            panel.style.display = 'block';
            showHideBtn.style.display = 'none';
            // Ensure panel is in a valid position when shown
            snapToPosition(panel, currentSnapPosition);
        });

        document.body.appendChild(showHideBtn);

        return { panel, showHideBtn };
    }

    function updateStatus() {
        const status = document.getElementById('tensor-art-status');
        if (status) {
            const validModels = Array.from(modelCache.values()).filter(m => m.valid).length;
            status.innerHTML = `Models found: <span style="color: ${colors.accent3}; font-weight: 600">${seen.size}</span> | Valid: <span style="color: ${colors.accent2}; font-weight: 600">${validModels}</span>`;
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

    // Add enhanced styles
    const style = document.createElement('style');
    style.textContent = `
        .tensor-art-model-preview {
            transition: all 0.3s ease !important;
        }

        .tensor-art-model-preview:hover {
            transform: translateX(4px) !important;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5) !important;
            border-color: rgba(0, 250, 154, 0.6) !important;
        }

        .tensor-art-model-preview a:hover {
            filter: brightness(1.2) !important;
            transform: translateX(2px) !important;
        }

        #tensor-art-control-panel button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5) !important;
        }

        #tensor-art-toggle {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
    `;
    document.head.appendChild(style);

    // Hide panel when clicking outside
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('tensor-art-control-panel');
        const toggleBtn = document.getElementById('tensor-art-toggle-panel');
        
        if (panel && !panel.contains(e.target) && e.target !== toggleBtn) {
            panel.style.display = 'none';
            toggleBtn.style.display = 'block';
        }
    });

    console.log('Tensor.art Model Linker Enhanced - Snap-to-Edges Movement');
})();
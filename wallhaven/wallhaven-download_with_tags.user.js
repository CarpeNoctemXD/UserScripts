// ==UserScript==
// @name           Wallpaper Downloader with Tags
// @name:el        Λήψη Wallpaper με Ετικέτες
// @description    Enhanced tag selection popup for Wallhaven with search, exclusions, and filename preview.
// @description:el Βελτιωμένο αναδυόμενο παράθυρο επιλογής ετικετών για το Wallhaven, με αναζήτηση, εξαιρέσεις και προεπισκόπηση ονόματος αρχείου.
// @version        1.2.0
// @namespace      https://github.com/CarpeNoctemXD/UserScripts
// @author         CarpeNoctemXD
// @updateURL      https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/wallhaven/wallhaven-download_with_tags.user.js
// @downloadURL    https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/wallhaven/wallhaven-download_with_tags.user.js
// @match          https://wallhaven.cc/w/*
// @grant          none
// @icon           https://www.google.com/s2/favicons?sz=64&domain=wallhaven.cc
// @license        MIT
// ==/UserScript==

/* Forked from NooScripts's https://greasyfork.org/en/scripts/534407-wallhaven-better-wallpaper-downloader script (version 1.4, retrieved on 2025-10-18) under MIT License. */

/* Changelog
------------------------------------------------------------
- 1.2.0 - 2025-10-30
  - Fixed: Prevent multiple popups; disable download buttons while open
  - Fixed: Improved error handling
  - Fixed: Typo in download and update URLs
  - Changed: Standardized changelog format to repository template

- 1.1.0 - 2025-10-30
  - Changed: UI refactor; enhanced button states & transitions

- 1.0.0 - 2025-10-18
  - Added: Initial release — tag selection popup, categorization, filtering, local storage prefs and custom filename generation
------------------------------------------------------------
*/

(() => {
  'use strict';

  /***************************************************************************
   *  CONFIG (edit these)
   *
   *  - excludedDefaults.categories : categories that should NOT be selected by default
   *  - excludedDefaults.tags       : tags that should NOT be selected by default
   *
   *  - enableLocalStorage: set true to persist last selections in localStorage
   *
   *  Notes: comparisons are case-insensitive.
   ***************************************************************************/
  const excludedDefaults = {
    categories: ["Pixiv"],                      // treat as category (capitalized)
    tags: ["pixiv", "ultrawide", "wide screen", "simple background"] // treat as ordinary tags (case-insensitive)
  };
  const enableLocalStorage = false; // set to true if you want selections persisted (negligible perf)

  /***************************************************************************
   *  Design System Variables
   ***************************************************************************/
  const designSystem = {
    colors: {
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
    },
    typography: {
      xs: '11px',
      sm: '12px',
      base: '13px',
      lg: '15px',
      xl: '16px'
    },
    spacing: {
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px'
    },
    borderRadius: {
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px'
    },
    shadows: {
      sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
      md: '0 4px 12px rgba(0, 0, 0, 0.4)',
      lg: '0 6px 20px rgba(0, 0, 0, 0.5)',
      accent: '0 4px 15px rgba(0, 250, 154, 0.4)'
    },
    transitions: {
      fast: '0.2s ease',
      base: '0.3s ease',
      smooth: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  };

  /***************************************************************************
   *  Global State
   ***************************************************************************/
  let isPopupOpen = false;

  /***************************************************************************
   *  Utilities
   ***************************************************************************/
  const q = s => document.querySelector(s);
  const qa = s => Array.from(document.querySelectorAll(s));

  const slugTag = (raw) => {
    return raw.trim().replace(/\s+/g, '_').toLowerCase();
  };

  const tagsToPreviewString = (selectedTags) => {
    if (!selectedTags || selectedTags.length === 0) return '';
    return selectedTags.map(t => slugTag(t)).join('-');
  };

  const saveSelections = (arr) => {
    if (!enableLocalStorage) return;
    try { localStorage.setItem('wh_tag_prefs', JSON.stringify(arr)); } catch (e) { /* ignore */ }
  };
  
  const loadSelections = () => {
    if (!enableLocalStorage) return null;
    try {
      const v = localStorage.getItem('wh_tag_prefs');
      return v ? JSON.parse(v) : null;
    } catch (e) { return null; }
  };

  /***************************************************************************
   *  Styles (Updated to match design guidelines)
   ***************************************************************************/
  const styleText = `
    .wh-dl-btn {
      display: inline-block;
      width: 100%;
      padding: ${designSystem.spacing[2]} ${designSystem.spacing[3]};
      background: linear-gradient(135deg, ${designSystem.colors.bg2}, ${designSystem.colors.tertiary});
      color: ${designSystem.colors.neutral};
      border: 1px solid ${designSystem.colors.tertiary};
      border-radius: ${designSystem.borderRadius.md};
      cursor: pointer;
      font-size: ${designSystem.typography.base};
      font-weight: 600;
      transition: all ${designSystem.transitions.base};
      box-shadow: ${designSystem.shadows.sm};
    }
    
    .wh-dl-btn:hover {
      transform: translateY(-2px);
      box-shadow: ${designSystem.shadows.md};
      background: linear-gradient(135deg, ${designSystem.colors.tertiary}, ${designSystem.colors.secondary});
    }
    
    .wh-dl-btn:active {
      transform: translateY(0);
      box-shadow: ${designSystem.shadows.sm};
    }

    .wh-dl-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }
    
    .wh-popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(86vw, 1100px);
      max-height: min(84vh, 760px);
      background: linear-gradient(135deg, ${designSystem.colors.bg2}, ${designSystem.colors.bg3});
      backdrop-filter: blur(10px) saturate(120%);
      border: 1px solid ${designSystem.colors.tertiary};
      box-shadow: ${designSystem.shadows.lg};
      border-radius: ${designSystem.borderRadius.xl};
      z-index: 10000;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: ${designSystem.colors.neutral};
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      animation: whFadeIn ${designSystem.transitions.smooth};
    }
    
    @keyframes whFadeIn { 
      from { 
        opacity: 0; 
        transform: translate(-50%, -48%);
      } 
      to { 
        opacity: 1; 
        transform: translate(-50%, -50%);
      } 
    }
    
    .wh-header {
      padding: ${designSystem.spacing[3]} ${designSystem.spacing[4]};
      font-weight: 600;
      font-size: ${designSystem.typography.xl};
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: ${designSystem.spacing[3]};
      justify-content: space-between;
      background: rgba(0, 0, 0, 0.2);
    }
    
    .wh-body { 
      display: flex; 
      gap: ${designSystem.spacing[4]}; 
      padding: ${designSystem.spacing[3]}; 
      overflow: auto; 
      flex: 1;
    }
    
    .wh-column { 
      flex: 1; 
      display: flex; 
      flex-direction: column; 
      gap: ${designSystem.spacing[2]}; 
      min-width: 220px; 
    }
    
    .wh-column h4 { 
      margin: 0; 
      font-size: ${designSystem.typography.base}; 
      color: ${designSystem.colors.accent3}; 
      font-weight: 600; 
      display: flex; 
      align-items: center; 
      gap: ${designSystem.spacing[2]};
    }
    
    .wh-list { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); 
      gap: ${designSystem.spacing[2]}; 
      list-style: none; 
      padding: 0; 
      margin: 0; 
    }
    
    .wh-list li {
      background: linear-gradient(135deg, ${designSystem.colors.bg2}, ${designSystem.colors.bg3});
      padding: ${designSystem.spacing[2]} ${designSystem.spacing[3]};
      border-radius: ${designSystem.borderRadius.md};
      text-align: center;
      cursor: pointer;
      user-select: none;
      transition: all ${designSystem.transitions.fast};
      font-size: ${designSystem.typography.base};
      line-height: 1.1;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: ${designSystem.shadows.sm};
    }
    
    .wh-list li:hover { 
      transform: translateY(-2px); 
      box-shadow: ${designSystem.shadows.md};
      background: linear-gradient(135deg, ${designSystem.colors.bg3}, ${designSystem.colors.tertiary});
    }
    
    .wh-list li.selected { 
      background: linear-gradient(135deg, ${designSystem.colors.accent2}, #00cc88);
      color: ${designSystem.colors.bg1}; 
      font-weight: 600;
      box-shadow: ${designSystem.shadows.accent};
      border-color: ${designSystem.colors.accent2};
    }
    
    .wh-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: ${designSystem.spacing[3]} ${designSystem.spacing[4]};
      display: flex;
      gap: ${designSystem.spacing[3]};
      align-items: center;
      justify-content: space-between;
      background: rgba(0, 0, 0, 0.3);
    }
    
    .wh-preview {
      font-family: monospace;
      font-size: ${designSystem.typography.base};
      color: ${designSystem.colors.neutral};
      overflow-x: auto;
      white-space: nowrap;
      padding: ${designSystem.spacing[2]} ${designSystem.spacing[3]};
      border-radius: ${designSystem.borderRadius.md};
      background: rgba(255, 255, 255, 0.05);
      min-height: 32px;
      display: flex;
      align-items: center;
      gap: ${designSystem.spacing[2]};
      border: 1px solid rgba(255, 255, 255, 0.1);
      flex: 1;
    }
    
    .wh-controls { 
      display: flex; 
      gap: ${designSystem.spacing[2]}; 
      align-items: center; 
    }
    
    .wh-btn {
      padding: ${designSystem.spacing[2]} ${designSystem.spacing[3]};
      border-radius: ${designSystem.borderRadius.lg};
      border: none;
      cursor: pointer;
      font-weight: 600;
      font-size: ${designSystem.typography.base};
      transition: all ${designSystem.transitions.fast};
    }
    
    .wh-btn.primary { 
      background: linear-gradient(135deg, ${designSystem.colors.accent2}, #00cc88);
      color: ${designSystem.colors.bg1};
      box-shadow: ${designSystem.shadows.sm};
    }
    
    .wh-btn.primary:hover { 
      transform: translateY(-2px);
      box-shadow: ${designSystem.shadows.accent};
      background: linear-gradient(135deg, #00cc88, ${designSystem.colors.accent2});
    }
    
    .wh-btn.ghost { 
      background: rgba(255, 255, 255, 0.08); 
      color: ${designSystem.colors.neutral};
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .wh-btn.ghost:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-1px);
    }
    
    .wh-small { 
      padding: ${designSystem.spacing[2]}; 
      font-size: ${designSystem.typography.sm}; 
      border-radius: ${designSystem.borderRadius.md}; 
      background: rgba(255, 255, 255, 0.08); 
      color: ${designSystem.colors.neutral};
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all ${designSystem.transitions.fast};
    }
    
    .wh-small:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-1px);
    }
    
    .wh-search { 
      width: 100%; 
      padding: ${designSystem.spacing[2]} ${designSystem.spacing[3]}; 
      border-radius: ${designSystem.borderRadius.lg}; 
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.05);
      color: ${designSystem.colors.neutral}; 
      outline: none;
      font-size: ${designSystem.typography.base};
      transition: all ${designSystem.transitions.fast};
    }
    
    .wh-search:focus {
      border-color: ${designSystem.colors.accent2};
      box-shadow: 0 0 0 2px rgba(0, 250, 154, 0.2);
    }
    
    .wh-select-all { 
      display: flex; 
      gap: ${designSystem.spacing[2]}; 
      margin-top: ${designSystem.spacing[2]}; 
    }
    
    .wh-note { 
      font-size: ${designSystem.typography.xs}; 
      color: ${designSystem.colors.accent3}; 
    }
    
    @media (max-width: 800px) {
      .wh-body { flex-direction: column; }
      .wh-popup { width: 94vw; max-height: 90vh; }
    }
    
    /* Status indicators */
    .wh-status-success {
      background: rgba(0, 250, 154, 0.15) !important;
      border-color: ${designSystem.colors.accent2} !important;
    }
    
    .wh-status-warning {
      background: rgba(141, 153, 174, 0.15) !important;
      border-color: ${designSystem.colors.accent3} !important;
    }
    
    .wh-status-error {
      background: rgba(239, 35, 60, 0.15) !important;
      border-color: ${designSystem.colors.accent1} !important;
    }
  `;

  const style = document.createElement('style');
  style.textContent = styleText;
  document.head.appendChild(style);

  /***************************************************************************
   *  Main: add button to page
   ***************************************************************************/
  function getImageSrc() {
    const img = document.getElementById('wallpaper') || q('img#wallpaper');
    return img?.src || null;
  }

  function createMainButton() {
    const btn = document.createElement('button');
    btn.className = 'wh-dl-btn';
    btn.textContent = 'Download Wallpaper + Tag';
    btn.title = 'Open tag selection popup for customized filename';
    return btn;
  }

  async function addButtonToSidebar() {
    const sidebarContent = q('.sidebar-content > :first-child:last-of-type') || q('.sidebar') || q('.side');
    const btn = createMainButton();
    btn.addEventListener('click', (e) => { 
      e.preventDefault(); 
      e.stopPropagation();
      
      // Prevent multiple popups
      if (isPopupOpen) {
        console.log('[WH Downloader] Popup already open, ignoring click');
        return;
      }
      
      openPopup(); 
    });
    
    if (sidebarContent) {
      sidebarContent.insertAdjacentElement('afterend', btn);
    } else {
      // Fallback: fixed positioning in top-right
      btn.style.position = 'fixed';
      btn.style.top = designSystem.spacing[4];
      btn.style.right = designSystem.spacing[4];
      btn.style.zIndex = '10000';
      btn.style.width = 'auto';
      btn.style.minWidth = '200px';
      document.body.appendChild(btn);
    }
  }

  /***************************************************************************
   *  Popup builder
   ***************************************************************************/
  function openPopup() {
    // Set popup state to open
    isPopupOpen = true;
    
    // Disable all download buttons while popup is open
    const allDownloadButtons = document.querySelectorAll('.wh-dl-btn');
    allDownloadButtons.forEach(btn => {
      btn.disabled = true;
    });

    const imageSrc = getImageSrc();
    if (!imageSrc) {
      console.warn('[WH Downloader] wallpaper element not found.');
      // Re-enable buttons if no image found
      isPopupOpen = false;
      allDownloadButtons.forEach(btn => {
        btn.disabled = false;
      });
      return;
    }

    // Collect tags from page
    const rawTags = qa('.tagname').map(n => n.innerText.trim()).filter(Boolean);

    // Separate capitalized categories vs other tags
    const categories = rawTags.filter(t => t[0] === t[0].toUpperCase()).sort();
    const othertags  = rawTags.filter(t => t[0] !== t[0].toUpperCase()).sort();

    // Load persisted selection if enabled
    const persisted = loadSelections();
    const persistMap = {};
    if (persisted && Array.isArray(persisted)) {
      persisted.forEach(s => (persistMap[String(s)] = true));
    }

    // Create popup DOM
    const popup = document.createElement('div');
    popup.className = 'wh-popup';

    const header = document.createElement('div');
    header.className = 'wh-header';
    header.innerHTML = `
      <div>🎨 Select tags for filename</div>
      <div style="display:flex;gap:10px;align-items:center;min-width:200px;">
        <input id="wh_search" class="wh-search" placeholder="🔍 Filter tags..." title="Filter tags (search)">
      </div>
    `;

    const body = document.createElement('div');
    body.className = 'wh-body';

    // Columns
    const colCategories = document.createElement('div'); 
    colCategories.className = 'wh-column';
    
    const colTags = document.createElement('div'); 
    colTags.className = 'wh-column';

    // Helper to decide default selected state
    const shouldBeSelectedByDefault = (tagRaw, isCategory) => {
      const tagLower = tagRaw.toLowerCase();
      // Respect persisted preferences first
      if (persistMap.hasOwnProperty(tagRaw)) return !!persistMap[tagRaw];
      // Otherwise check excluded defaults
      if (isCategory) {
        return !excludedDefaults.categories.some(ex => ex.toLowerCase() === tagRaw.toLowerCase());
      } else {
        return !excludedDefaults.tags.some(ex => ex.toLowerCase() === tagRaw.toLowerCase());
      }
    };

    // Build list element
    const makeListFrom = (arr, isCategory) => {
      const ul = document.createElement('ul');
      ul.className = 'wh-list';
      arr.forEach(tag => {
        const li = document.createElement('li');
        li.textContent = tag;
        li.title = `Click to ${shouldBeSelectedByDefault(tag, isCategory) ? 'deselect' : 'select'} "${tag}"`;
        
        // Set default selected state
        if (shouldBeSelectedByDefault(tag, isCategory)) {
          li.classList.add('selected');
        }
        
        li.addEventListener('click', () => {
          li.classList.toggle('selected');
          refreshPreview();
        });
        
        ul.appendChild(li);
      });
      return ul;
    };

    const listCat = makeListFrom(categories, true);
    const listTag = makeListFrom(othertags, false);

    // Add headers & select all/deselect all controls
    const createColumnHeader = (title, icon, listElement) => {
      const header = document.createElement('div');
      header.innerHTML = `<h4>${icon} ${title}</h4>`;
      
      const controls = document.createElement('div');
      controls.className = 'wh-select-all';
      
      const selectAll = document.createElement('button');
      selectAll.className = 'wh-small wh-btn ghost';
      selectAll.textContent = 'Select All';
      selectAll.title = `Select all ${title.toLowerCase()}`;
      
      const deselectAll = document.createElement('button');
      deselectAll.className = 'wh-small wh-btn ghost';
      deselectAll.textContent = 'Deselect All';
      deselectAll.title = `Deselect all ${title.toLowerCase()}`;
      
      controls.append(selectAll, deselectAll);
      header.appendChild(controls);

      // Event handlers
      selectAll.addEventListener('click', () => { 
        listElement.querySelectorAll('li').forEach(li => li.classList.add('selected')); 
        refreshPreview(); 
      });
      
      deselectAll.addEventListener('click', () => { 
        listElement.querySelectorAll('li').forEach(li => li.classList.remove('selected')); 
        refreshPreview(); 
      });

      return header;
    };

    colCategories.appendChild(createColumnHeader('Categories', '📚', listCat));
    colCategories.appendChild(listCat);
    
    colTags.appendChild(createColumnHeader('Tags', '🏷️', listTag));
    colTags.appendChild(listTag);

    body.appendChild(colCategories);
    body.appendChild(colTags);

    // Footer with preview and action buttons
    const footer = document.createElement('div');
    footer.className = 'wh-footer';

    const previewBox = document.createElement('div');
    previewBox.className = 'wh-preview';
    previewBox.textContent = '(no tags selected)';

    const controls = document.createElement('div');
    controls.className = 'wh-controls';

    const btnDownload = document.createElement('button');
    btnDownload.className = 'wh-btn primary';
    btnDownload.textContent = 'Download';
    btnDownload.title = 'Download wallpaper with selected tags in filename';

    const btnCancel = document.createElement('button');
    btnCancel.className = 'wh-btn ghost';
    btnCancel.textContent = 'Cancel';
    btnCancel.title = 'Close popup without downloading';

    controls.appendChild(btnDownload);
    controls.appendChild(btnCancel);

    footer.appendChild(previewBox);
    footer.appendChild(controls);

    popup.appendChild(header);
    popup.appendChild(body);
    popup.appendChild(footer);
    document.body.appendChild(popup);

    // Search input behavior
    const searchInput = popup.querySelector('#wh_search');
    const filterFn = (term) => {
      const t = (term || '').toLowerCase();
      [...listCat.querySelectorAll('li'), ...listTag.querySelectorAll('li')].forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(t) ? '' : 'none';
      });
    };
    
    searchInput.addEventListener('input', (e) => filterFn(e.target.value));

    // Close handlers
    const closePopup = () => {
      document.removeEventListener('keydown', escHandler);
      popup.remove();
      
      // Re-enable all download buttons
      const allDownloadButtons = document.querySelectorAll('.wh-dl-btn');
      allDownloadButtons.forEach(btn => {
        btn.disabled = false;
      });
      
      // Set popup state to closed
      isPopupOpen = false;
    };

    popup.addEventListener('click', (ev) => {
      if (ev.target === popup) closePopup();
    });

    const escHandler = (ev) => { 
      if (ev.key === 'Escape') closePopup(); 
    };
    document.addEventListener('keydown', escHandler);

    // Refresh preview function
    function refreshPreview() {
      const selected = [...popup.querySelectorAll('li.selected')].map(n => n.textContent.trim());
      const tagString = tagsToPreviewString(selected);
      previewBox.textContent = tagString || '(no tags selected)';
      previewBox.className = `wh-preview ${tagString ? 'wh-status-success' : ''}`;
      return tagString;
    }

    // Initial preview
    refreshPreview();

    // Cancel button
    btnCancel.addEventListener('click', () => closePopup());

    // Download action
    btnDownload.addEventListener('click', async () => {
      const selected = [...popup.querySelectorAll('li.selected')].map(n => n.textContent.trim());
      
      // Save preferences if enabled
      if (enableLocalStorage) {
        saveSelections(selected);
      }
      
      const tagString = tagsToPreviewString(selected);

      // Build final filename
      const filename = imageSrc.substring(imageSrc.lastIndexOf('/') + 1);
      const baseName = filename.replace(/\.[^.]+$/, '');
      const ext = filename.split('.').pop();
      const finalName = tagString ? `${baseName}-${tagString}.${ext}` : `${baseName}.${ext}`;

      try {
        // Show loading state
        btnDownload.textContent = 'Downloading...';
        btnDownload.disabled = true;

        const resp = await fetch(imageSrc);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        
        const blob = await resp.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = finalName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        
        // Clean up URL
        setTimeout(() => URL.revokeObjectURL(a.href), 200);
        
      } catch (err) {
        console.error('[WH Downloader] Download failed:', err);
        // Show error state briefly
        btnDownload.textContent = 'Error!';
        btnDownload.classList.add('wh-status-error');
        setTimeout(() => {
          btnDownload.textContent = 'Download';
          btnDownload.disabled = false;
          btnDownload.classList.remove('wh-status-error');
        }, 1500);
        return;
      }
      
      closePopup();
    });

    // Auto-focus search input
    setTimeout(() => { 
      searchInput.focus(); 
      searchInput.select(); 
    }, 100);
  }

  /***************************************************************************
   *  Initialization
   ***************************************************************************/
  function initialize() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addButtonToSidebar);
    } else {
      addButtonToSidebar();
    }
  }

  // Optional: observe for dynamic single-page navigation
  const observer = new MutationObserver(() => {
    if (!document.querySelector('.wh-dl-btn')) {
      setTimeout(addButtonToSidebar, 500);
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Start the script
  initialize();
})();
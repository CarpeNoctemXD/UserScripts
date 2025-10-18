// ==UserScript==
// @name           Wallpaper Downloader with Tags
// @name:el        Λήψη Wallpaper με Ετικέτες
// @description    Glassy tag popup for Wallhaven with selectable tags, exclusions, and a tags-only filename preview.
// @description:el Αναδυόμενο παράθυρο ετικετών για το Wallhaven, με γυάλινο στυλ, επιλέξιμες ετικέτες, εξαιρέσεις και προεπισκόπηση ονόματος αρχείου.
// @version        1.0.0
// @namespace      https://github.com/CarpeNoctemXD/UserScripts
// @author         CarpeNoctemXD
// @updateURL      https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/wallhaven-download_with_tags.user.js
// @downloadURL    https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/wallhaven-download_with_tags.user.js
// @match          https://wallhaven.cc/w/*
// @grant          none
// @icon           https://www.google.com/s2/favicons?sz=64&domain=wallhaven.cc
// @license        MIT
// ==/UserScript==

/* Forked from NooScripts's https://greasyfork.org/en/scripts/534407-wallhaven-better-wallpaper-downloader script (version 1.4, retrieved on 2025-10-18) under MIT License. */

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
   *  Utilities
   ***************************************************************************/
  const q = s => document.querySelector(s);
  const qa = s => Array.from(document.querySelectorAll(s));

  const slugTag = (raw) => {
    // internal spaces -> underscore, lowercased, trim, collapse spaces
    return raw.trim().replace(/\s+/g, '_').toLowerCase();
  };

  const tagsToPreviewString = (selectedTags) => {
    // selectedTags are raw names (display text). Convert and join with hyphen.
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
   *  Styles (glassy UI)
   ***************************************************************************/
  const styleText = `
    .wh-dl-btn {
      display:inline-block;
      width:100%;
      padding:6px 8px;
      background:transparent;
      color:#fff;
      border:1px solid rgba(255,255,255,0.12);
      border-radius:6px;
      cursor:pointer;
      font-size:15px;
    }
    .wh-dl-btn:hover { background: rgba(255,255,255,0.06); color:#fff; }
    .wh-popup {
      position:fixed;
      top:50%;
      left:50%;
      transform:translate(-50%,-50%);
      width:min(86vw,1100px);
      max-height:min(84vh,760px);
      background: rgba(18,18,20,0.68);
      backdrop-filter: blur(10px) saturate(120%);
      border:1px solid rgba(255,255,255,0.06);
      box-shadow: 0 12px 48px rgba(0,0,0,0.6);
      border-radius:14px;
      z-index: 99999;
      display:flex;
      flex-direction:column;
      overflow:hidden;
      color: #eaeaea;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      animation: whFadeIn .18s ease-out;
    }
    @keyframes whFadeIn { from { opacity:0; transform:translate(-50%,-48%);} to { opacity:1; transform:translate(-50%,-50%);} }
    .wh-header {
      padding:12px 16px;
      font-weight:600;
      font-size:16px;
      border-bottom:1px solid rgba(255,255,255,0.03);
      display:flex;
      align-items:center;
      gap:10px;
      justify-content:space-between;
    }
    .wh-body { display:flex; gap:18px; padding:12px; overflow:auto; }
    .wh-column { flex:1; display:flex; flex-direction:column; gap:8px; min-width:220px; }
    .wh-column h4 { margin:0; font-size:13px; color:#cfcfcf; font-weight:600; display:flex; align-items:center; gap:8px;}
    .wh-list { display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:8px; list-style:none; padding:0; margin:0; }
    .wh-list li {
      background: rgba(255,255,255,0.03);
      padding:8px 10px;
      border-radius:7px;
      text-align:center;
      cursor:pointer;
      user-select:none;
      transition: transform .12s ease, background .12s ease;
      font-size:13px;
      line-height:1.1;
    }
    .wh-list li:hover { transform:translateY(-3px); background: rgba(255,255,255,0.06); }
    .wh-list li.selected { background: #fff; color:#000; font-weight:600; }
    .wh-footer {
      border-top:1px solid rgba(255,255,255,0.03);
      padding:10px 14px;
      display:flex;
      gap:12px;
      align-items:center;
      justify-content:space-between;
      background: rgba(0,0,0,0.12);
    }
    .wh-preview {
      font-family: monospace;
      font-size:13px;
      color:#ddd;
      overflow-x:auto;
      white-space:nowrap;
      padding:6px 8px;
      border-radius:6px;
      background: rgba(255,255,255,0.02);
      min-height:30px;
      display:flex;
      align-items:center;
      gap:8px;
    }
    .wh-controls { display:flex; gap:8px; align-items:center; }
    .wh-btn {
      padding:7px 12px;
      border-radius:8px;
      border:none;
      cursor:pointer;
      font-weight:600;
    }
    .wh-btn.primary { background:#00b894; color:white; }
    .wh-btn.primary:hover { background:#00d5a6; }
    .wh-btn.ghost { background: rgba(255,255,255,0.04); color:#fff; }
    .wh-small { padding:6px 9px; font-size:13px; border-radius:7px; background: rgba(255,255,255,0.03); color:#eee; }
    .wh-search { width:100%; padding:8px 10px; border-radius:8px; border:none; background: rgba(255,255,255,0.02); color:#eee; outline:none; }
    .wh-select-all { display:flex; gap:8px; margin-top:6px; }
    .wh-note { font-size:12px; color:#bbb; }
    @media (max-width:800px) {
      .wh-body { flex-direction:column; }
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
    return btn;
  }

  async function addButtonToSidebar() {
    const sidebarContent = q('.sidebar-content > :first-child:last-of-type') || q('.sidebar') || q('.side'); // fallback selectors
    const btn = createMainButton();
    btn.addEventListener('click', (e) => { e.preventDefault(); openPopup(); });
    if (sidebarContent) {
      sidebarContent.insertAdjacentElement('afterend', btn);
    } else {
      // fallback: append to body top-right
      btn.style.position = 'fixed';
      btn.style.top = '14px';
      btn.style.right = '14px';
      btn.style.zIndex = 99999;
      document.body.appendChild(btn);
    }
  }

  /***************************************************************************
   *  Popup builder
   ***************************************************************************/
  function openPopup() {
    const imageSrc = getImageSrc();
    if (!imageSrc) {
      console.warn('[WH Downloader] wallpaper element not found.');
      return;
    }

    // collect tags from page
    const rawTags = qa('.tagname').map(n => n.innerText.trim()).filter(Boolean);

    // separate capitalized categories vs other tags
    const categories = rawTags.filter(t => t[0] === t[0].toUpperCase()).sort();
    const othertags  = rawTags.filter(t => t[0] !== t[0].toUpperCase()).sort();

    // load persisted selection if enabled
    const persisted = loadSelections(); // array of tag strings, or null
    const persistMap = {};
    if (persisted && Array.isArray(persisted)) persisted.forEach(s => (persistMap[String(s)] = true));

    // create popup DOM
    const popup = document.createElement('div');
    popup.className = 'wh-popup';

    const header = document.createElement('div');
    header.className = 'wh-header';
    header.innerHTML = `<div>Select tags for filename (tags-only preview shown)</div>
                        <div style="display:flex;gap:10px;align-items:center;">
                          <input id="wh_search" class="wh-search" placeholder="Filter tags..." title="Filter tags (search)"></input>
                        </div>`;

    const body = document.createElement('div');
    body.className = 'wh-body';

    // columns
    const colCategories = document.createElement('div'); colCategories.className = 'wh-column';
    const colTags = document.createElement('div'); colTags.className = 'wh-column';

    // helper to decide default selected
    const shouldBeSelectedByDefault = (tagRaw, isCategory) => {
      const tagLower = tagRaw.toLowerCase();
      // if persisted preference exists, respect it
      if (persistMap.hasOwnProperty(tagRaw)) return !!persistMap[tagRaw];
      // otherwise, if tag/cat listed in excludedDefaults -> not selected
      if (isCategory) {
        return !excludedDefaults.categories.some(ex => ex.toLowerCase() === tagRaw.toLowerCase());
      } else {
        return !excludedDefaults.tags.some(ex => ex.toLowerCase() === tagRaw.toLowerCase());
      }
    };

    // build list element
    const makeListFrom = (arr, isCategory) => {
      const ul = document.createElement('ul');
      ul.className = 'wh-list';
      arr.forEach(tag => {
        const li = document.createElement('li');
        li.textContent = tag;
        // default selected state
        if (shouldBeSelectedByDefault(tag, isCategory)) li.classList.add('selected');
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

    // add headers & select all/deselect all controls
    const catHeader = document.createElement('div');
    catHeader.innerHTML = `<h4>📚 Categories</h4>`;
    const catControls = document.createElement('div'); catControls.className = 'wh-select-all';
    const catSelectAll = document.createElement('button'); catSelectAll.className = 'wh-small wh-btn ghost'; catSelectAll.textContent = 'Select All';
    const catDeselectAll = document.createElement('button'); catDeselectAll.className = 'wh-small wh-btn ghost'; catDeselectAll.textContent = 'Deselect All';
    catControls.append(catSelectAll, catDeselectAll);
    catHeader.appendChild(catControls);

    const tagHeader = document.createElement('div');
    tagHeader.innerHTML = `<h4>🏷️ Tags</h4>`;
    const tagControls = document.createElement('div'); tagControls.className = 'wh-select-all';
    const tagSelectAll = document.createElement('button'); tagSelectAll.className = 'wh-small wh-btn ghost'; tagSelectAll.textContent = 'Select All';
    const tagDeselectAll = document.createElement('button'); tagDeselectAll.className = 'wh-small wh-btn ghost'; tagDeselectAll.textContent = 'Deselect All';
    tagControls.append(tagSelectAll, tagDeselectAll);
    tagHeader.appendChild(tagControls);

    catSelectAll.addEventListener('click', () => { listCat.querySelectorAll('li').forEach(li => li.classList.add('selected')); refreshPreview(); });
    catDeselectAll.addEventListener('click', () => { listCat.querySelectorAll('li').forEach(li => li.classList.remove('selected')); refreshPreview(); });
    tagSelectAll.addEventListener('click', () => { listTag.querySelectorAll('li').forEach(li => li.classList.add('selected')); refreshPreview(); });
    tagDeselectAll.addEventListener('click', () => { listTag.querySelectorAll('li').forEach(li => li.classList.remove('selected')); refreshPreview(); });

    colCategories.appendChild(catHeader);
    colCategories.appendChild(listCat);
    colTags.appendChild(tagHeader);
    colTags.appendChild(listTag);

    body.appendChild(colCategories);
    body.appendChild(colTags);

    // footer with preview and action buttons
    const footer = document.createElement('div');
    footer.className = 'wh-footer';

    const previewBox = document.createElement('div');
    previewBox.className = 'wh-preview';
    previewBox.textContent = ''; // will hold tags-only preview string

    const controls = document.createElement('div');
    controls.className = 'wh-controls';

    const btnDownload = document.createElement('button');
    btnDownload.className = 'wh-btn primary';
    btnDownload.textContent = 'Download';

    const btnCancel = document.createElement('button');
    btnCancel.className = 'wh-btn ghost';
    btnCancel.textContent = 'Cancel';

    controls.appendChild(btnDownload);
    controls.appendChild(btnCancel);

    footer.appendChild(previewBox);
    footer.appendChild(controls);

    popup.appendChild(header);
    popup.appendChild(body);
    popup.appendChild(footer);
    document.body.appendChild(popup);

    // search input behaviour
    const searchInput = popup.querySelector('#wh_search');
    const filterFn = (term) => {
      const t = (term || '').toLowerCase();
      [...listCat.querySelectorAll('li'), ...listTag.querySelectorAll('li')].forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(t) ? '' : 'none';
      });
    };
    searchInput.addEventListener('input', (e) => filterFn(e.target.value));

    // close on outside click
    popup.addEventListener('click', (ev) => {
      if (ev.target === popup) closePopup();
    });

    // close on Esc
    const escHandler = (ev) => { if (ev.key === 'Escape') closePopup(); };
    document.addEventListener('keydown', escHandler);

    // helper refresh preview
    function refreshPreview() {
      const selected = [...popup.querySelectorAll('li.selected')].map(n => n.textContent.trim());
      const tagString = tagsToPreviewString(selected); // tags-only string
      previewBox.textContent = tagString || '(no tags selected)';
      return tagString;
    }

    // initial preview
    refreshPreview();

    // cancel
    btnCancel.addEventListener('click', () => closePopup());

    // download action
    btnDownload.addEventListener('click', async () => {
      const selected = [...popup.querySelectorAll('li.selected')].map(n => n.textContent.trim());
      // Save preferences if enabled
      if (enableLocalStorage) {
        saveSelections(selected);
      }
      const tagString = tagsToPreviewString(selected); // tags-only portion

      // Build final filename: baseName-[tags].ext  OR just baseName.ext if no tags
      const filename = imageSrc.substring(imageSrc.lastIndexOf('/') + 1);
      const baseName = filename.replace(/\.[^.]+$/, '');
      const ext = filename.split('.').pop();
      const finalName = tagString ? `${baseName}-${tagString}.${ext}` : `${baseName}.${ext}`;

      try {
        const resp = await fetch(imageSrc);
        if (!resp.ok) throw new Error('Network response not ok');
        const blob = await resp.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = finalName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 200);
      } catch (err) {
        console.error('[WH Downloader] download failed', err);
      }
      closePopup();
    });

    // cleanup
    function closePopup() {
      document.removeEventListener('keydown', escHandler);
      popup.remove();
    }

    // auto-focus search input
    setTimeout(() => { searchInput.focus(); searchInput.select(); }, 40);
  }

  /***************************************************************************
   *  Init
   ***************************************************************************/
  addButtonToSidebar();

  // Optional: observe for dynamic single-page navigation reloads (re-add button if necessary)
  const observer = new MutationObserver(() => {
    // if button disappeared (site changed DOM), try to re-add
    if (!document.querySelector('.wh-dl-btn')) addButtonToSidebar();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();

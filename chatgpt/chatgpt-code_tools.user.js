// ==UserScript==
// @name         ChatGPT Code Tools
// @name:el      Εργαλεία Κώδικα για το ChatGPT
// @namespace    https://github.com/CarpeNoctemXD/UserScripts
// @version      1.3.2
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

    const SCRIPT_VERSION = '1.3.2';
    let stackedCodeBlocks = [];
    let stackCounter = 0;
    let stackTimeout = null;

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

    const getFileExtension = (languageClass) => {
        if (!languageClass) return 'txt';
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
        return 'txt';
    };

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

    const copyToClipboard = (text, button) => {
        navigator.clipboard.writeText(text).then(() => setButtonState(button, 'working', 'copy'))
        .catch((err) => { console.error(err); setButtonState(button, 'error', 'copy'); });
    };

    const copyStackedCode = () => {
        if (stackedCodeBlocks.length === 0) return;
        const combined = stackedCodeBlocks.join('\n\n// ' + '='.repeat(50) + '\n\n');
        navigator.clipboard.writeText(combined).catch(err => console.error('Failed to copy stacked code', err));
    };

    const stackCodeBlock = (text, button) => {
        if (stackTimeout) clearTimeout(stackTimeout);
        stackCounter++; stackedCodeBlocks.push(text);
        copyStackedCode();
        document.querySelectorAll('.stack-button').forEach(btn => setButtonState(btn, 'stacked', 'stack', stackCounter));
        stackTimeout = setTimeout(resetStack, 15000);
    };

    const resetStack = () => {
        stackCounter = 0; stackedCodeBlocks = [];
        document.querySelectorAll('.stack-button').forEach(btn => setButtonState(btn, 'standby', 'stack'));
        if (stackTimeout) { clearTimeout(stackTimeout); stackTimeout = null; }
    };

    const setButtonState = (button, state, type, count = 0) => {
        switch(state) {
            case 'working': button.textContent = type==='download'?'Saving...':'Copied!'; button.style.background='linear-gradient(135deg, #28a745, #20c997)'; break;
            case 'error': button.textContent='Error!'; button.style.background='linear-gradient(135deg, #dc3545, #c82333)'; break;
            case 'stacked': button.textContent=`Stacked ${count}`; button.style.background='linear-gradient(135deg, #e83e8c, #d91a72)'; break;
            default: button.textContent=button.dataset.defaultText||'Unknown';
                if(type==='save') button.style.background='linear-gradient(135deg, #007BFF, #0069D9)';
                else if(type==='copy') button.style.background='linear-gradient(135deg, #0069D9, #0056B3)';
                else if(type==='stack') button.style.background='linear-gradient(135deg, #0056B3, #384CBA)';
        }
        button.style.color='white';
        if((state==='working'||state==='error')&&type!=='stack') setTimeout(()=>setButtonState(button,'standby',type),5000);
    };

    // --- Improved filename detection ---
    const detectScriptName = (codeBlock) => {
        // Traverse backwards and collect text content from previous siblings
        let prev = codeBlock.previousSibling;
        let lastLine = '';
        while (prev) {
            let text = prev.textContent?.trim();
            if (text) lastLine = text; // always keep the last non-empty line
            prev = prev.previousSibling;
        }

        // Remove leading emoji/non-alphanumeric characters
        lastLine = lastLine.replace(/^[^\w]+/, '');

        // Match "File: <name>" and strip parentheses
        let match = lastLine.match(/^File:\s*(.+?)(?:\s*\(.*\))?$/i);
        if (match) {
            let name = match[1].trim();
            // Remove invalid filesystem characters
            name = name.replace(/[<>:"/\\|?*≤]/g,'');
            return name;
        }

        // fallback: first comment line inside the code block
        const codeText = codeBlock.querySelector('code')?.textContent || '';
        const firstLine = codeText.split(/\r?\n/)[0].trim();
        const commentMatch = firstLine.match(/^[#;\/\/]+\s*(.+\.\w+)$/);
        if (commentMatch) return commentMatch[1].trim();

        // final fallback: language-based extension
        const languageClass = codeBlock.querySelector('code')?.className || '';
        const ext = getFileExtension(languageClass);
        return `code.${ext}`;
    };


    const addButtonsToCodeBlock = (codeBlock) => {
        if(codeBlock.querySelector('.code-buttons-wrapper')) return;
        const wrapper=document.createElement('div'); wrapper.classList.add('code-buttons-wrapper');
        wrapper.style.position='relative'; wrapper.style.display='flex'; wrapper.style.justifyContent='flex-start'; wrapper.style.gap='8px'; wrapper.style.marginTop='8px';

        const saveButton=document.createElement('button'); saveButton.textContent='Save'; styleButton(saveButton,'save');
        saveButton.addEventListener('click',(e)=>{
            e.stopPropagation();
            const codeEl=codeBlock.querySelector('code'); if(codeEl){ const text=codeEl.textContent; const filename=detectScriptName(codeBlock); downloadFile(text,filename,saveButton);}
        });

        const copyButton=document.createElement('button'); copyButton.textContent='Copy'; styleButton(copyButton,'copy');
        copyButton.addEventListener('click',(e)=>{ e.stopPropagation(); const codeEl=codeBlock.querySelector('code'); if(codeEl) copyToClipboard(codeEl.textContent,copyButton); });

        const stackButton=document.createElement('button'); stackButton.textContent='Stack'; stackButton.classList.add('stack-button'); styleButton(stackButton,'stack');
        stackButton.addEventListener('click',(e)=>{ e.stopPropagation(); const codeEl=codeBlock.querySelector('code'); if(codeEl) stackCodeBlock(codeEl.textContent,stackButton); });

        saveButton.dataset.defaultText='Save'; copyButton.dataset.defaultText='Copy'; stackButton.dataset.defaultText='Stack';

        codeBlock.parentNode.insertBefore(wrapper,codeBlock.nextSibling);
        wrapper.appendChild(saveButton); wrapper.appendChild(copyButton); wrapper.appendChild(stackButton);
    };

    const styleButton=(button,type)=>{
        let baseGradient;
        switch(type){ case 'save': baseGradient='linear-gradient(135deg, #007BFF, #0069D9)'; break; case 'copy': baseGradient='linear-gradient(135deg, #0069D9, #0056B3)'; break; case 'stack': baseGradient='linear-gradient(135deg, #0056B3, #384CBA)'; break;}
        Object.assign(button.style,{display:'inline-block',padding:'10px 16px',background:baseGradient,color:'white',border:'none',borderRadius:'6px',cursor:'pointer',transition:'all 0.3s ease',fontSize:'14px',fontWeight:'600',textShadow:'0 1px 1px rgba(0,0,0,0.2)',boxShadow:'0 2px 4px rgba(0,0,0,0.1)'});
        button.addEventListener('mouseover',()=>{ const c=button.textContent; if(c.includes('...')||c.includes('!')||c.startsWith('Stacked')) return; let hover; switch(type){ case 'save': hover='linear-gradient(135deg, #0069D9, #0056B3)'; break; case 'copy': hover='linear-gradient(135deg, #0056B3, #004499)'; break; case 'stack': hover='linear-gradient(135deg, #384CBA, #2a3a9e)'; break;} button.style.background=hover; button.style.transform='translateY(-1px)'; button.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)';});
        button.addEventListener('mouseout',()=>{ const c=button.textContent; if(c.includes('...')||c.includes('!')||c.startsWith('Stacked')) return; button.style.background=baseGradient; button.style.transform='translateY(0)'; button.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)';});
        button.addEventListener('mousedown',()=>{ const c=button.textContent; if(!c.includes('...')&&!c.includes('!')&&!c.startsWith('Stacked')){ button.style.transform='translateY(0)'; button.style.boxShadow='0 1px 2px rgba(0,0,0,0.1)'; } });
    };

    const observeCodeBlocks=()=>{ document.querySelectorAll('pre:not(.processed)').forEach(addButtonsToCodeBlock); document.querySelectorAll('pre:not(.processed)').forEach(b=>b.classList.add('processed'));};
    const observer=new MutationObserver(observeCodeBlocks);
    observer.observe(document.body,{childList:true,subtree:true});
    observeCodeBlocks();

})();

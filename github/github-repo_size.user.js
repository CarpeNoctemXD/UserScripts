// ==UserScript==
// @name        Github Repository Size
// @name:el     Μέγεθος Αποθετηρίου Github
// @namespace   https://github.com/CarpeNoctemXD/UserScripts
// @description Adds the repository size next to the repo name on github search and repo pages
// @description:el Προσθέτει το μέγεθος του αποθετηρίου δίπλα στο όνομα του αποθετηρίου στις σελίδες αναζήτησης και αποθετηρίων του github
// @version     1.0.3
// @author      CarpeNoctemXD
// @match       *://github.com/search*
// @match       *://github.com/*/*
// @grant       GM_registerMenuCommand
// @grant       GM_setValue
// @grant       GM_getValue
// @icon        https://github.githubassets.com/favicons/favicon-dark.png
// @updateURL   https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/github/github-repo_size.user.js
// @downloadURL https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/github/github-repo_size.user.js
// @license     MIT
// ==/UserScript==

/* Edited version of mshll's https://github.com/mshll/repo-size script (version 0.1.1, retrieved on 2025-09-15) under MIT License. */



"use strict";

// Persistent storage for GitHub token and size color
let TOKEN = GM_getValue("github_token", "");
let SIZE_COLOR = GM_getValue("size_color", "#4493f8");

// Menu options
GM_registerMenuCommand("Set GitHub Token", async () => {
  const token = prompt("Enter your GitHub personal access token (with 'repo' scope for private repos):", TOKEN);
  if (token) {
    TOKEN = token;
    GM_setValue("github_token", token);
    alert("Token saved!");
  }
});

GM_registerMenuCommand("Set Repo Size Color", async () => {
  const color = prompt("Enter a hex color for the repo size elements:", SIZE_COLOR);
  if (color) {
    SIZE_COLOR = color;
    GM_setValue("size_color", color);
    alert(`Color set to ${color}`);
  }
});

const getPageType = () => {
  const { pathname, search } = window.location;
  const params = new URLSearchParams(search);
  const [, username, repo] = pathname.split("/");
  const q = params.get("q")?.toLocaleLowerCase();
  const type = params.get("type")?.toLocaleLowerCase();
  if (username && repo) return "repo";
  if (q && type === "code") return "code_search";
  if (q) return "search";
};

const addSizeToRepos = () => {
  const pageType = getPageType();
  let repoSelector;
  switch (pageType) {
    case "repo": repoSelector = "#repository-container-header strong a"; break;
    case "search": repoSelector = "li.repo-list-item .f4 a"; break;
    case "code_search": repoSelector = ".code-list-item text-small Link--secondary"; break;
    default: return;
  }

  document.querySelectorAll(repoSelector).forEach(async (elem) => {
    const tkn = TOKEN;
    if (!tkn) return;

    const href = elem.getAttribute("href");
    if (!href) return;

    const jsn = await (await fetch(`https://api.github.com/repos${href}`, {
      headers: { authorization: `token ${tkn}` }
    })).json();

    if (jsn.message) return;

    let parent = elem.parentElement;
    if (pageType === "repo") parent = elem.parentElement.parentElement;

    let sizeContainer = parent.querySelector(`#mshll-repo-size`);
    if (!sizeContainer) {
      sizeContainer = document.createElement("span");
      sizeContainer.id = "mshll-repo-size";
      sizeContainer.style.color = SIZE_COLOR;
      sizeContainer.classList.add("Label", "Label--info", "v-align-middle", "ml-1");
      sizeContainer.setAttribute("title", "Repository size");
      sizeContainer.innerText = "-";

      let sizeSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      sizeSVG.setAttribute("aria-hidden", "true");
      sizeSVG.setAttribute("viewBox", "-4 -4 22 22");
      sizeSVG.setAttribute("width", "16");
      sizeSVG.setAttribute("height", "16");
      sizeSVG.setAttribute("fill", "currentColor");
      sizeSVG.setAttribute("data-view-component", "true");
      sizeSVG.classList.add("octicon", "octicon-file-directory", "mr-1");

      let sizeSVGPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      sizeSVGPath.setAttribute("fill-rule", "evenodd");
      sizeSVGPath.setAttribute("d", "M1 3.5c0-.626.292-1.165.7-1.59.406-.422.956-.767 1.579-1.041C4.525.32 6.195 0 8 0c1.805 0 3.475.32 4.722.869.622.274 1.172.62 1.578 1.04.408.426.7.965.7 1.591v9c0 .626-.292 1.165-.7 1.59-.406.422-.956.767-1.579 1.041C11.476 15.68 9.806 16 8 16c-1.805 0-3.475-.32-4.721-.869-.623-.274-1.173-.62-1.579-1.04-.408-.426-.7-.965-.7-1.591Zm1.5 0c0 .133.058.318.282.551.227.237.591.483 1.101.707C4.898 5.205 6.353 5.5 8 5.5c1.646 0 3.101-.295 4.118-.742.508-.224.873-.471 1.1-.708.224-.232.282-.417.282-.55 0-.133-.058-.318-.282-.551-.227-.237-.591-.483-1.101-.707C11.102 1.795 9.647 1.5 8 1.5c-1.646 0-3.101.295-4.118.742-.508.224-.873.471-1.1.708-.224.232-.282.417-.282.55Zm0 4.5c0 .133.058.318.282.551.227.237.591.483 1.101.707C4.898 9.705 6.353 10 8 10c1.646 0 3.101-.295 4.118-.742.508-.224.873-.471 1.1-.708.224-.232.282-.417.282-.55V5.724c-.241.15-.503.286-.778.407C11.475 6.68 9.805 7 8 7c-1.805 0-3.475-.32-4.721-.869a6.15 6.15 0 0 1-.779-.407Zm0 2.225V12.5c0 .133.058.318.282.55.227.237.592.484 1.1.708 1.016.447 2.471.742 4.118.742 1.647 0 3.102-.295 4.117-.742.51-.224.874-.47 1.101-.707.224-.233.282-.418.282-.551v-2.275c-.241.15-.503.285-.778.406-1.247.549-2.917.869-4.722.869-1.805 0-3.475-.32-4.721-.869a6.327 6.327 0 0 1-.779-.406Z");
      sizeSVG.appendChild(sizeSVGPath);

      const sizes = ["B", "KB", "MB", "GB", "TB"];
      const size = jsn.size * 1024;
      let i = parseInt(Math.floor(Math.log(size) / Math.log(1024)));
      const humanReadableSize = (size / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];

      sizeContainer.innerHTML = `${humanReadableSize}`;
      sizeContainer.prepend(sizeSVG);
      parent.appendChild(sizeContainer);
    }
  });
};

addSizeToRepos();

let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    addSizeToRepos();
  }
}).observe(document, { subtree: true, childList: true });
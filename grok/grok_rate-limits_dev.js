// ==UserScript==
// @name         Grok Rate Limits Display (Development Version)
// @name:el      Εμφάνιση ορίων χρήσης για το Grok (Έκδοση Ανάπτυξης)
// @description  Displays rate limit information for Grok models in real-time 
// @description:el  Εμφανίζει πληροφορίες ορίων χρήσης για τα μοντέλα Grok σε πραγματικό χρόνο
// @author       CarpeNoctemXD
// @namespace    https://github.com/CarpeNoctemXD/
// @version      1.2.0
// @match        https://grok.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://x.ai
// @updateURL    https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/grok/grok_rate-limits_dev.js
// @downloadURL  https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/grok/grok_rate-limits_dev.js
// @license      MIT
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // --- State ---
  let rateInfoElement = null;
  const modelRateLimits = {
    "grok-latest": null,
    "grok-3": {
      DEFAULT: null,
      REASONING: null,
      DEEPSEARCH: null,
      DEEPERSEARCH: null,
    },
  };
  const modelDisplayNames = {
    "grok-latest": "Grok 2",
    "grok-3": {
      DEFAULT: "Grok 3",
      REASONING: "Think",
      DEEPSEARCH: "DeepSearch",
      DEEPERSEARCH: "DeeperSearch",
    },
  };

  // --- Helpers ---
  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "-";
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      if (remainingMinutes > 0) {
        return remainingSeconds > 0
            ? `${hours}h ${remainingMinutes}m ${remainingSeconds}s`
            : `${hours}h ${remainingMinutes}m`;
      }
      return remainingSeconds > 0 ? `${hours}h ${remainingSeconds}s` : `${hours}h`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  function getColorStyle(percent) {
    if (percent === 100) return { bg: "#16a34a", color: "#fff" }; // green
    if (percent >= 50) return { bg: "#ffffff", color: "#000" };   // white
    if (percent >= 20) return { bg: "#eab308", color: "#000" };   // yellow
    if (percent > 0) return { bg: "#f97316", color: "#fff" };     // orange
    return { bg: "#dc2626", color: "#fff" };                      // red
  }

  function isValidRateData(data) {
    return (
      data &&
      typeof data.remainingQueries === "number" &&
      typeof data.totalQueries === "number"
    );
  }

  function createSpinner() {
    const spinner = document.createElement("div");
    spinner.className = "animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full";
    spinner.setAttribute("aria-label", "Loading");
    return spinner;
  }

  // --- UI Update ---
  function updateRateInfo(data, modelName, requestKind = "DEFAULT") {
    if (!rateInfoElement) return;

    if (modelName === "grok-3") {
      modelRateLimits[modelName][requestKind] = data;
    } else {
      modelRateLimits[modelName] = data;
    }

    const lines = [];

    // Remove spinner if exists
    const spinner = rateInfoElement.querySelector(".animate-spin");
    if (spinner) spinner.remove();

    for (const kind of ["DEFAULT", "REASONING", "DEEPSEARCH", "DEEPERSEARCH"]) {
      const modelData = modelRateLimits["grok-3"][kind];
      if (!modelData) continue;

      const timeStr = formatTime(modelData.windowSizeSeconds);
      const displayName = modelDisplayNames["grok-3"][kind];
      const remaining = modelData.remainingQueries;
      const total = modelData.totalQueries;

      if (total === 0) {
        console.warn(`[grok-ratelimit] Total queries for ${displayName} is zero.`);
        continue; // Skip invalid data
      }

      const percentage = (remaining / total) * 100;
      const { bg, color } = getColorStyle(percentage);

      lines.push(`<span style="background:${bg};color:${color};font-weight:bold;padding:0.5em 0.75em;border-radius:0.5em;font-size:1.1em;">
          ${displayName}: ${remaining}/${total}
          <span style="color:#0f0f0f;font-size:0.85em;">(${timeStr})</span>
      </span>`);
    }

    const grok2Data = modelRateLimits["grok-latest"];
    if (grok2Data) {
      const timeStr = formatTime(grok2Data.windowSizeSeconds);
      const remaining = grok2Data.remainingQueries;
      const total = grok2Data.totalQueries;

      if (total === 0) {
        console.warn(`[grok-ratelimit] Total queries for ${modelDisplayNames["grok-latest"]} is zero.`);
        return; // Skip invalid data
      }

      const percentage = (remaining / total) * 100;
      const { bg, color } = getColorStyle(percentage);

      lines.push(`<span style="background:${bg};color:${color};font-weight:bold;padding:0.5em 0.75em;border-radius:0.5em;font-size:1.1em;">
          ${modelDisplayNames["grok-latest"]}: ${remaining}/${total}
          <span style="color:#0f0f0f;font-size:0.85em;">(${timeStr})</span>
      </span>`);
    }

    rateInfoElement.innerHTML = lines.length ? lines.join(" \u00b7 ") : "<span style='color:#dc2626'>No rate limit data</span>";
  }

  // --- Networking ---
  async function fetchRateLimit(
    modelName,
    requestKind = "DEFAULT",
    attempt = 1
  ) {
    try {
      const response = await fetch("/rest/rate-limits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestKind, modelName }),
      });

      if (response.status !== 200 && attempt <= 10) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchRateLimit(modelName, requestKind, attempt + 1);
      }

      const data = await response.json();
      if (!isValidRateData(data)) return;

      updateRateInfo(data, modelName, requestKind);
    } catch (error) {
      console.error(`[grok-ratelimit] Rate limit fetch failed:`, error);
      if (attempt <= 10) return;
      if (rateInfoElement) {
        rateInfoElement.innerHTML = "<span style='color:#dc2626'>Couldn't fetch ratelimit info</span>";
      }
    }
  }

  // --- DOM Integration ---
  function createRateInfoElement() {
    const targetDiv = document.querySelector(
      'main div:has(> a[aria-label="Home page"])'
    );
    if (targetDiv && !rateInfoElement) {
      const headerDiv = targetDiv.parentElement;

      // Remove conflicting classes if present
      headerDiv.classList.remove(
        "@[80rem]/nav:h-0",
        "@[80rem]/nav:top-8",
        "@[80rem]/nav:from-transparent",
        "@[80rem]/nav:via-transparent"
      );

      rateInfoElement = document.createElement("div");
      rateInfoElement.className = "ml-2 text-sm break-words flex items-center gap-2";
      rateInfoElement.style.maxWidth = "calc(100vw - 240px)";

      // Add loading spinner
      rateInfoElement.appendChild(createSpinner());
      const textEl = document.createElement("span");
      textEl.textContent = "Loading rate limits...";
      rateInfoElement.appendChild(textEl);

      targetDiv.appendChild(rateInfoElement);

      // Fetch all rate limits in sequence
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      (async () => {
        for (const kind of ["DEFAULT", "REASONING", "DEEPSEARCH", "DEEPERSEARCH"]) {
          await fetchRateLimit("grok-3", kind);
          await sleep(100);
        }
        await fetchRateLimit("grok-latest");
      })();
    }
  }

  function waitForElement() {
    const targetDiv = document.querySelector(
      'main div:has(> a[aria-label="Home page"])'
    );
    if (targetDiv) {
      createRateInfoElement();
    } else {
      requestAnimationFrame(waitForElement);
    }
  }

  // --- Patch fetch to auto-update UI ---
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const [resource, options] = args;
    const url =
      resource instanceof Request ? resource.url : resource.toString();

    if (!url.includes("/rest/rate-limits")) {
      return originalFetch.apply(this, args);
    }

    const requestBody = JSON.parse(options.body);
    const modelName = requestBody.modelName;
    const requestKind = requestBody.requestKind;
    const response = await originalFetch.apply(this, args);

    const clone = response.clone();
    clone.json().then((data) => {
      if (!isValidRateData(data)) return;
      updateRateInfo(data, modelName, requestKind);
    });

    return response;
  };

  // --- Start ---
  waitForElement();
})();

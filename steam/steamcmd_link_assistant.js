// ==UserScript==
// @name         SteamCMD Link Assistant
// @name:el      Βοηθός Συνδέσμων SteamCMD
// @namespace    https://github.com/CarpeNoctemXD/UserScripts
// @version      0.8.2.1
// @description  Generate SteamCMD download command for mods from Steam Workshop
// @description:el Δημιουργεί εντολή λήψης από mods στο Steam Workshop για το SteamCMD
// @author       CarpeNoctemXD
// @match        https://steamcommunity.com/sharedfiles/filedetails/*
// @match        https://steamcommunity.com/workshop/filedetails/*
// @match        https://steamcommunity.com/workshop/browse/*
// @run-at       document-end// @run-at       document-end
// @grant        GM_setClipboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://steamcommunity.com
// @updateURL    https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/steam/steamcmd_link_assistant.js
// @downloadURL  https://raw.githubusercontent.com/CarpeNoctemXD/UserScripts/refs/heads/main/steam/steamcmd_link_assistant.js
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // Check if on a valid mod page
    const urlParams = new URLSearchParams(window.location.search);
    const workshopId = urlParams.get('id');

    if (!workshopId) {
        return;
    }

    // Extract the game <appid> from the page
    const appIdElement = document.querySelector('[data-appid]');
    const appId = appIdElement ? appIdElement.getAttribute('data-appid') : null;

    // Ensure that both the workshop ID and app ID are present
    if (!workshopId || !appId) {
        console.error("Invalid appId or workshopId.");
        return;
    }

    // Create the button to copy the SteamCMD ID
    const button = document.createElement('button');
    button.textContent = 'Copy SteamCMD ID';
    button.style.position = 'fixed';  // Fixed position to keep button visible during scrolling
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.padding = '10px';
    button.style.backgroundColor = '#4CAF50'; // Initial green color
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.fontSize = '14px';
    button.style.transition = 'background-color 0.3s';
    button.style.zIndex = '9999';  // Ensure button is on top

    // Inject the button into the page
    document.body.appendChild(button);

    // Function to create a small notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '10px';
        notification.style.right = '10px';
        notification.style.padding = '10px';
        notification.style.backgroundColor = '#333';
        notification.style.color = 'white';
        notification.style.borderRadius = '5px';
        notification.style.fontSize = '14px';
        notification.style.zIndex = '9999';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';

        document.body.appendChild(notification);

        // Fade-in and fade-out effect
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }

    // Add event listener to the button to copy the SteamCMD ID
    button.addEventListener('click', () => {
        const command = `workshop_download_item ${appId} ${workshopId}`;
        GM_setClipboard(command);

        // Change the button color to grey for 5 seconds, then to a darker orange permanently
        button.style.backgroundColor = '#808080';  // Grey color
        setTimeout(() => {
            button.style.backgroundColor = '#FF8C00';  // Darker orange color
        }, 5000);

        showNotification('Copied!');
    });
})();

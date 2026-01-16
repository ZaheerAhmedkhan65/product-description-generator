// background.js
import Settings from './settings.js';

const settingsManager = new Settings();

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason === 'install' || reason === 'update') {
        await settingsManager.initialize();

        const apiKey = settingsManager.get('apiKey');
        if (!apiKey) {
            chrome.runtime.openOptionsPage();
        }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received:', request.type, 'from tab:', sender.tab?.id);

    switch (request.type) {
        case 'OPEN_OPTIONS':
            chrome.runtime.openOptionsPage();
            sendResponse({ success: true });
            break;

        case 'GET_API_KEY':
            sendResponse({ apiKey: settingsManager.get('apiKey') });
            return true;

        case 'GET_SETTINGS':
            sendResponse(settingsManager.getAll());
            return true;

        case 'SAVE_SETTINGS':
            settingsManager.saveToStorage(request.settings)
                .then(() => sendResponse({ success: true }))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;
    }
});
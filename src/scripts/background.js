// background.js
import Settings from './settings.js';

const settingsManager = new Settings();
let initializationPromise = null;

// Initialize settings on install/update
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason === 'install' || reason === 'update') {
        await settingsManager.initialize();

        const apiKeys = settingsManager.getApiKeys();
        if (!apiKeys || apiKeys.length === 0) {
            chrome.runtime.openOptionsPage();
        }
    }
});

// Ensure settings are initialized before handling messages
async function ensureInitialized() {
    if (settingsManager.initialized) {
        return;
    }

    if (!initializationPromise) {
        initializationPromise = settingsManager.initialize();
    }

    await initializationPromise;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received:', request.type, 'from tab:', sender.tab?.id);

    // Handle all messages asynchronously to ensure initialization
    (async () => {
        try {
            await ensureInitialized();

            switch (request.type) {
                case 'OPEN_OPTIONS':
                    chrome.runtime.openOptionsPage();
                    sendResponse({ success: true });
                    break;

                case 'GET_API_KEY':
                    sendResponse({ apiKey: settingsManager.getCurrentApiKey() });
                    break;

                case 'GET_SETTINGS':
                    const settings = settingsManager.getAll();
                    console.log('Sending settings from background:', settings);
                    sendResponse(settings);
                    break;

                case 'SAVE_SETTINGS':
                    await settingsManager.saveToStorage(request.settings);
                    sendResponse({ success: true });
                    break;

                case 'ROTATE_API_KEY':
                    await settingsManager.rotateToNextApiKey();
                    const newKey = settingsManager.getCurrentApiKey();
                    sendResponse({ success: true, apiKey: newKey });
                    break;

                default:
                    sendResponse({ error: 'Unknown request type' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ error: error.message });
        }
    })();

    return true; // Keep channel open for async response
});
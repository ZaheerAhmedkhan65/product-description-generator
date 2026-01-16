class Settings{
    constructor(){
        this.settings = this.defaultSettings();
        this.listeners = [];
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        // Load settings from Chrome sync storage
        await this.loadFromStorage();

        // Listen for changes in other tabs
        this.setupChangeListener();

        this.initialized = true;
    }

    async loadFromStorage() {
        try {
            const result = await chrome.storage.sync.get(null);

            // Merge with defaults
            this.settings = {
                ...this.defaultSettings(),
                ...result
            };

        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async saveToStorage(settings = null) {
        try {
            if (settings) {
                this.settings = {
                    ...this.settings,
                    ...settings
                };
            }

            await chrome.storage.sync.set(this.settings);

            // Notify all listeners
            this.notifyListeners();

            // Broadcast to other extension contexts
            await this.broadcastSettings();

            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    async broadcastSettings() {
        try {
            // Save to localStorage on all VU tabs
            const tabs = await chrome.tabs.query({ url: 'https://onlinesalepoint.com/shop/products/*/edit' });

            for (const tab of tabs) {
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: (settings) => {
                            // Save to localStorage for fallback
                            localStorage.setItem('product_descripton_generator_settings', JSON.stringify(settings));

                            // Broadcast to content scripts
                            chrome.tabs.sendMessage(tab.id, {
                                type: 'settings',
                                settings
                            });
                        },
                        args: [this.settings]
                    });
                } catch (error) {
                    console.log(`Could not update tab ${tab.id}:`, error.message);
                }
            }
        } catch (error) {
            console.error('Error broadcasting settings:', error);
        }
    }

    setupChangeListener() {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'sync') {
                Object.keys(changes).forEach(key => {
                    this.settings[key] = changes[key].newValue;
                });

                this.notifyListeners();
            }
        });
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.settings);
            } catch (error) {
                console.error('Error in settings listener:', error);
            }
        });
    }

    get(key) {
        return this.settings[key];
    }

    set(key, value) {
        this.settings[key] = value;
        return this.saveToStorage({ [key]: value });
    }

    getAll() {
        return { ...this.settings };
    }

    resetToDefaults() {
        this.settings = this.defaultSettings();
        return this.saveToStorage();
    }

    defaultSettings() {
        return {
            apiKey: '',
            apiEndPoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
        };
    }
}

export default Settings;
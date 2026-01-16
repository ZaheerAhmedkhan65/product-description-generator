import Settings from './scripts/settings.js';

// Settings UI Handler
class SettingsUI {
    constructor() {
        this.settingsManager = new Settings();
        this.init();
    }

    async init() {
        await this.settingsManager.initialize();
        this.loadCurrentSettings();
        this.attachEventListeners();
    }

    loadCurrentSettings() {
        const settings = this.settingsManager.getAll();
        document.getElementById('apiKey').value = settings.apiKey || '';
        document.getElementById('apiEndPoint').value = settings.apiEndPoint || '';
    }

    attachEventListeners() {
        const form = document.getElementById('settingsForm');
        const resetBtn = document.getElementById('resetBtn');

        form.addEventListener('submit', (e) => this.handleSave(e));
        resetBtn.addEventListener('click', () => this.handleReset());

        // Listen for changes in other tabs
        this.settingsManager.addListener((settings) => {
            this.loadCurrentSettings();
            this.showMessage('Settings updated in another tab', 'info');
        });
    }

    async handleSave(e) {
        e.preventDefault();

        const apiKey = document.getElementById('apiKey').value.trim();
        const apiEndPoint = document.getElementById('apiEndPoint').value.trim();

        if (!apiKey) {
            this.showMessage('❌ API Key is required', 'error');
            return;
        }

        const settings = {
            apiKey: apiKey,
            apiEndPoint: apiEndPoint || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
        };

        try {
            await this.settingsManager.saveToStorage(settings);
            this.showMessage('Settings saved successfully!', 'success');
        } catch (error) {
            this.showMessage(`❌ Error saving settings: ${error.message}`, 'error');
        }
    }

    async handleReset() {
        if (confirm('Are you sure you want to reset to default settings?')) {
            try {
                await this.settingsManager.resetToDefaults();
                this.loadCurrentSettings();
                this.showMessage('✅ Settings reset to defaults', 'success');
            } catch (error) {
                this.showMessage(`❌ Error resetting settings: ${error.message}`, 'error');
            }
        }
    }

    showMessage(message, type = 'info') {
        const messageEl = document.getElementById('statusMessage');
        messageEl.textContent = message;
        messageEl.className = `status-message show ${type}`;

        if (type !== 'error') {
            setTimeout(() => {
                messageEl.classList.remove('show');
            }, 3000);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SettingsUI();
});

class DescriptionGenerator {
    constructor() {
        this.isInitialized = false;
        this.chromeAvailable = false;
        this.shortDesc = null;
        this.longDesc = null;
        this.settings = this.getSettings();
        this.init();
    }

    async init() {
        if (this.isInitialized) return;

        // Check Chrome API availability
        await this.checkChromeAvailability();

        // Wait for page to load
        await this.waitForPageReady();

        // Inject UI
        this.injectUI();
        this.isInitialized = true;
    }

    async checkChromeAvailability() {
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                this.chromeAvailable = true;
            } else {
                this.chromeAvailable = false;
            }
        } catch (error) {
            console.error('Error checking Chrome availability:', error);
            this.chromeAvailable = false;
        }
    }

    async waitForPageReady() {
        return new Promise(resolve => {
            if (document.readyState === 'complete') {
                setTimeout(resolve, 1000);
            } else {
                window.addEventListener('load', () => {
                    setTimeout(resolve, 1000);
                });
            }
        });
    }

    async getSettings() {
        return new Promise((resolve) => {
            try {
                if (!this.chromeAvailable) {
                    const saved = localStorage.getItem('product_descripton_generator_settings');
                    resolve(saved ? JSON.parse(saved) : {

                    });
                    return;
                }

                const timeout = setTimeout(() => {
                    console.warn('Timeout getting settings');
                    const saved = localStorage.getItem('product_descripton_generator_settings');
                    resolve(saved ? JSON.parse(saved) : {

                    });
                }, 3000);

                chrome.runtime.sendMessage(
                    { type: 'GET_SETTINGS' },
                    (response) => {
                        clearTimeout(timeout);
                        if (chrome.runtime.lastError) {
                            console.warn('Error getting settings:', chrome.runtime.lastError.message);
                            const saved = localStorage.getItem('product_descripton_generator_settings');
                            resolve(saved ? JSON.parse(saved) : {
                                apiKey: '',
                                apiEndPoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
                            });
                        } else {
                            // Ensure all new settings have default values
                            const settings = response || {};
                            resolve({
                                apiKey: settings.apiKey || '',
                                apiEndPoint: settings.apiEndPoint || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
                            });
                        }
                    }
                );
            } catch (error) {
                console.error('Error in getSettingsSafely:', error);
                const saved = localStorage.getItem('product_descripton_generator_settings');
                resolve(saved ? JSON.parse(saved) : {
                    apiKey: '',
                    apiEndPoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
                });
            }
        });
    }

    injectUI() {
        if (document.getElementById('product-descripton-generator-ui')) return;

        const floatingBtnContainer = document.createElement("div");
        floatingBtnContainer.classList.add("floating-btn-container");
        const floatingBtn = document.createElement("button");
        const iconImg = document.createElement("img");
        iconImg.src = chrome.runtime.getURL("icons/icon_48.png");
        iconImg.alt = "Product Description Generator";
        floatingBtn.appendChild(iconImg);
        floatingBtn.classList.add("floating-btn", "hide");
        floatingBtnContainer.appendChild(floatingBtn);
        document.body.appendChild(floatingBtnContainer);

        const container = document.createElement('div');
        container.id = 'product-descripton-generator-ui';
        container.innerHTML = `
            <div class="pdg-container">
                <div class="pdg-content-wrapper">
                    <div class="pdg-content" id="pdg-content">
                        <button class="pdgui-btn primary" data-action="gen-desc">
                            ✨ Generate Description
                        </button>

                        <button class="pdgui-btn secondary" data-action="open-options">
                            ⚙️ Settings
                        </button>
                    </div>
                    <button class="pdg-close">×</button>
                </div>
                <div class="pdg-status" id="pdg-status">Ready</div>
            </div>
        `;

        // Add styles
        this.injectStyles();
        document.body.appendChild(container);
        this.attachEventListeners();
    }

    injectStyles() {
        // Same styles as content_main.js
        const style = document.createElement('style');
        style.textContent = `
            #product-descripton-generator-ui {
                min-width: 250px;
                position: fixed;
                bottom: 20px;
                right: calc(50% - 175px);
                z-index: 10000;
                font-family: 'Segoe UI', Arial, sans-serif;
            }

            .pdg-container {
                background: rgb(89,69,118);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                padding: 10px 15px 5px;
                min-width: 250px;
                color: white;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s ease;
            }

            .floating-btn-container{
                position: fixed;
                bottom: 40px;
                left: 50%;
                transform: translateX(-50%);
                text-align: center;
                z-index: 9999;
            }

            .floating-btn{
                background-color: transparent;
                border: none;
                outline: none;
                cursor: pointer;
            }

            .floating-btn img {
                width: 48px;
                height: 48px;
                cursor: pointer;
                object-fit: contain;
            }

            .show{
                display: block !important;
            }

            .hide{
                display: none !important;
            }

            @keyframes slideUp {
                from { transform: translateY(100px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .pdg-close {
                background: red;
                border: none;
                outline:none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                position: absolute;
                top: -8px;
                right: -8px;
            }

            .pdg-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: black;
            }

            .pdg-content-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .pdg-content {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 18px;
            }

            .pdgui-btn {
                padding: 5px 10px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.2s;
            }

            .pdgui-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }

            .pdgui-btn.primary {
                background: #10b981;
                color: white;
            }

            .pdg-status {
                margin-top: 10px;
                padding-top: 5px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                font-size: 12px;
                opacity: 0.8;
                text-align: center;
            }
            
            .pdgui-btn.primary {
                background: #10b981;
                color: white;
            }
            
            .pdgui-btn.secondary {
                background: #8b5cf6;
                color: white;
            }
        `;
        document.head.appendChild(style);
    }

    attachEventListeners() {
        const container = document.getElementById('product-descripton-generator-ui');
        const floatingBtn = document.querySelector(".floating-btn");

        // Close button
        container.querySelector('.pdg-close').addEventListener('click', () => {
            container.style.display = 'none';
            floatingBtn.classList.remove('hide');
            floatingBtn.classList.add('show');
        });

        floatingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            container.style.display = 'block';
            floatingBtn.classList.remove('show');
            floatingBtn.classList.add('hide');
        })

        // Action buttons
        container.querySelectorAll('.pdgui-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleAction(action);
            });
        });
    }

    async handleAction(action) {
        this.updateStatus('Processing...');

        switch (action) {
            case 'gen-desc':
                await this.generateDescription();
                break;
            case 'open-options':
                if (this.chromeAvailable) {
                    chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
                }
                break;
        }

        this.updateStatus('Ready');
    }

    updateStatus(message) {
        const statusElement = document.getElementById('pdg-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    async generateDescription() {
        const STATIC_PROMPT = `
You are an expert marketplace product copywriter.

Rules:
- Write SEO-friendly content
- Plagiarism-free
- Simple English
- Use {{productName}} instead of the actual product name

Generate:
1. Short Description (40–60 words)
2. Long Description (120–150 words)

Output format:
Short Description:
<text>

Long Description:
<text>
`;

        // Get form elements
        const productNameElement = document.querySelector("#product_name");
        const shortDescElement = document.querySelector("#product_short_description");
        const longDescElement = document.querySelector("#product_description");

        if (!productNameElement || !shortDescElement || !longDescElement) {
            this.updateStatus("Error: Could not find form fields");
            console.error("Form fields not found");
            return;
        }

        const productName = productNameElement.value.trim();

        if (!productName) {
            this.updateStatus("Error: Product name is empty");
            alert("Please enter a product name");
            return;
        }

        this.updateStatus("Generating descriptions...");
        shortDescElement.value = "Generating...";
        longDescElement.value = "Generating...";

        try {
            // Get API key from Chrome storage
            const response = await new Promise((resolve) => {
                chrome.runtime.sendMessage(
                    { type: 'GET_SETTINGS' },
                    (response) => resolve(response)
                );
            });

            const { apiKey, apiEndPoint } = response || {};

            if (!apiKey) {
                throw new Error("API Key not configured. Please configure settings.");
            }

            const prompt = `${STATIC_PROMPT}\nProduct name: ${productName}`;

            const apiResponse = await fetch(
                `${apiEndPoint}?key=${apiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                role: "user",
                                parts: [{ text: prompt }]
                            }
                        ]
                    })
                }
            );

            const data = await apiResponse.json();

            if (!data.candidates?.length) {
                throw new Error(data.error?.message || "No text generated");
            }

            const text = data.candidates[0].content.parts[0].text;

            // Parse short and long descriptions from response
            const shortMatch = text.match(/Short Description:\s*([\s\S]*?)(?:Long Description:|$)/i);
            const longMatch = text.match(/Long Description:\s*([\s\S]*?)$/i);

            const shortDesc = shortMatch ? shortMatch[1].trim() : "Short description not found";
            const longDesc = longMatch ? longMatch[1].trim() : "Long description not found";

            // Auto-fill the form fields
            shortDescElement.value = shortDesc;
            longDescElement.value = longDesc;

            this.updateStatus("Descriptions generated successfully");

        } catch (error) {
            console.error("Generation error:", error);
            shortDescElement.value = "Error: " + error.message;
            longDescElement.value = "";
            this.updateStatus("❌ Error: " + error.message);
        }
    }

}

// Initialize the description generator
const descriptionGenerator = new DescriptionGenerator();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GENERATE_DESCRIPTION') {
        descriptionGenerator.generateDescription().then(() => {
            sendResponse({ success: true });
        }).catch((error) => {
            sendResponse({ success: false, error: error.message });
        });
        return true; // Indicate that we'll send response asynchronously
    }
});
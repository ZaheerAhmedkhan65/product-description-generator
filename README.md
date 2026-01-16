# Product Description Generator

A Chrome extension that automatically generates SEO-friendly product descriptions using Google's Gemini AI for Online Sale Point.

## ✨ Features

- **🚀 One-Click Generation**: Generate both short and long product descriptions instantly
- **🔐 Secure API Key Management**: Store API keys securely using Chrome's sync storage
- **☁️ Cloud Sync**: Settings sync across all your devices automatically
- **🎯 Smart Parsing**: Auto-fills form fields on product edit pages

## 📋 Requirements

- Chrome Browser (version 88+)
- Google Gemini API key (get one free at [AI Studio](https://aistudio.google.com/apikey))
- Product edit page on https://onlinesalepoint.com

## 🚀 Installation

### From Source (Development)

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `product-description-generator` folder
6. The extension will appear in your Chrome toolbar

### Configuration

1. Click the extension icon in the toolbar
2. Click **⚙️ Settings**
3. Enter your Gemini API key from [AI Studio](https://aistudio.google.com/apikey)
4. (Optional) Customize the API endpoint if needed
5. Click **Save Settings**

Your settings are now encrypted and synced to your Chrome account!

## 📖 How to Use

### On Product Edit Pages

1. Navigate to a product edit page (e.g., `onlinesalepoint.com/shop/products/*/edit`)
2. Either:
   - Click the **floating icon button** (bottom center of page), or
   - Use the extension popup to click **✨ Generate Description**
3. Watch as descriptions are generated and auto-filled:
   - Short Description (40-60 words) → `#product_short_description`
   - Long Description (120-150 words) → `#product_description`
4. Review the generated content and make any edits if needed
5. Save your product

## 🏗️ Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────┐
│                    Chrome Extension                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                │
│  │   Popup      │  │  Settings    │                │
│  │  (popup.js)  │  │  (settings)  │                │
│  └──────┬───────┘  └──────┬───────┘                │
│         │                  │                        │
│         └──────────────┬───┘                        │
│                        │                            │
│              ┌─────────▼──────────┐                │
│              │ Background Service │                │
│              │   (background.js)  │                │
│              │  - Settings Mgmt   │                │
│              │  - Message Router  │                │
│              └────────┬───────────┘                │
│                       │                            │
│              ┌────────▼──────────┐                │
│              │  Content Script   │                │
│              │ (content.js)      │                │
│              │ - UI Injection    │                │
│              │ - Description Gen │                │
│              │ - Form Filling    │                │
│              └───────────────────┘                │
│                       │                            │
│              ┌────────▼──────────┐                │
│              │  Gemini API       │                │
│              │ (Google AI)       │                │
│              └───────────────────┘                │
└─────────────────────────────────────────────────────┘
```

### Message Flow

```
User Action (Click Button)
    ↓
Popup sends: { type: 'GENERATE_DESCRIPTION' }
    ↓
Content Script Receives Message
    ↓
Content Script Requests Settings from Background Service Worker
    ↓
Background Service Worker Returns API Key (from chrome.storage.sync)
    ↓
Content Script Calls Gemini API
    ↓
Content Script Auto-fills Form Fields
    ↓
Status Update Shown (Descriptions Generated!)
```
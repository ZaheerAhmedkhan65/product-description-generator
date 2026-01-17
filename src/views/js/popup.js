// Popup Script - Simple action buttons that trigger content script actions

document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById("generateBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const statusEl = document.getElementById("status");

  if (generateBtn) {
    generateBtn.addEventListener("click", async () => {
      updateStatus("Sending generate request...");

      // Send message to content script
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'GENERATE_DESCRIPTION' }, (response) => {
            if (chrome.runtime.lastError) {
              updateStatus("Error: " + chrome.runtime.lastError.message);
            } else {
              updateStatus("Descriptions generated!");
            }
          });
        }
      } catch (error) {
        updateStatus("Error: " + error.message);
      }
    });
  }

  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });
  }
});

function updateStatus(message) {
  const statusEl = document.getElementById("status");
  if (statusEl) {
    statusEl.textContent = message;
  }
}

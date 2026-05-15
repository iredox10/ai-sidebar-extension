document.getElementById('openSidebar').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab) chrome.sidePanel.open({ windowId: tab.windowId });
  });
});

document.getElementById('openSettings').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

document.getElementById('askSelected').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { type: 'get-selection' }, (response) => {
      if (response?.text) {
        chrome.runtime.sendMessage({ type: 'ask-ai', text: response.text });
      } else {
        chrome.tabs.create({ url: 'about:blank' }, () => {
          window.close();
        });
      }
    });
  });
});

async function loadStatus() {
  const settings = await chrome.storage.sync.get([
    'openaiKey', 'anthropicKey', 'googleKey', 'provider', 'model'
  ]);

  const hasKey = !!(settings.openaiKey || settings.anthropicKey || settings.googleKey);
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  if (hasKey) {
    statusDot.className = 'status-dot on';
    statusText.textContent = 'Configured';
  } else {
    statusDot.className = 'status-dot off';
    statusText.textContent = 'Not configured';
  }

  document.getElementById('activeProvider').textContent =
    settings.provider || 'None';
  document.getElementById('activeModel').textContent =
    settings.model || 'gpt-4o';
}

loadStatus();

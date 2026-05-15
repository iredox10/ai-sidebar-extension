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
        chrome.tabs.create({ url: 'chrome://version' }, () => {
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
    statusDot.className = 'status-dot configured';
    statusText.textContent = 'Configured';
  } else {
    statusDot.className = 'status-dot not-configured';
    statusText.textContent = 'Not configured';
  }

  const providers = [];
  if (settings.openaiKey) providers.push('OpenAI');
  if (settings.anthropicKey) providers.push('Anthropic');
  if (settings.googleKey) providers.push('Google');

  document.getElementById('activeProvider').textContent =
    settings.provider || (providers[0] || 'None');
  document.getElementById('activeModel').textContent =
    settings.model || 'gpt-4o';
}

loadStatus();

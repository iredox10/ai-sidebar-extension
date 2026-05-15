chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'get-selection') {
    sendResponse({ text: window.getSelection().toString() });
  }
});

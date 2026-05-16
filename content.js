chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'get-selection') {
    sendResponse({ text: window.getSelection().toString() });
  }
  if (request.type === 'focus-page') {
    document.body.setAttribute('tabindex', '-1');
    document.body.focus({ preventScroll: true });
    window.focus();
    document.dispatchEvent(new Event('focus'));
  }
});

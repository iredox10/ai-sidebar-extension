const providerSelect = document.getElementById('providerSelect');
const modelSelect = document.getElementById('modelSelect');
const chatArea = document.getElementById('chatArea');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const settingsBtn = document.getElementById('settingsBtn');

const STORAGE_KEY = 'conversation_messages';

const modelsByProvider = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'o3-mini', label: 'o3 Mini' },
  ],
  anthropic: [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    { value: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
  ],
  google: [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
  ],
};

let messages = [];
let isProcessing = false;

async function init() {
  await loadConversation();

  const settings = await chrome.storage.sync.get([
    'provider', 'model', 'openaiKey', 'anthropicKey', 'googleKey'
  ]);

  if (settings.provider) providerSelect.value = settings.provider;
  updateModels();
  if (settings.model) {
    const exists = Array.from(modelSelect.options).some(o => o.value === settings.model);
    if (exists) modelSelect.value = settings.model;
  }

  providerSelect.addEventListener('change', () => {
    updateModels();
    chrome.storage.sync.set({ provider: providerSelect.value, model: modelSelect.value });
  });

  modelSelect.addEventListener('change', () => {
    chrome.storage.sync.set({ model: modelSelect.value });
  });

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);
  clearBtn.addEventListener('click', clearChat);
  settingsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());

  autoResizeInput();

  const data = await chrome.storage.local.get('selectedText');
  if (data.selectedText) {
    messages.push({ role: 'user', content: `About this text: "${data.selectedText}"` });
    await chrome.storage.local.remove('selectedText');
    await persistConversation();
    renderMessages();
  }
}

function updateModels() {
  const provider = providerSelect.value;
  const models = modelsByProvider[provider] || modelsByProvider.openai;
  modelSelect.innerHTML = models.map(m => `<option value="${m.value}">${m.label}</option>`).join('');
}

function autoResizeInput() {
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
  });
}

async function persistConversation() {
  const toSave = messages.filter(m => m.role !== 'system');
  await chrome.storage.local.set({ [STORAGE_KEY]: toSave });
}

async function loadConversation() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  if (data[STORAGE_KEY] && data[STORAGE_KEY].length > 0) {
    messages = data[STORAGE_KEY];
    renderMessages();
    scrollToBottom();
  }
}

function addMessage(role, content) {
  messages.push({ role, content });
  renderMessages();
  scrollToBottom();
  persistConversation();
}

function renderMessages() {
  chatArea.innerHTML = messages.map((msg, i) => {
    if (msg.role === 'system') return '';
    const escaped = escapeHtml(msg.content);
    return `
      <div class="message ${msg.role === 'user' ? 'user' : 'ai'}">
        <div class="message-label">
          ${msg.role === 'user' ? 'You' : 'AI'}
          ${msg.role === 'assistant' ? `<button class="copy-btn" data-index="${i}" title="Copy response"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg></button>` : ''}
        </div>
        <div class="message-content">${formatContent(escaped)}</div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const msg = messages[idx];
      if (msg) {
        navigator.clipboard.writeText(msg.content);
        const orig = btn.innerHTML;
        btn.innerHTML = '<span style="font-size:10px">Copied</span>';
        setTimeout(() => btn.innerHTML = orig, 1500);
      }
    });
  });
}

function formatContent(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatArea.scrollTop = chatArea.scrollHeight;
  });
}

function showTyping() {
  chatArea.insertAdjacentHTML('beforeend', `
    <div class="message ai" id="typingIndicator">
      <div class="message-label">AI</div>
      <div class="message-content">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  `);
  scrollToBottom();
}

function hideTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function showError(errorMsg) {
  const id = 'error-' + Date.now();
  chatArea.insertAdjacentHTML('beforeend', `
    <div class="error-msg" id="${id}">
      <div style="margin-bottom:8px">${escapeHtml(errorMsg)}</div>
      <button class="btn btn-sm btn-primary retry-btn" data-error-id="${id}">Retry</button>
    </div>
  `);
  scrollToBottom();

  document.querySelector(`#${id} .retry-btn`).addEventListener('click', () => {
    document.getElementById(id)?.remove();
    sendMessage();
  });
}

async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || isProcessing) return;

  messageInput.value = '';
  messageInput.style.height = 'auto';

  removeLastError();
  addMessage('user', text);

  isProcessing = true;
  sendBtn.disabled = true;
  showTyping();

  try {
    const result = await chrome.runtime.sendMessage({
      type: 'chat',
      provider: providerSelect.value,
      model: modelSelect.value,
      messages: messages.filter(m => m.role !== 'system')
    });

    hideTyping();

    if (result.ok) {
      addMessage('assistant', result.data.content);
    } else {
      showError(result.error || 'Request failed');
    }
  } catch (err) {
    hideTyping();
    showError(err.message || 'Connection failed');
  } finally {
    isProcessing = false;
    sendBtn.disabled = false;
    messageInput.focus();
  }
}

function removeLastError() {
  const errors = chatArea.querySelectorAll('.error-msg');
  if (errors.length > 0) errors[errors.length - 1].remove();
}

function clearChat() {
  messages = [];
  chatArea.innerHTML = '';
  chrome.storage.local.remove(STORAGE_KEY);
  messageInput.focus();
}

init();

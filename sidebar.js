const providerSelect = document.getElementById('providerSelect');
const modelSelect = document.getElementById('modelSelect');
const chatArea = document.getElementById('chatArea');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const settingsBtn = document.getElementById('settingsBtn');
const newChatBtn = document.getElementById('newChatBtn');
const historyToggle = document.getElementById('historyToggle');
const historyPanel = document.getElementById('historyPanel');
const historyOverlay = document.getElementById('historyOverlay');
const historyClose = document.getElementById('historyClose');
const historyList = document.getElementById('historyList');
const historyNewBtn = document.getElementById('historyNewBtn');

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
    { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash' },
    { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  ],
};

let activeChatId = null;
let chatHistory = [];
let isProcessing = false;
let historyOpen = false;

async function init() {
  await loadHistory();
  await loadOrCreateActiveChat();

  const settings = await chrome.storage.sync.get(['provider', 'model']);
  if (settings.provider) providerSelect.value = settings.provider;
  if (settings.model) {
    updateModels();
    const exists = Array.from(modelSelect.options).some(o => o.value === settings.model);
    if (exists) modelSelect.value = settings.model;
  } else {
    updateModels();
  }

  providerSelect.addEventListener('change', () => {
    updateModels();
    chrome.storage.sync.set({ provider: providerSelect.value, model: modelSelect.value });
  });
  modelSelect.addEventListener('change', () => {
    chrome.storage.sync.set({ model: modelSelect.value });
  });

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  sendBtn.addEventListener('click', sendMessage);
  newChatBtn.addEventListener('click', newChat);
  settingsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());

  historyToggle.addEventListener('click', toggleHistory);
  historyClose.addEventListener('click', closeHistory);
  historyOverlay.addEventListener('click', closeHistory);
  historyNewBtn.addEventListener('click', () => { closeHistory(); newChat(); });

  const chat = getActiveChat();
  messages = chat ? [...chat.messages] : [];
  if (messages.length) renderMessages();

  autoResizeInput();

  const selData = await chrome.storage.local.get('selectedText');
  if (selData.selectedText) {
    const text = selData.selectedText;
    await chrome.storage.local.remove('selectedText');
    messages.push({ role: 'user', content: `About this text: "${text}"` });
    await saveCurrentChat();
    renderMessages();
  }

  if (!messages.length) showEmptyState();
}

// ---- Storage / Data ----

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function getActiveChat() {
  return chatHistory.find(c => c.id === activeChatId) || chatHistory[0];
}

async function loadHistory() {
  const data = await chrome.storage.local.get('chat_history');
  chatHistory = data.chat_history || [];
}

async function saveHistory() {
  await chrome.storage.local.set({ chat_history: chatHistory });
}

async function loadOrCreateActiveChat() {
  const data = await chrome.storage.local.get('active_chat_id');
  activeChatId = data.active_chat_id || null;

  if (activeChatId && chatHistory.some(c => c.id === activeChatId)) return;

  if (chatHistory.length > 0) {
    activeChatId = chatHistory[0].id;
    await chrome.storage.local.set({ active_chat_id: activeChatId });
  } else {
    createNewChat();
  }
}

function createNewChat() {
  const chat = {
    id: generateId(),
    title: 'New Chat',
    messages: [],
    timestamp: Date.now(),
    provider: providerSelect.value,
    model: modelSelect.value,
  };
  chatHistory.unshift(chat);
  activeChatId = chat.id;
  saveHistory();
  chrome.storage.local.set({ active_chat_id: activeChatId });
  return chat;
}

async function saveCurrentChat() {
  const chat = getActiveChat();
  if (!chat) return;
  chat.messages = messages.filter(m => m.role !== 'system');
  chat.timestamp = Date.now();
  chat.provider = providerSelect.value;
  chat.model = modelSelect.value;
  if (chat.messages.length > 0 && chat.title === 'New Chat') {
    const first = chat.messages.find(m => m.role === 'user');
    if (first) chat.title = first.content.slice(0, 50) + (first.content.length > 50 ? '...' : '');
  }
  saveHistory();
}

function switchToChat(chatId) {
  if (isProcessing) return;
  saveCurrentChat();
  activeChatId = chatId;
  chrome.storage.local.set({ active_chat_id: chatId });
  const chat = getActiveChat();
  messages = chat ? [...chat.messages] : [];
  renderMessages();
  scrollToBottom();
  if (!messages.length) showEmptyState();
  closeHistory();
}

async function deleteChat(chatId) {
  const idx = chatHistory.findIndex(c => c.id === chatId);
  if (idx === -1) return;
  chatHistory.splice(idx, 1);
  await saveHistory();

  if (activeChatId === chatId) {
    if (chatHistory.length > 0) {
      switchToChat(chatHistory[0].id);
    } else {
      createNewChat();
      messages = [];
      renderMessages();
      showEmptyState();
      closeHistory();
    }
  }
  renderHistoryList();
}

async function newChat() {
  if (isProcessing) return;
  saveCurrentChat();
  createNewChat();
  messages = [];
  renderMessages();
  showEmptyState();
  updateModelBar();
}

function updateModelBar() {
  const chat = getActiveChat();
  if (chat) {
    if (chat.provider) providerSelect.value = chat.provider;
    updateModels();
    if (chat.model) {
      const exists = Array.from(modelSelect.options).some(o => o.value === chat.model);
      if (exists) modelSelect.value = chat.model;
    }
  }
}

// ---- History Panel ----

function toggleHistory() {
  historyOpen ? closeHistory() : openHistory();
}

function openHistory() {
  historyOpen = true;
  historyPanel.classList.add('open');
  historyOverlay.classList.add('open');
  historyToggle.classList.add('active');
  renderHistoryList();
}

function closeHistory() {
  historyOpen = false;
  historyPanel.classList.remove('open');
  historyOverlay.classList.remove('open');
  historyToggle.classList.remove('active');
}

function renderHistoryList() {
  if (chatHistory.length === 0) {
    historyList.innerHTML = `
      <div style="text-align:center;padding:40px 20px;color:var(--text-muted);font-size:13px;">
        No conversations yet.<br>Start a new chat to begin.
      </div>
    `;
    return;
  }

  const groups = groupByDate(chatHistory);
  let html = '';
  for (const [label, items] of Object.entries(groups)) {
    html += `<div class="history-date-heading">${label}</div>`;
    for (const chat of items) {
      const isActive = chat.id === activeChatId;
      const timeStr = formatTime(chat.timestamp);
      html += `
        <div class="history-item ${isActive ? 'active' : ''}" data-id="${chat.id}">
          <div class="h-item-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg>
          </div>
          <div class="h-item-info">
            <div class="h-item-title">${escapeHtml(chat.title)}</div>
            <div class="h-item-meta">${timeStr} · ${chat.provider}</div>
          </div>
          <button class="h-item-delete" data-id="${chat.id}" title="Delete">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
          </button>
        </div>
      `;
    }
  }
  historyList.innerHTML = html;

  historyList.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.h-item-delete')) return;
      switchToChat(el.dataset.id);
    });
  });

  historyList.querySelectorAll('.h-item-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteChat(btn.dataset.id);
    });
  });
}

function groupByDate(chats) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const weekAgo = today - 7 * 86400000;

  const groups = { Today: [], Yesterday: [], 'This Week': [], Older: [] };

  for (const chat of chats) {
    const t = chat.timestamp;
    if (t >= today) groups.Today.push(chat);
    else if (t >= yesterday) groups.Yesterday.push(chat);
    else if (t >= weekAgo) groups['This Week'].push(chat);
    else groups.Older.push(chat);
  }

  const result = {};
  for (const [label, items] of Object.entries(groups)) {
    if (items.length) result[label] = items;
  }
  return result;
}

function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ---- Messages ----

let messages = [];

function addMessage(role, content) {
  messages.push({ role, content });
  appendMessage(role, content);
  scrollToBottom();
  saveCurrentChat();
}

function appendMessage(role, content) {
  const div = document.createElement('div');
  div.className = `msg-group ${role}`;
  const isUser = role === 'user';

  const meta = document.createElement('div');
  meta.className = 'msg-meta';
  meta.textContent = isUser ? 'You' : 'AI';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = formatContent(escapeHtml(content));

  div.appendChild(meta);
  div.appendChild(bubble);

  if (!isUser) {
    const actions = document.createElement('div');
    actions.className = 'msg-actions';
    actions.innerHTML = `<button class="copy-btn" title="Copy"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg></button>`;
    actions.querySelector('.copy-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(content);
      const btn = actions.querySelector('.copy-btn');
      btn.innerHTML = '<span style="font-size:10px;color:var(--accent)">Copied</span>';
      setTimeout(() => {
        btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>`;
      }, 1500);
    });
    div.appendChild(actions);
  }
  chatArea.appendChild(div);
  removeEmptyState();
}

function renderMessages() {
  chatArea.innerHTML = '';
  messages.forEach(msg => {
    if (msg.role === 'system') return;
    appendMessage(msg.role, msg.content);
  });
}

function formatContent(text) {
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
    })
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
  });
}

function removeEmptyState() {
  const empty = chatArea.querySelector('.empty-state');
  if (empty) empty.remove();
}

function showEmptyState() {
  chatArea.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg>
      </div>
      <h3>Start a conversation</h3>
      <p>Ask anything or right-click text on any page to analyze it with AI.</p>
    </div>
  `;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'msg-group ai';
  div.id = 'typingIndicator';
  div.innerHTML = `<div class="msg-meta">AI</div><div class="msg-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
  chatArea.appendChild(div);
  scrollToBottom();
}

function hideTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function showError(errorMsg) {
  const div = document.createElement('div');
  div.className = 'error-msg';
  div.innerHTML = `<div>${escapeHtml(errorMsg)}</div><button class="btn btn-xs retry-btn">Retry</button>`;
  div.querySelector('.retry-btn').addEventListener('click', () => { div.remove(); sendMessage(); });
  chatArea.appendChild(div);
  scrollToBottom();
}

async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || isProcessing) return;

  messageInput.value = '';
  messageInput.style.height = 'auto';

  const lastError = chatArea.querySelector('.error-msg:last-child');
  if (lastError) lastError.remove();

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

function autoResizeInput() {
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 100) + 'px';
  });
}

function updateModels() {
  const provider = providerSelect.value;
  const models = modelsByProvider[provider] || modelsByProvider.openai;
  modelSelect.innerHTML = models.map(m => `<option value="${m.value}">${m.label}</option>`).join('');
}

init();

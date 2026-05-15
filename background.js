chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'ask-ai',
      title: 'Ask AI Sidebar',
      contexts: ['selection']
    });
  });
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(() => {});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'ask-ai' && info.selectionText) {
    chrome.storage.local.set({ selectedText: info.selectionText }, () => {
      chrome.sidePanel.open({ windowId: tab.windowId });
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ask-ai') {
    chrome.storage.local.set({ selectedText: request.text }, () => {
      chrome.sidePanel.open({ windowId: sender.tab.windowId });
    });
    sendResponse({ ok: true });
    return true;
  }

  if (request.type === 'chat') {
    handleChat(request, sendResponse);
    return true;
  }
});

async function handleChat(request, sendResponse) {
  try {
    const settings = await chrome.storage.sync.get([
      'openaiKey', 'anthropicKey', 'googleKey',
      'provider', 'model', 'systemPrompt'
    ]);

    const provider = request.provider || settings.provider || 'openai';
    const model = request.model || settings.model || 'gpt-4o';
    const systemPrompt = request.systemPrompt || settings.systemPrompt || 'You are a helpful assistant.';
    const temperature = request.temperature ?? 0.7;

    let result;
    switch (provider) {
      case 'openai':
        result = await callOpenAI(settings.openaiKey, model, systemPrompt, request.messages, temperature);
        break;
      case 'anthropic':
        result = await callAnthropic(settings.anthropicKey, model, systemPrompt, request.messages, temperature);
        break;
      case 'google':
        result = await callGoogle(settings.googleKey, model, systemPrompt, request.messages, temperature);
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    sendResponse({ ok: true, data: result });
  } catch (err) {
    sendResponse({ ok: false, error: err.message });
  }
}

async function callOpenAI(apiKey, model, systemPrompt, messages, temperature) {
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const body = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ],
    temperature,
    stream: false
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI error: ${res.status}`);
  }

  const data = await res.json();
  return {
    content: data.choices[0].message.content,
    model: data.model,
    usage: data.usage
  };
}

async function callAnthropic(apiKey, model, systemPrompt, messages, temperature) {
  if (!apiKey) throw new Error('Anthropic API key not configured');

  const body = {
    model,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    max_tokens: 4096,
    temperature
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic error: ${res.status}`);
  }

  const data = await res.json();
  return {
    content: data.content[0].text,
    model: data.model,
    usage: data.usage
  };
}

async function callGoogle(apiKey, model, systemPrompt, messages, temperature) {
  if (!apiKey) throw new Error('Google API key not configured');

  const contents = [];
  for (const m of messages) {
    contents.push({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    });
  }

  const body = {
    contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    let msg = err.error?.message || `Google error: ${res.status}`;
    if (msg.includes('quota') || msg.includes('QUOTA') || msg.includes('Quota')) {
      msg += '\n\nTip: Try a model with higher free limits like Gemini 2.5 Flash Lite, or enable billing at console.cloud.google.com';
    }
    throw new Error(msg);
  }

  const data = await res.json();
  return {
    content: data.candidates[0].content.parts[0].text,
    model: model,
    usage: null
  };
}

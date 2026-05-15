const saveBtn = document.getElementById('saveBtn');

document.querySelectorAll('.toggle-vis').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.textContent = isPassword ? 'Hide' : 'Show';
  });
});

document.getElementById('temperature').addEventListener('input', (e) => {
  document.getElementById('tempValue').textContent = e.target.value;
});

document.getElementById('provider').addEventListener('change', (e) => {
  const models = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o3-mini'],
    anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-opus-4-20250514'],
    google: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'],
  };
  const modelSelect = document.getElementById('model');
  const currentVal = modelSelect.value;
  const providerModels = models[e.target.value] || models.openai;

  const visible = new Set(providerModels);
  Array.from(modelSelect.options).forEach(opt => {
    opt.style.display = visible.has(opt.value) ? '' : 'none';
  });

  if (!visible.has(currentVal)) {
    modelSelect.value = providerModels[0];
  }
});

async function loadSettings() {
  const settings = await chrome.storage.sync.get([
    'openaiKey', 'anthropicKey', 'googleKey',
    'provider', 'model', 'systemPrompt', 'temperature'
  ]);

  const keyFields = ['openaiKey', 'anthropicKey', 'googleKey'];
  keyFields.forEach(key => {
    const el = document.getElementById(key);
    if (settings[key]) {
      el.value = settings[key];
      updateStatus(key, true);
    }
  });

  if (settings.provider) document.getElementById('provider').value = settings.provider;
  if (settings.model) document.getElementById('model').value = settings.model;
  if (settings.systemPrompt) document.getElementById('systemPrompt').value = settings.systemPrompt;
  if (settings.temperature != null) {
    document.getElementById('temperature').value = settings.temperature;
    document.getElementById('tempValue').textContent = settings.temperature;
  }

  document.getElementById('provider').dispatchEvent(new Event('change'));
}

function updateStatus(key, saved) {
  const el = document.getElementById(key.replace('Key', 'Status'));
  if (!el) return;
  el.className = `status-badge ${saved ? 'saved' : 'unsaved'}`;
  el.textContent = saved ? 'Saved' : 'Not saved';
}

saveBtn.addEventListener('click', async () => {
  const data = {
    openaiKey: document.getElementById('openaiKey').value.trim(),
    anthropicKey: document.getElementById('anthropicKey').value.trim(),
    googleKey: document.getElementById('googleKey').value.trim(),
    provider: document.getElementById('provider').value,
    model: document.getElementById('model').value,
    systemPrompt: document.getElementById('systemPrompt').value.trim(),
    temperature: parseFloat(document.getElementById('temperature').value),
  };

  // Remove empty keys so they don't override null in storage
  Object.keys(data).forEach(k => {
    if (data[k] === '') data[k] = undefined;
  });

  await chrome.storage.sync.set(data);

  ['openaiKey', 'anthropicKey', 'googleKey'].forEach(key => {
    updateStatus(key, !!data[key]);
  });

  saveBtn.textContent = 'Saved!';
  setTimeout(() => { saveBtn.textContent = 'Save Settings'; }, 2000);
});

loadSettings();
